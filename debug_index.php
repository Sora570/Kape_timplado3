<?php
session_start();

echo "<h1>Index.php Debug</h1>";
echo "<h2>Session Information</h2>";

if (isset($_SESSION['username'])) {
    echo "<p style='color: green;'>✅ Username found: " . htmlspecialchars($_SESSION['username']) . "</p>";
} else {
    echo "<p style='color: red;'>❌ No username in session</p>";
}

if (isset($_SESSION['role'])) {
    echo "<p style='color: green;'>✅ Role found: " . htmlspecialchars($_SESSION['role']) . "</p>";
} else {
    echo "<p style='color: red;'>❌ No role in session</p>";
}

if (isset($_SESSION['userID'])) {
    echo "<p style='color: green;'>✅ User ID found: " . htmlspecialchars($_SESSION['userID']) . "</p>";
} else {
    echo "<p style='color: red;'>❌ No user ID in session</p>";
}

echo "<h2>Session Check</h2>";
$hasUsername = isset($_SESSION['username']);
$hasValidRole = isset($_SESSION['role']) && in_array($_SESSION['role'], ['admin', 'cashier']);

echo "<p>Has username: " . ($hasUsername ? 'YES' : 'NO') . "</p>";
echo "<p>Has valid role: " . ($hasValidRole ? 'YES' : 'NO') . "</p>";

if ($hasUsername && $hasValidRole) {
    echo "<p style='color: green; font-weight: bold;'>✅ Session is valid - should show dashboard</p>";
    echo "<p><a href='index.php' style='background: #7f5539; color: white; padding: 10px; text-decoration: none; border-radius: 5px;'>Try Accessing Index.php</a></p>";
} else {
    echo "<p style='color: red; font-weight: bold;'>❌ Session is invalid - will redirect to login</p>";
    echo "<p><a href='loginRegister.html' style='background: #b08968; color: white; padding: 10px; text-decoration: none; border-radius: 5px;'>Go to Login</a></p>";
}

echo "<h2>All Session Data</h2>";
echo "<pre>";
print_r($_SESSION);
echo "</pre>";

echo "<h2>Quick Login Test</h2>";
echo "<form method='POST' action='debug_index.php'>";
echo "<input type='hidden' name='test_login' value='1'>";
echo "<button type='submit' style='background: #7f5539; color: white; padding: 10px; border: none; border-radius: 5px;'>Test Admin Login</button>";
echo "</form>";

if (isset($_POST['test_login'])) {
    echo "<h3>Testing Admin Login...</h3>";
    
    require_once 'db/db_connect.php';
    
    $username = "admin";
    $password = "password";
    
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
            echo "<p>Session updated. <a href='debug_index.php'>Refresh this page</a> to see updated session.</p>";
        } else {
            echo "<p style='color: red;'>❌ Password verification failed</p>";
        }
    } else {
        echo "<p style='color: red;'>❌ User not found</p>";
    }
    
    $conn->close();
}
?>
