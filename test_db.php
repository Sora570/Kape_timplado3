<?php
require_once __DIR__ . '/db/db_connect.php';

try {
    // Show all tables
    $result = $conn->query("SHOW TABLES");
    echo "Tables in database:\n";
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_array()) {
            echo "- " . $row[0] . "\n";
        }
    } else {
        echo "No tables found.\n";
    }

    // Check if orders table exists and describe it
    $result = $conn->query("SHOW TABLES LIKE 'orders'");
    if ($result->num_rows > 0) {
        echo "\nOrders table structure:\n";
        $desc = $conn->query("DESCRIBE orders");
        while ($row = $desc->fetch_assoc()) {
            echo $row['Field'] . " (" . $row['Type'] . ") " . ($row['Null'] == 'NO' ? 'NOT NULL' : 'NULL') . "\n";
        }
    } else {
        echo "\nOrders table does not exist.\n";
    }

    // Check users table
    $result = $conn->query("SHOW TABLES LIKE 'users'");
    if ($result->num_rows > 0) {
        echo "\nUsers table structure:\n";
        $desc = $conn->query("DESCRIBE users");
        while ($row = $desc->fetch_assoc()) {
            echo $row['Field'] . " (" . $row['Type'] . ") " . ($row['Null'] == 'NO' ? 'NOT NULL' : 'NULL') . "\n";
        }
    } else {
        echo "\nUsers table does not exist.\n";
    }

    // Check customers table
    $result = $conn->query("SHOW TABLES LIKE 'customers'");
    if ($result->num_rows > 0) {
        echo "\nCustomers table structure:\n";
        $desc = $conn->query("DESCRIBE customers");
        while ($row = $desc->fetch_assoc()) {
            echo $row['Field'] . " (" . $row['Type'] . ") " . ($row['Null'] == 'NO' ? 'NOT NULL' : 'NULL') . "\n";
        }
    } else {
        echo "\nCustomers table does not exist.\n";
    }

    // Check order_items table
    $result = $conn->query("SHOW TABLES LIKE 'order_items'");
    if ($result->num_rows > 0) {
        echo "\nOrder_items table structure:\n";
        $desc = $conn->query("DESCRIBE order_items");
        while ($row = $desc->fetch_assoc()) {
            echo $row['Field'] . " (" . $row['Type'] . ") " . ($row['Null'] == 'NO' ? 'NOT NULL' : 'NULL') . "\n";
        }
    } else {
        echo "\nOrder_items table does not exist.\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

$conn->close();
?>
