<?php
session_start();
$_SESSION['role'] = 'admin';  // Simulate admin login

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/db_connect.php';

$filterType = $_GET['type'] ?? 'all';
$filterDate = $_GET['date'] ?? date('Y-m-d'); 
$startDate = $_GET['start_date'] ?? null;
$endDate = $_GET['end_date'] ?? null;
$limit = intval($_GET['limit'] ?? 50);

$where = [];
$params = [];

if ($filterType !== 'all') {
    $where[] = 'o.status = ?';
    $params[] = $filterType;
}

$date_field = 'o.createdAt';
if ($startDate || $endDate) {
    if ($startDate && $endDate) {
        $where[] = "DATE($date_field) BETWEEN ? AND ?";
        $params[] = $startDate;
        $params[] = $endDate;
    } else {
        $where_cond = ($startDate) ?
            "DATE($date_field) >= ?" :
            "DATE($date_field) <= ?";
        $where[] = $where_cond;
        $params[] = ($startDate) ?? $endDate;
    }
} else if (empty($startDate) && empty($endDate) && $filterDate) {
    $where[] = 'DATE(o.createdAt) = ?';
    $params[] = $filterDate;
}

$where_clause = implode(' AND ', $where);

$query_sql = "
    SELECT
        o.orderID,
        o.totalAmount,
        o.payment_method,
        o.status,
        o.createdAt as order_date,
        o.customerId,
        c.name as customer_name,
        u.employee_id as cashier_id,
        SUM(oi.quantity) as item_count
    FROM orders o
    LEFT JOIN customers c ON o.customerId = c.customerId
    LEFT JOIN users u ON u.userID = o.userID
    LEFT JOIN order_items oi ON o.orderID = oi.orderID
    " . ($where_clause ? "WHERE $where_clause" : '') . "
    GROUP BY o.orderID
    ORDER BY o.createdAt DESC
    LIMIT ?
";
$params[] = $limit;

echo "Debug - Query: " . $query_sql . "\n";
echo "Debug - Params: " . print_r($params, true) . "\n";

$stmt = $conn->prepare($query_sql);
if ($stmt === false) {
    throw new Exception("Prepare failed: " . $conn->error);
}

$types = str_repeat('s', count($params)-1) . 'i';
echo "Debug - Types: " . $types . "\n";

$stmt->bind_param($types, ...$params);
$stmt->execute();
$result = $stmt->get_result();
$transactions = [];

while($row = $result->fetch_assoc()){
    $transactions[] = $row;
}
echo "Debug - Transactions count: " . count($transactions) . "\n";
$stmt->close();

// Summary
$summary_q = "
    SELECT
     COUNT(o.orderID) as transaction_count,
     COALESCE(SUM(o.totalAmount),0) as total_revenue
     FROM orders o
     " . ($where_clause ? "WHERE $where_clause" : '') . "
";
$summary_params = array_slice($params, 0, -1);
echo "Debug - Summary Query: " . $summary_q . "\n";
echo "Debug - Summary Params: " . print_r($summary_params, true) . "\n";

$summary_stmt = $conn->prepare($summary_q);
if ($summary_stmt === false) {
    throw new Exception("Summary prepare failed: " . $conn->error);
}
if (!empty($summary_params)) {
    $param_types = str_repeat('s', count($summary_params));
    $summary_stmt->bind_param($param_types, ...$summary_params);
}
$summary_stmt->execute();
$summary = $summary_stmt->get_result()->fetch_array();
echo "Debug - Summary: " . print_r($summary, true) . "\n";
$summary_stmt->close();

echo json_encode(array(
    'status' => 'ok',
    'transactions' => $transactions,
    'count' => intval($summary[0] ?? 0),
    'total_revenue' => floatval($summary[1] ?? 0)
));

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    if (isset($conn)) {
        echo "SQL Error: " . $conn->error . "\n";
        echo "SQL State: " . $conn->sqlstate . "\n";
        echo "Error Code: " . $conn->errno . "\n";
    }
}

$conn->close();
?>
