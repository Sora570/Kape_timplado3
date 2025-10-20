<?php
require_once 'db/db_connect.php';

try {
    // Check if audit_logs table exists
    $result = $conn->query("SHOW TABLES LIKE 'audit_logs'");
    if ($result->num_rows == 0) {
        echo "audit_logs table does not exist.\n";
        $conn->close();
        exit;
    }

    // Get count of audit logs
    $result = $conn->query("SELECT COUNT(*) as count FROM audit_logs");
    $row = $result->fetch_assoc();
    echo "Audit logs count: " . $row['count'] . "\n";

    // If there are logs, show a few recent ones
    if ($row['count'] > 0) {
        echo "\nRecent audit logs:\n";
        $result = $conn->query("SELECT al.*, u.username FROM audit_logs al LEFT JOIN users u ON al.userID = u.userID ORDER BY al.created_at DESC LIMIT 5");
        while ($row = $result->fetch_assoc()) {
            echo "- " . $row['created_at'] . " | " . ($row['username'] ?: 'System') . " | " . $row['action'] . " | " . ($row['details'] ?: '') . "\n";
        }
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

$conn->close();
?>
