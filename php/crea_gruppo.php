<?php
require_once "config.php";
header('Content-Type: application/json; charset=utf-8');


if(!isset($_SESSION["utente_id"])){
    echo json_encode(["success" => false, "message" => "Non autorizzato"]);
    exit;
    }
    
$nome = trim($_POST["nomeGruppo"] ?? "");
if(empty($nome)){
    echo json_encode(["success" => false, "message" => "Inserisci il nome"]);
    exit;
    }

$utente_id = $_SESSION["utente_id"];

$caratteri = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
$codice_invito = '';

for ($i = 0; $i < 6; $i++) {
    $indiceCasuale = rand(0, strlen($caratteri) - 1);
    $codice_invito .= $caratteri[$indiceCasuale];
}

try{
    $sql = "INSERT INTO gruppi (nome,codice_invito) VALUES (?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$nome,$codice_invito]);

    $nuovo_gruppo_id = $pdo->lastInsertId();

    //aggiungo l'utente come membro
    $sqlMembro = "INSERT INTO gruppo_utenti (utente_id, gruppo_id) VALUES (?,?)";
    $stmtMembro = $pdo->prepare($sqlMembro);
    $stmtMembro->execute([$utente_id,$nuovo_gruppo_id]);

    echo json_encode(["success" => true, "message" => "Gruppo creato con successo", "id_nuovo_gruppo" => $nuovo_gruppo_id]);
}
catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Errore del server " . $e->getMessage()]);
}
?>