<?php
// Simple database connection test
require_once 'db/db_connect.php';

echo "<h2>Database Connection Test</h2>";

if ($conn->connect_error) {
    echo "<p style='color: red;'>❌ Database connection failed: " . $conn->connect_error . "</p>";
} else {
    echo "<p style='color: green;'>✅ Database connection successful!</p>";
    
    // Test if users table exists
    $result = $conn->query("SHOW TABLES LIKE 'users'");
    if ($result && $result->num_rows > 0) {
        echo "<p style='color: green;'>✅ Users table exists</p>";
        
        // Check if there are any admin users
        $adminResult = $conn->query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
        if ($adminResult) {
            $adminCount = $adminResult->fetch_assoc()['count'];
            echo "<p style='color: blue;'>📊 Admin users in database: " . $adminCount . "</p>";
            
            if ($adminCount > 0) {
                // Show admin usernames (without passwords)
                $adminUsers = $conn->query("SELECT username, role FROM users WHERE role = 'admin'");
                echo "<p><strong>Admin users:</strong></p><ul>";
                while ($user = $adminUsers->fetch_assoc()) {
                    echo "<li>" . htmlspecialchars($user['username']) . " (" . htmlspecialchars($user['role']) . ")</li>";
                }
                echo "</ul>";
            }
        }
    } else {
        echo "<p style='color: red;'>❌ Users table does not exist</p>";
    }
    
    // Test audit_logs table
    $auditResult = $conn->query("SHOW TABLES LIKE 'audit_logs'");
    if ($auditResult && $auditResult->num_rows > 0) {
        echo "<p style='color: green;'>✅ Audit logs table exists</p>";
    } else {
        echo "<p style='color: orange;'>⚠️ Audit logs table does not exist</p>";
    }
}

$conn->close();
?>
