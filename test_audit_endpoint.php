<?php
session_start();
$_SESSION['role'] = 'admin'; // Simulate admin session

require_once 'db/get_audit_logs.php';
?>
