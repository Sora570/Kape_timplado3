<?php
header('Content-Type: application/json');
require_once __DIR__ . '/db_connect.php';

$customerID = intval($_POST['customerID'] ?? 0) ?: null;
$paymentMethod = $_POST['paymentMethod'] ?? 'Cash';
$items = json_decode($_POST['items'] ?? '[]', true);

if (empty($items)) {
    echo json_encode(['status'=>'error','message'=>'No items']);
    exit;
}

$conn->begin_transaction();
try {
    $stmt = $conn->prepare("INSERT INTO orders (customerID, paymentMethod) VALUES (?, ?)");
    $stmt->bind_param('is', $customerID, $paymentMethod);
    $stmt->execute();
    $orderID = $conn->insert_id;

    $pstmt = $conn->prepare("INSERT INTO order_items (orderID, productID, sizeID, quantity, price) VALUES (?,?,?,?,?)");
    foreach ($items as $it) {
        $pid = intval($it['productID']);
        $sid = isset($it['sizeID']) ? intval($it['sizeID']) : null;
        $qty = intval($it['quantity']);
        $price = floatval($it['price']);
        $pstmt->bind_param('iiiid', $orderID, $pid, $sid, $qty, $price);
        $pstmt->execute();
    }

    $conn->commit();
    echo json_encode(['status'=>'success','orderID'=>$orderID]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['status'=>'error','message'=>$e->getMessage()]);
}
