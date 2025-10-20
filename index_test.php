<?php
session_start();

echo "<h1>Index.php Test</h1>";

echo "<h2>Session Check</h2>";
$hasUsername = isset($_SESSION['username']);
$hasValidRole = isset($_SESSION['role']) && in_array($_SESSION['role'], ['admin', 'cashier']);

echo "<p>Has username: " . ($hasUsername ? 'YES' : 'NO') . "</p>";
echo "<p>Has valid role: " . ($hasValidRole ? 'YES' : 'NO') . "</p>";

if ($hasUsername) {
    echo "<p>Username: " . htmlspecialchars($_SESSION['username']) . "</p>";
}

if (isset($_SESSION['role'])) {
    echo "<p>Role: " . htmlspecialchars($_SESSION['role']) . "</p>";
}

if ($hasUsername && $hasValidRole) {
    echo "<h2 style='color: green;'>✅ Session Valid - Dashboard Should Load</h2>";
    echo "<p>This means index.php should work properly.</p>";
    echo "<p><a href='index.php' style='background: #7f5539; color: white; padding: 10px; text-decoration: none; border-radius: 5px;'>Go to Real Index.php</a></p>";
} else {
    echo "<h2 style='color: red;'>❌ Session Invalid - Will Redirect to Login</h2>";
    echo "<p>This means index.php will redirect to login page.</p>";
    echo "<p><a href='loginRegister.html' style='background: #b08968; color: white; padding: 10px; text-decoration: none; border-radius: 5px;'>Go to Login</a></p>";
}

echo "<h2>Session Data</h2>";
echo "<pre>";
print_r($_SESSION);
echo "</pre>";

echo "<h2>Quick Fix</h2>";
echo "<form method='POST'>";
echo "<button type='submit' name='quick_login'>Quick Admin Login</button>";
echo "</form>";

if (isset($_POST['quick_login'])) {
    require_once 'db/db_connect.php';
    
    $stmt = $conn->prepare("SELECT userID, username, passwordHash, role FROM users WHERE username = 'admin' LIMIT 1");
    $stmt->execute();
    $res = $stmt->get_result();
    
    if ($row = $res->fetch_assoc()) {
        $_SESSION['userID'] = $row['userID'];
        $_SESSION['username'] = $row['username'];
        $_SESSION['role'] = $row['role'];
        
        echo "<p style='color: green;'>✅ Quick login successful! <a href='index_test.php'>Refresh</a></p>";
    }
    
    $conn->close();
}
?>
