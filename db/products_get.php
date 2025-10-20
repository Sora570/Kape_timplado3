<?php
require_once 'db_connect.php';

header('Content-Type: application/json');

$sql = 'SELECT
p.productID, p.productName, p.categoryID,
s.sizeName, COALESCE(pp.price, s.defaultPrice) AS price
FROM products p
LEFT JOIN product_prices pp ON p.productID = pp.productID
LEFT JOIN sizes s ON pp.sizeID = s.sizeID
WHERE p.isActive = 1
ORDER BY p.productID, s.sizeID';

$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["error" => "SQL prepare failed: " . $conn->error]);
    exit;
}
$stmt->execute();
$res = $stmt->get_result();
 
$products = [];

while ($row = $res->fetch_assoc()) {
    $id = $row['productID'];
    
    if (!isset($products[$id])) { 
        $products[$id] = [
            'productID' => $row['productID'],
            'name' => $row['productName'],
            'categoryID' => $row['categoryID'],
            'image_url' => 'assest/image/no-image.png',
            'sizes' => []
        ];
    }
    
    if ($row['sizeName'] && $row['price']) {
        $products[$id]['sizes'][] = [
            'size_label' => $row['sizeName'],
            'price' => floatval($row['price'])
        ];
    }
}

$arr = array_values($products);

echo json_encode(["products" => $arr, "status" => "ok"]);
$conn->close(); 
?>