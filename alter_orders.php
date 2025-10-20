<?php
require_once __DIR__ . '/db/db_connect.php';

try {
    $sql = "ALTER TABLE orders ADD COLUMN IF NOT EXISTS totalAmount DECIMAL(10,2) DEFAULT 0.00 AFTER status";
    if ($conn->query($sql) === TRUE) {
        echo "Column 'totalAmount' added successfully to orders table.\n";
    } else {
        echo "Error adding column: " . $conn->error . "\n";
    }

    // Verify the column exists
    $result = $conn->query("DESCRIBE orders");
    $hasTotalAmount = false;
    while ($row = $result->fetch_assoc()) {
        if ($row['Field'] === 'totalAmount') {
            $hasTotalAmount = true;
            break;
        }
    }
    echo $hasTotalAmount ? "Verified: totalAmount column exists.\n" : "Warning: totalAmount column still missing.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

$conn->close();
?>
