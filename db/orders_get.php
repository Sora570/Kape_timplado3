<?php
header('Content-Type: application/json');
require_once __DIR__ . '/db_connect.php';

$out = ['pending' => [], 'completed' => []];

$sql = "SELECT o.orderID, o.customerID, o.paymentMethod, o.status, o.createdAt,
               GROUP_CONCAT(CONCAT(p.productName,' x',oi.quantity, IFNULL(CONCAT(' (',s.sizeName,')'),'')) SEPARATOR ', ') as items,
               SUM(oi.price * oi.quantity) as totalAmount
        FROM orders o
        JOIN order_items oi ON o.orderID = oi.orderID
        JOIN products p ON oi.productID = p.productID
        LEFT JOIN sizes s ON oi.sizeID = s.sizeID
        GROUP BY o.orderID
        ORDER BY o.createdAt DESC";

$res = $conn->query($sql);
while ($row = $res->fetch_assoc()) {
    if ($row['status'] === 'pending') {
        $out['pending'][] = $row;
    } elseif ($row['status'] === 'completed') {
        $out['completed'][] = $row;
    }
}
echo json_encode($out);