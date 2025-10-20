<?php
require_once __DIR__ . '/db/db_connect.php';

// 1. Show CREATE TABLE for audit_logs
echo "=== AUDIT_LOGS TABLE SCHEMA ===\n";
$schema_query = "SHOW CREATE TABLE audit_logs";
$result = $conn->query($schema_query);
if ($result) {
    $row = $result->fetch_array(MYSQLI_NUM);
    echo $row[1] . "\n\n";
} else {
    echo "Error: " . $conn->error . "\n";
}

// 2. Find Jane Doe's userID
echo "=== JANE DOE USERID ===\n";
$user_query = "SELECT userID FROM users WHERE username = 'jane_doe'";
$user_result = $conn->query($user_query);
if ($user_row = $user_result->fetch_assoc()) {
    $jane_id = $user_row['userID'];
    echo "Jane Doe's userID: " . $jane_id . "\n";
} else {
    echo "Jane Doe not found.\n";
}

// 3. Recent audit logs for Jane Doe
echo "=== RECENT AUDIT LOGS FOR JANE DOE ===\n";
if (isset($jane_id)) {
    $log_query = "SELECT action, details, created_at FROM audit_logs WHERE userID = ? ORDER BY created_at DESC LIMIT 5";
    $stmt = $conn->prepare($log_query);
    $stmt->bind_param("i", $jane_id);
    $stmt->execute();
    $log_result = $stmt->get_result();
    while ($log = $log_result->fetch_assoc()) {
        echo "Action: " . $log['action'] . ", Details: " . $log['details'] . ", Time: " . $log['created_at'] . "\n";
    }
    $stmt->close();
} else {
    echo "No userID found.\n";
}

// 4. Check last_login in users
echo "=== LAST_LOGIN FOR JANE DOE ===\n";
if (isset($jane_id)) {
    $last_query = "SELECT last_login FROM users WHERE userID = ?";
    $stmt = $conn->prepare($last_query);
    $stmt->bind_param("i", $jane_id);
    $stmt->execute();
    $last_result = $stmt->get_result();
    if ($last_row = $last_result->fetch_assoc()) {
        echo "last_login: " . ($last_row['last_login'] ?? 'NULL') . "\n";
    }
    $stmt->close();
}

$conn->close();
?>
