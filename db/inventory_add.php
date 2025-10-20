<?php
// db/inventory_add.php
require_once __DIR__ . '/db_connect.php';
header('Content-Type: application/json');

$productID = intval($_POST['productID'] ?? 0);
$sizeID = intval($_POST['sizeID'] ?? 0);
$currentStock = intval($_POST['currentStock'] ?? 0);
$minStock = intval($_POST['minStock'] ?? 0);
$maxStock = intval($_POST['maxStock'] ?? 0);
$costPrice = floatval($_POST['costPrice'] ?? 0);
$sellingPrice = floatval($_POST['sellingPrice'] ?? 0);
$profitMargin = floatval($_POST['profitMargin'] ?? 0);
$totalValue = floatval($_POST['totalValue'] ?? 0);

// Validate input
if (!$productID || !$sizeID) {
    echo json_encode(['status' => 'error', 'message' => 'Missing product or size']);
    exit;
}

if ($currentStock < 0 || $minStock < 0 || $maxStock < 0) {
    echo json_encode(['status' => 'error', 'message' => 'Stock values cannot be negative']);
    exit;
}

if ($minStock > $maxStock) {
    echo json_encode(['status' => 'error', 'message' => 'Minimum stock cannot be greater than maximum stock']);
    exit;
}

if ($costPrice < 0 || $sellingPrice < 0) {
    echo json_encode(['status' => 'error', 'message' => 'Prices cannot be negative']);
    exit;
}

$conn->begin_transaction();

try {
    // Check if inventory entry already exists
    $checkStmt = $conn->prepare("SELECT inventoryID FROM inventory WHERE productID = ? AND sizeID = ?");
    $checkStmt->bind_param('ii', $productID, $sizeID);
    $checkStmt->execute();
    $existing = $checkStmt->get_result()->fetch_assoc();
    
    if ($existing) {
        echo json_encode(['status' => 'error', 'message' => 'Inventory entry already exists for this product and size']);
        exit;
    }
    
    // Insert new inventory entry
    $stmt = $conn->prepare("INSERT INTO inventory (productID, sizeID, currentStock, minStock, maxStock, costPrice, sellingPrice, profitMargin, totalValue) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param('iiiiidddd', $productID, $sizeID, $currentStock, $minStock, $maxStock, $costPrice, $sellingPrice, $profitMargin, $totalValue);
    
    if (!$stmt->execute()) {
        throw new Exception($stmt->error);
    }
    
    $inventoryID = $conn->insert_id;
    
    // Log the initial stock entry
    $logStmt = $conn->prepare("INSERT INTO inventory_history (inventoryID, changeType, previousStock, newStock, changeAmount, reason) VALUES (?, 'manual', 0, ?, ?, 'Initial stock entry')");
    $logStmt->bind_param('iii', $inventoryID, $currentStock, $currentStock);
    $logStmt->execute();
    
    $conn->commit();
    echo json_encode(['status' => 'success', 'message' => 'Inventory entry added successfully', 'inventoryID' => $inventoryID]);
    
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
