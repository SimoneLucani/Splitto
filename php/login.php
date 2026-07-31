<?php
require_once "config.php";
header('Content-Type: application/json; charset=utf-8');

$email = trim($_POST["email"] ?? "");
$password = $_POST["password"] ?? "";

if(empty($email) || empty($password)){
    echo json_encode(["success" => false, "message" => "Compila tutti i campi"]);
    exit;
}
//prendi dal DB in base alla mail e controlli la password inserita con la password salvata
try{
    $stmt = $pdo->prepare("SELECT id, nome, password_hash 
                            FROM utenti 
                            WHERE email = ?");
    $stmt->execute([$email]);
    $utente = $stmt->fetch(PDO::FETCH_ASSOC); //Prende i dati come array associativo
    
    if($utente && password_verify($password, $utente["password_hash"])){
        $_SESSION["utente_id"] = $utente["id"];
        echo json_encode(["success" => true]);
    }
    else{
        echo json_encode(["success" => false, "message" => "Email o password errate"]);
    }
}
catch (PDOException $e){
    echo json_encode(["success" => false, "message" => "Errore del server " . $e->getMessage()]);
}
?>