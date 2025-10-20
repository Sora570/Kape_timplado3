<?php
require_once 'db/db_connect.php';

$employeeId = 'jane_doe'; // Using username instead of employee_id
$pin = '1234';

$stmt = $conn->prepare("SELECT userID, username, role, pin_hash, employee_id FROM users WHERE (employee_id = ? OR username = ?) AND is_active = 1");
$stmt->bind_param("ss", $employeeId, $employeeId);
$stmt->execute();
$result = $stmt->get_result();

if ($result && $result->num_rows > 0) {
    $user = $result->fetch_assoc();
    echo "User found: " . $user['username'] . "\n";
    echo "Role: " . $user['role'] . "\n";
    echo "Employee ID: " . $user['employee_id'] . "\n";
    
    if (!empty($user['pin_hash'])) {
        if (password_verify($pin, $user['pin_hash'])) {
            echo "PIN verified successfully.\n";
        } else {
            echo "PIN verification failed.\n";
        }
    } else {
        echo "No PIN hash found.\n";
    }
} else {
    echo "No user found for input: $employeeId\n";
}

$conn->close();
?>
