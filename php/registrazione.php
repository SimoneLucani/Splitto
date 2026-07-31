<?php
require_once "config.php";
header('Content-Type: application/json; charset=utf-8');

$nome = trim($_POST["nome"] ?? "");
$email = trim($_POST["email"] ?? "");
$password = trim($_POST["password"] ?? "");

if(empty($nome) || empty($email) || empty($password)){
    echo json_encode(["success" => false, "message" => "Compila tutti i campi"]);
    exit;
}

try{
    $stmtCheck = $pdo->prepare("SELECT id FROM utenti WHERE email = ?");
    $stmtCheck->execute([$email]);
    $utenteEsistente = $stmtCheck->fetch();

    if ($utenteEsistente) {
        // L'email è già registrata
        echo json_encode(["success" => false, "message" => "Questa email è già registrata. Fai il login."]);
        exit;
    }

    $passwordCriptata = password_hash($password, PASSWORD_DEFAULT);

    $stmtInsert = $pdo->prepare("INSERT INTO utenti (nome, email, password_hash) VALUES (?, ?, ?)");

    $stmtInsert->execute([$nome, $email, $passwordCriptata]);

    echo json_encode(["success" => true, "message" => "Registrazione completata"]);
}
catch(PDOException $e){
    echo json_encode(["success" => false, "message" => "Errore del server " . $e->getMessage()]);
}
?>