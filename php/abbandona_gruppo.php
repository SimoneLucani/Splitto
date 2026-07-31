<?php
require_once "config.php";
require_once "common.php";
header('Content-Type: application/json; charset=utf-8');

if(!isset($_SESSION["utente_id"])){
    echo json_encode(["success" => false, "message" => "Non autorizzato"]);
    exit;
}

$gruppo_id = $_POST["id_gruppo"] ?? null;
$utente_id = $_SESSION["utente_id"];

if(!$gruppo_id){
    echo json_encode(["success" => false, "message" => "Dati mancanti: impossibile identificare il gruppo"]);
    exit;
}

try{
    controlloAppartenenzaGruppo($pdo,$gruppo_id,$utente_id);

    $saldo = calcolaSaldoUtente($pdo, $gruppo_id, $utente_id);

    if (abs($saldo) > 0.001) { // tolleranza per gli arrotondamenti
        echo json_encode([ "success" => false, "message" => "Non puoi uscire dal gruppo: il tuo saldo è " . number_format($saldo, 2) . "€. Sistema i conti prima di uscire."]);
        exit;
    }

    $pdo->beginTransaction();

    $stmt = $pdo->prepare("DELETE
                            FROM gruppo_utenti
                            WHERE gruppo_id = ? AND utente_id = ?");

    $stmt->execute([$gruppo_id, $utente_id]);

    //controllo quanti utenti sono rimasti
    $stmtCount = $pdo->prepare("SELECT COUNT(*) 
                                FROM gruppo_utenti 
                                WHERE gruppo_id = ?");
    $stmtCount->execute([$gruppo_id]);
    $utenti_rimasti = $stmtCount->fetchColumn(); 

    $messaggio = "Utente rimosso dal DB";

    // se non è rimasto nessuno, elimino il gruppo
    if ($utenti_rimasti == 0) {
        $stmtDeleteGroup = $pdo->prepare("DELETE FROM gruppi WHERE id = ?");
        $stmtDeleteGroup->execute([$gruppo_id]);

        $messaggio = "Utente rimosso dal DB e gruppo eliminato";
    }

    $pdo->commit();

    echo json_encode(["success" => true, "message" => $messaggio]);

}
catch(PDOException $e){
    $pdo->rollBack();

    echo json_encode(["success" => false, "message" => "Errore del server " . $e->getMessage()]);
}
?>