<?php
require_once "config.php";
require_once "common.php";
header('Content-Type: application/json; charset=utf-8');


if(!isset($_SESSION["utente_id"])){
    echo json_encode(["success" => false, "message" => "Non autorizzato"]);
    exit;
}

$utente_id = $_SESSION["utente_id"];
$gruppo_id = $_POST["id_gruppo"] ?? null;

try{
    controlloAppartenenzaGruppo($pdo,$gruppo_id,$utente_id);

    $stmt = $pdo->prepare("SELECT nome, codice_invito 
                            FROM gruppi
                            WHERE id = ?");
    $stmt->execute([$gruppo_id]);
    $dati = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$dati) {
    echo json_encode(["success" => false, "message" => "Gruppo non trovato"]);
    exit;
    }

    // Query per prendere i membri 
    $queryMembri = "SELECT utenti.id, utenti.nome 
                    FROM utenti 
                    JOIN gruppo_utenti ON utenti.id = gruppo_utenti.utente_id 
                    WHERE gruppo_utenti.gruppo_id = ?";
    $stmtMembri = $pdo->prepare($queryMembri);
    $stmtMembri->execute([$gruppo_id]);
    $membri = $stmtMembri->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true, 
        "nome" => $dati["nome"], 
        "codice" => $dati["codice_invito"],
        "membri" => $membri
]);
}
catch(PDOException $e){
    echo json_encode(["success" => false, "message" => "Errore del server " . $e->getMessage()]);
}
?>