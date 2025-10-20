<?php
$hash = '$2y$10$bn/sILeOiIfPuYuPrB8UWOIF0hG9056/kOSGFrhub8wn84kKss9BO';
$pin = '1234';

if (password_verify($pin, $hash)) {
    echo "PIN 1234 matches the hash.\n";
} else {
    echo "PIN 1234 does not match the hash.\n";
}
?>
