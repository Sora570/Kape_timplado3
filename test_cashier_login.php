<?php
session_start();
require_once 'db/db_connect.php';

$employeeId = $_POST['employeeId'] ?? '';
$pin = $_POST['pin'] ?? '';

echo "<h2>Cashier Login Test Result</h2>";

if (!$employeeId || !$pin) {
    echo "<p style='color: red;'>❌ Missing credentials</p>";
    exit;
}

$stmt = $conn->prepare("SELECT userID, username, role, pin_hash, employee_id FROM users WHERE (employee_id = ? OR username = ?) AND is_active = 1");
$stmt->bind_param("ss", $employeeId, $employeeId);
$stmt->execute();
$result = $stmt->get_result();

if ($result && $result->num_rows > 0) {
    $user = $result->fetch_assoc();
    
    if (empty($user['pin_hash']) || !password_verify($pin, $user['pin_hash'])) {
        echo "<p style='color: red;'>❌ Invalid PIN or Employee ID</p>";
        exit;
    }
    
    $_SESSION['userID'] = $user['userID'];
    $_SESSION['user_id'] = $user['userID'];
    $_SESSION['role'] = $user['role'];
    $_SESSION['userType'] = 'employee';
    $_SESSION['employee_id'] = $user['employee_id'];
    $_SESSION['username'] = $user['username'];
    
    echo "<p style='color: green;'>✅ Cashier login successful!</p>";
    echo "<p>Session set:</p>";
    echo "<ul>";
    echo "<li>User ID: " . $user['userID'] . "</li>";
    echo "<li>Username: " . htmlspecialchars($user['username']) . "</li>";
    echo "<li>Role: " . htmlspecialchars($user['role']) . "</li>";
    echo "<li>Employee ID: " . htmlspecialchars($user['employee_id']) . "</li>";
    echo "</ul>";
    
    echo "<p><a href='cashier.html' style='background: #7f5539; color: white; padding: 10px; text-decoration: none; border-radius: 5px;'>Access Cashier Dashboard</a></p>";
    echo "<p><a href='debug_index.php'>Check Session Status</a></p>";
    
} else {
    echo "<p style='color: red;'>❌ Invalid Employee ID or PIN</p>";
}

$conn->close();
?>
