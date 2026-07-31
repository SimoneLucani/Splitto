<?php
require_once "config.php";
header('Content-Type: application/json; charset=utf-8');

if(!isset($_SESSION["utente_id"])){
    echo json_encode(["success" => false, "message" => "Non autorizzato"]);
    exit;
}

$codice = trim(strtoupper($_POST["codiceGruppo"] ?? ""));

if(empty($codice)){
    echo json_encode(["success" => false, "message" => "Inserisci il nome"]);
    exit;
}

$utente_id = $_SESSION["utente_id"];

try{
    $sqlCerca = "SELECT id FROM gruppi WHERE codice_invito = ?";
    $stmtCerca = $pdo->prepare($sqlCerca);
    $stmtCerca->execute([$codice]);
    $gruppo = $stmtCerca->fetch(PDO::FETCH_ASSOC);

    if (!$gruppo) {
        echo json_encode(["success" => false, "message" => "Codice invito non valido o inesistente."]);
        exit;
    }
    $gruppo_id = $gruppo['id'];

    //Controllo che l'utente non sia già nel gruppo
    $sqlGiaMembro = "SELECT * FROM gruppo_utenti WHERE utente_id = ? AND gruppo_id = ?";
    $stmtGiaMembro = $pdo->prepare($sqlGiaMembro);
    $stmtGiaMembro->execute([$utente_id, $gruppo_id]);

    //Se fetch() trova qualcosa, l'utente è già membro
    if ($stmtGiaMembro->fetch()) {
        echo json_encode(["success" => false, "message" => "Fai già parte di questo gruppo!"]);
        exit;
    }

    //inseirsco utente
    $sqlInserisci = "INSERT INTO gruppo_utenti (utente_id, gruppo_id) VALUES (?, ?)";
    $stmtInserisci = $pdo->prepare($sqlInserisci);
    $stmtInserisci->execute([$utente_id, $gruppo_id]);

    echo json_encode(["success" => true, "message" => "Ti sei unito al gruppo con successo!"]);
}
catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Errore del server " . $e->getMessage()]);
}
?>