<?php
require_once "config.php";
require_once "common.php";
header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION["utente_id"])) {
    echo json_encode(["success" => false, "message" => "Non autorizzato"]);
    exit;
}

$gruppo_id = $_POST["id_gruppo"] ?? null;
$utente_id = $_SESSION["utente_id"];

if (!$gruppo_id) {
    echo json_encode(["success" => false, "message" => "ID gruppo mancante"]);
    exit;
}

//prendo anche id per quando clicca su un oggetto
try {
    controlloAppartenenzaGruppo($pdo,$gruppo_id,$utente_id);

    $query = "SELECT a.id, a.nome AS nome_articolo, u.nome AS nome_utente 
          FROM articoli_lista a
          JOIN utenti u ON a.inserito_da = u.id
          WHERE a.gruppo_id = ? AND a.stato = 'da_comprare' 
          ORDER BY a.id DESC";
              
    $stmt = $pdo->prepare($query);
    $stmt->execute([$gruppo_id]);
    
    $articoli = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true, 
        "articoli" => $articoli
    ]);

} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "Errore del server " . $e->getMessage()]);
}
?>