<?php
session_start();

echo "<h1>Session Test</h1>";

echo "<h2>Session Configuration</h2>";
echo "<p>Session ID: " . session_id() . "</p>";
echo "<p>Session Name: " . session_name() . "</p>";
echo "<p>Session Save Path: " . session_save_path() . "</p>";
echo "<p>Session Cookie Params:</p>";
$cookieParams = session_get_cookie_params();
echo "<pre>";
print_r($cookieParams);
echo "</pre>";

echo "<h2>Current Session Data</h2>";
if (empty($_SESSION)) {
    echo "<p style='color: red;'>❌ Session is empty</p>";
} else {
    echo "<pre>";
    print_r($_SESSION);
    echo "</pre>";
}

echo "<h2>Test Session Setting</h2>";
if (isset($_POST['test_session'])) {
    $_SESSION['test'] = 'Session working!';
    $_SESSION['timestamp'] = time();
    echo "<p style='color: green;'>✅ Test session data set</p>";
    echo "<p><a href='session_test.php'>Refresh to see session data</a></p>";
}

echo "<form method='POST'>";
echo "<button type='submit' name='test_session'>Test Session Setting</button>";
echo "</form>";

echo "<h2>Quick Login Test</h2>";
echo "<form method='POST'>";
echo "<input type='text' name='username' placeholder='Username' value='admin'>";
echo "<input type='password' name='password' placeholder='Password' value='password'>";
echo "<button type='submit' name='test_login'>Test Login</button>";
echo "</form>";

if (isset($_POST['test_login'])) {
    require_once 'db/db_connect.php';
    
    $username = $_POST['username'];
    $password = $_POST['password'];
    
    $stmt = $conn->prepare("SELECT userID, username, passwordHash, role FROM users WHERE username = ? LIMIT 1");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $res = $stmt->get_result();
    
    if ($row = $res->fetch_assoc()) {
        if (password_verify($password, $row['passwordHash'])) {
            $_SESSION['userID'] = $row['userID'];
            $_SESSION['username'] = $row['username'];
            $_SESSION['role'] = $row['role'];
            
            echo "<p style='color: green;'>✅ Login successful! Session updated.</p>";
            echo "<p><a href='session_test.php'>Refresh to see updated session</a></p>";
            echo "<p><a href='index.php'>Try accessing index.php</a></p>";
        } else {
            echo "<p style='color: red;'>❌ Password verification failed</p>";
        }
    } else {
        echo "<p style='color: red;'>❌ User not found</p>";
    }
    
    $conn->close();
}
?>
