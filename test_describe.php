<?php
require_once 'db/db_connect.php';

$result = $conn->query("DESCRIBE products");
if ($result) {
    while ($row = $result->fetch_assoc()) {
        echo $row['Field'] . ' ' . $row['Type'] . ' ' . ($row['Null'] == 'YES' ? 'NULL' : 'NOT NULL') . ' ' . ($row['Key'] ? $row['Key'] : '') . ' ' . ($row['Default'] !== null ? 'DEFAULT ' . $row['Default'] : '') . ' ' . ($row['Extra'] ? $row['Extra'] : '') . "\n";
    }
} else {
    echo "Error: " . $conn->error;
}
$conn->close();
?>
