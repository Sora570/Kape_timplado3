<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/db_connect.php';

// Check if user is logged in
if (!isset($_SESSION['userID'])) {
    echo json_encode(['status' => 'error', 'message' => 'Not logged in']);
    exit;
}

$cartItems = json_decode($_POST['cartItems'] ?? '[]', true);
$paymentMethod = $_POST['paymentMethod'] ?? 'cash';
$cashReceived = floatval($_POST['cashReceived'] ?? 0);
$discountType = $_POST['discountType'] ?? 'none';
$discountPercentage = floatval($_POST['discountPercentage'] ?? 0);

if (empty($cartItems)) {
    echo json_encode(['status' => 'error', 'message' => 'No items in cart']);
    exit;
}

$conn->begin_transaction();

try {
    // Calculate totals
    $subtotal = 0;
    foreach ($cartItems as $item) {
        $subtotal += $item['totalPrice'];
    }
    
    $discountAmount = ($subtotal * $discountPercentage) / 100;
    $totalAmount = $subtotal - $discountAmount;
    
    // Create order
    $orderQuery = "INSERT INTO orders (customerID, paymentMethod, discount_type, discount_percentage, discount_amount, cash_received, change_given, status, createdAt) 
                   VALUES (NULL, ?, ?, ?, ?, ?, ?, 'completed', NOW())";
    
    $changeGiven = max(0, $cashReceived - $totalAmount);
    
    $stmt = $conn->prepare($orderQuery);
    $stmt->bind_param('ssdddd', $paymentMethod, $discountType, $discountPercentage, $discountAmount, $cashReceived, $changeGiven);
    $stmt->execute();
    $orderID = $conn->insert_id;
    
    // Add order items
    $itemQuery = "INSERT INTO order_items (orderID, productID, sizeID, quantity, price, addons) VALUES (?, ?, ?, ?, ?, ?)";
    $itemStmt = $conn->prepare($itemQuery);
    
    foreach ($cartItems as $item) {
        $addonsJson = json_encode($item['addons'] ?? []);
        $itemStmt->bind_param('iiidss', $orderID, $item['productID'], $item['sizeID'], $item['quantity'], $item['unitPrice'], $addonsJson);
        $itemStmt->execute();
    }
    
    // Create transaction record
    $transactionQuery = "INSERT INTO transactions (orderID, amount, paymentMethod, status, createdAt) VALUES (?, ?, ?, 'completed', NOW())";
    $transactionStmt = $conn->prepare($transactionQuery);
    $transactionStmt->bind_param('ids', $orderID, $totalAmount, $paymentMethod);
    $transactionStmt->execute();
    
    // Log audit activity
    if (file_exists(__DIR__ . '/audit_log.php')) {
        require_once __DIR__ . '/audit_log.php';
        logOrderActivity($conn, $_SESSION['userID'], 'order_completed', "Order ID: $orderID, Total: $totalAmount");
    }
    
    $conn->commit();
    
    echo json_encode([
        'status' => 'success',
        'orderID' => $orderID,
        'totalAmount' => $totalAmount,
        'changeGiven' => $changeGiven,
        'receipt' => [
            'orderID' => $orderID,
            'items' => $cartItems,
            'subtotal' => $subtotal,
            'discountAmount' => $discountAmount,
            'totalAmount' => $totalAmount,
            'paymentMethod' => $paymentMethod,
            'cashReceived' => $cashReceived,
            'changeGiven' => $changeGiven,
            'timestamp' => date('Y-m-d H:i:s')
        ]
    ]);
    
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

$conn->close();
?>
