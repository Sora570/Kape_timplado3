<?php
// db/products_getAll.php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db_connect.php';

$sql = "SELECT
            p.productID,
            p.productName,
            p.categoryID,
            p.isActive,
            p.image_url,
            p.createdAt AS created_at,
            p.unit_type,
            c.categoryName
        FROM products p
        JOIN categories c ON p.categoryID = c.categoryID
        ORDER BY p.categoryID, p.productID";

$res = $conn->query($sql);
$out = [];

if ($res) {
    while ($row = $res->fetch_assoc()) {
        $pid = (int)$row['productID'];

        // Fetch sizes + price per size-unit for this product
        $sstmt = $conn->prepare("
            SELECT s.sizeID, s.sizeName, COALESCE(pp.price, s.defaultPrice) AS price, pp.unit_id, pu.unit_name, pu.unit_symbol
            FROM sizes s
            LEFT JOIN product_prices pp ON s.sizeID = pp.sizeID AND pp.productID = ?
            LEFT JOIN product_units pu ON pp.unit_id = pu.unit_id
            ORDER BY s.sizeID, pp.unit_id
        ");
        $sstmt->bind_param('i', $pid);
        $sstmt->execute();
        $sres = $sstmt->get_result();

        $sizes = [];
        while ($s = $sres->fetch_assoc()) {
            $sizes[] = $s;
        }
        $row['sizes'] = $sizes;

        $out[] = $row;
    }
}

echo json_encode($out, JSON_UNESCAPED_UNICODE | JSON_NUMERIC_CHECK);
