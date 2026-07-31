<?php
require_once "config.php";
header('Content-Type: application/json; charset=utf-8');

if(!isset($_SESSION["utente_id"])){
    echo json_encode(["success"=>false, "message"=> "Non autorizzato"]);
    exit;
}

$utente_id = $_SESSION["utente_id"];

try{
    $stmtUtente = $pdo->prepare("SELECT nome FROM utenti WHERE id = ?");
    $stmtUtente->execute([$utente_id]);
    $utente = $stmtUtente->fetchColumn();
    
    $sql = "SELECT gruppi.id, gruppi.nome,
                (SELECT COUNT(*) FROM gruppo_utenti WHERE gruppo_id = gruppi.id) AS numero_membri
            FROM gruppi
            JOIN gruppo_utenti ON gruppi.id = gruppo_utenti.gruppo_id
            WHERE gruppo_utenti.utente_id = ?";
        
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$utente_id]);

    //prende tutte le righe trovate e ne fa un array
    $gruppi = $stmt->fetchAll(PDO::FETCH_ASSOC);

    //risposta a js
    echo json_encode(["success"=>true,"nomeUtente"=>$utente, "gruppi" => $gruppi]);
}
catch (PDOException $e){
    echo json_encode(["success" => false, "message" => "Errore del server " . $e->getMessage()]);
}
?>