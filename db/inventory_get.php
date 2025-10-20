<?php
// db/inventory_get.php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db_connect.php';

$sql = "SELECT 
            i.inventoryID,
            i.productID,
            p.productName,
            c.categoryID,
            c.categoryName,
            i.sizeID,
            s.sizeName,
            i.currentStock,
            i.minStock,
            i.maxStock,
            i.costPrice,
            i.sellingPrice,
            i.profitMargin,
            i.totalValue,
            i.lastUpdated
        FROM inventory i
        JOIN products p ON i.productID = p.productID
        JOIN categories c ON p.categoryID = c.categoryID
        JOIN sizes s ON i.sizeID = s.sizeID
        WHERE p.isActive = 1
        ORDER BY c.categoryName, p.productName, s.sizeID";

$res = $conn->query($sql);
$out = [];

if ($res) {
    while ($row = $res->fetch_assoc()) {
        $out[] = $row;
    }
}

echo json_encode($out, JSON_UNESCAPED_UNICODE | JSON_NUMERIC_CHECK);
?>
