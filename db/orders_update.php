<?php
// db/orders_update.php
session_start();
header('Content-Type: text/plain');

$orderID = $_POST['orderID'] ?? '';
$status = $_POST['status'] ?? '';

if (empty($orderID) || empty($status)) {
    echo 'Missing order ID or status';
    exit;
}

require_once __DIR__ . '/db_connect.php';

try {
    // Update order status
    $stmt = $conn->prepare("UPDATE orders SET status = ?, updated_at = NOW() WHERE orderID = ?");
    $stmt->bind_param('si', $status, $orderID);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo 'success';
        } else {
            echo 'Order not found';
        }
    } else {
        echo 'Database error: ' . $stmt->error;
    }
    
} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage();
}
?>