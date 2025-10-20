<?php
session_start();

echo "<h1>Login Endpoints Test</h1>";

// Test admin login endpoint
echo "<h2>1. Test Admin Login Endpoint</h2>";
echo "<form method='POST' action='test_admin_login.php'>";
echo "<input type='text' name='username' placeholder='Username' value='admin'><br><br>";
echo "<input type='password' name='password' placeholder='Password' value='password'><br><br>";
echo "<button type='submit'>Test Admin Login</button>";
echo "</form>";

// Test cashier login endpoint
echo "<h2>2. Test Cashier Login Endpoint</h2>";
echo "<form method='POST' action='test_cashier_login.php'>";
echo "<input type='text' name='employeeId' placeholder='Employee ID' value='EMP001'><br><br>";
echo "<input type='password' name='pin' placeholder='PIN' value='password'><br><br>";
echo "<button type='submit'>Test Cashier Login</button>";
echo "</form>";

echo "<h2>3. Current Session Status</h2>";
if (isset($_SESSION['username'])) {
    echo "<p style='color: green;'>✅ Logged in as: " . htmlspecialchars($_SESSION['username']) . " (" . htmlspecialchars($_SESSION['role']) . ")</p>";
    echo "<p><a href='index.php'>Try Accessing Dashboard</a></p>";
} else {
    echo "<p style='color: red;'>❌ Not logged in</p>";
}
?>
