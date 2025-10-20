<?php
// db/inventory_update.php
require_once __DIR__ . '/db_connect.php';
header('Content-Type: application/json');

$inventoryID = intval($_POST['inventoryID'] ?? 0);
$action = $_POST['action'] ?? '';

if (!$inventoryID) {
    echo json_encode(['status' => 'error', 'message' => 'Missing inventory ID']);
    exit;
}

$conn->begin_transaction();

try {
    // Get current inventory data
    $getStmt = $conn->prepare("SELECT * FROM inventory WHERE inventoryID = ?");
    $getStmt->bind_param('i', $inventoryID);
    $getStmt->execute();
    $currentData = $getStmt->get_result()->fetch_assoc();
    
    if (!$currentData) {
        throw new Exception('Inventory entry not found');
    }
    
    $updateFields = [];
    $updateValues = [];
    $types = '';
    
    switch ($action) {
        case 'update_stock':
            $newStock = intval($_POST['currentStock'] ?? 0);
            if ($newStock < 0) {
                throw new Exception('Stock cannot be negative');
            }
            
            $updateFields[] = 'currentStock = ?';
            $updateValues[] = $newStock;
            $types .= 'i';
            
            // Log the change
            $changeAmount = $newStock - $currentData['currentStock'];
            $logStmt = $conn->prepare("INSERT INTO inventory_history (inventoryID, changeType, previousStock, newStock, changeAmount, reason) VALUES (?, 'manual', ?, ?, ?, 'Manual stock update')");
            $logStmt->bind_param('iiii', $inventoryID, $currentData['currentStock'], $newStock, $changeAmount);
            $logStmt->execute();
            break;
            
        case 'update_min_stock':
            $newMinStock = intval($_POST['minStock'] ?? 0);
            if ($newMinStock < 0) {
                throw new Exception('Minimum stock cannot be negative');
            }
            if ($newMinStock > $currentData['maxStock']) {
                throw new Exception('Minimum stock cannot be greater than maximum stock');
            }
            
            $updateFields[] = 'minStock = ?';
            $updateValues[] = $newMinStock;
            $types .= 'i';
            break;
            
        case 'update_max_stock':
            $newMaxStock = intval($_POST['maxStock'] ?? 0);
            if ($newMaxStock < 0) {
                throw new Exception('Maximum stock cannot be negative');
            }
            if ($newMaxStock < $currentData['minStock']) {
                throw new Exception('Maximum stock cannot be less than minimum stock');
            }
            
            $updateFields[] = 'maxStock = ?';
            $updateValues[] = $newMaxStock;
            $types .= 'i';
            break;
            
        case 'update_cost_price':
            $newCostPrice = floatval($_POST['costPrice'] ?? 0);
            if ($newCostPrice < 0) {
                throw new Exception('Cost price cannot be negative');
            }
            
            $updateFields[] = 'costPrice = ?';
            $updateValues[] = $newCostPrice;
            $types .= 'd';
            
            // Recalculate profit margin and total value
            $sellingPrice = $currentData['sellingPrice'] ?? 0;
            $profitMargin = $sellingPrice > 0 ? (($sellingPrice - $newCostPrice) / $sellingPrice) * 100 : 0;
            $totalValue = $newCostPrice * $currentData['currentStock'];
            
            $updateFields[] = 'profitMargin = ?';
            $updateValues[] = $profitMargin;
            $types .= 'd';
            
            $updateFields[] = 'totalValue = ?';
            $updateValues[] = $totalValue;
            $types .= 'd';
            break;
            
        case 'update_selling_price':
            $newSellingPrice = floatval($_POST['sellingPrice'] ?? 0);
            if ($newSellingPrice < 0) {
                throw new Exception('Selling price cannot be negative');
            }
            
            $updateFields[] = 'sellingPrice = ?';
            $updateValues[] = $newSellingPrice;
            $types .= 'd';
            
            // Recalculate profit margin and total value
            $costPrice = $currentData['costPrice'] ?? 0;
            $profitMargin = $newSellingPrice > 0 ? (($newSellingPrice - $costPrice) / $newSellingPrice) * 100 : 0;
            $totalValue = $costPrice * $currentData['currentStock'];
            
            $updateFields[] = 'profitMargin = ?';
            $updateValues[] = $profitMargin;
            $types .= 'd';
            
            $updateFields[] = 'totalValue = ?';
            $updateValues[] = $totalValue;
            $types .= 'd';
            break;
            
        default:
            throw new Exception('Invalid action');
    }
    
    if (empty($updateFields)) {
        throw new Exception('No fields to update');
    }
    
    // Add inventoryID to the values array
    $updateValues[] = $inventoryID;
    $types .= 'i';
    
    // Build and execute update query
    $updateSql = "UPDATE inventory SET " . implode(', ', $updateFields) . " WHERE inventoryID = ?";
    $updateStmt = $conn->prepare($updateSql);
    $updateStmt->bind_param($types, ...$updateValues);
    
    if (!$updateStmt->execute()) {
        throw new Exception($updateStmt->error);
    }
    
    $conn->commit();
    echo json_encode(['status' => 'success', 'message' => 'Inventory updated successfully']);
    
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
