<?php
require_once "config.php";
require_once "common.php";
header('Content-Type: application/json; charset=utf-8');


if(!isset($_SESSION["utente_id"])){
    echo json_encode(["success" => false, "message" => "Non autorizzato"]);
    exit;
    }

$utente_id = $_SESSION['utente_id'];
$gruppo_id = $_POST['id_gruppo'] ?? null;
$nome_articolo = $_POST['input_articolo'] ?? null;

if (!$utente_id || !$gruppo_id || !$nome_articolo) {
    echo json_encode(["success" => false, "message" => "Dati mancanti o non validi"]);
    exit;
}

try{

    controlloAppartenenzaGruppo($pdo,$gruppo_id,$utente_id);

    $queryArticolo = "INSERT INTO articoli_lista (inserito_da, nome, gruppo_id)
                        VALUES (?,?,?)";
    $stmtArticolo = $pdo->prepare($queryArticolo);
    $stmtArticolo->execute([$utente_id, $nome_articolo, $gruppo_id]);

    echo json_encode(["success" => true]);
}
catch(PDOException $e){
    echo json_encode(["success" => false, "message" => "Errore del server " . $e->getMessage()]);

}
?>