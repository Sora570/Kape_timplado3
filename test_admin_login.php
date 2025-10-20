<?php
session_start();
require_once 'db/db_connect.php';

$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

echo "<h2>Admin Login Test Result</h2>";

if (!$username || !$password) {
    echo "<p style='color: red;'>❌ Missing credentials</p>";
    exit;
}

$stmt = $conn->prepare("SELECT userID, username, passwordHash, role FROM users WHERE username = ? LIMIT 1");
$stmt->bind_param("s", $username);
$stmt->execute();
$res = $stmt->get_result();

if ($row = $res->fetch_assoc()) {
    if (password_verify($password, $row['passwordHash'])) {
        $_SESSION['userID'] = $row['userID'];
        $_SESSION['username'] = $row['username'];
        $_SESSION['role'] = $row['role'];
        
        echo "<p style='color: green;'>✅ Admin login successful!</p>";
        echo "<p>Session set:</p>";
        echo "<ul>";
        echo "<li>User ID: " . $row['userID'] . "</li>";
        echo "<li>Username: " . htmlspecialchars($row['username']) . "</li>";
        echo "<li>Role: " . htmlspecialchars($row['role']) . "</li>";
        echo "</ul>";
        
        echo "<p><a href='index.php' style='background: #7f5539; color: white; padding: 10px; text-decoration: none; border-radius: 5px;'>Access Dashboard</a></p>";
        echo "<p><a href='debug_index.php'>Check Session Status</a></p>";
        
    } else {
        echo "<p style='color: red;'>❌ Password verification failed</p>";
    }
} else {
    echo "<p style='color: red;'>❌ User not found</p>";
}

$conn->close();
?>
