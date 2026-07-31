<?php

session_start();

$host = '127.0.0.1';
$db   = 'lucani_676340';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    
    //Se una query fallisce lancia una eccezione
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
} catch (PDOException $e) {
    die("Errore di connessione al database: " . $e->getMessage());
}

?>