<?php
require_once "config.php";
require_once "common.php";
header('Content-Type: application/json; charset=utf-8');

if(!isset($_SESSION["utente_id"])){
    echo json_encode(["success" => false, "message" => "Non autorizzato"]);
    exit;
    }

$id_spesa = $_POST["id_spesa"] ?? null;
$utente_id = $_SESSION["utente_id"] ?? null;

if (!$id_spesa) {
    echo json_encode(["success" => false, "message" => "Manca id spese"]);
    exit;
}

try {
    $pdo->beginTransaction();

    // controllo che sia stata inserita da chi vuole eliminarla
    $queryControllo = "SELECT acquirente_id 
                        FROM articoli_lista 
                        WHERE id = ?";
    $stmtControllo = $pdo->prepare($queryControllo);
    $stmtControllo->execute([$id_spesa]);
    $controllo = $stmtControllo->fetch(PDO::FETCH_ASSOC);

    if (!$controllo || (int)$controllo['acquirente_id'] !== (int)$utente_id) {
    echo json_encode(["success" => false, "message" => "Non puoi eliminare questa spesa"]);
    $pdo->rollBack();
    exit;
}

    // elimino prima i partcipanti alla spesa (per non violare i vincoli Foreign Key)
    $queryPartecipanti = "DELETE FROM spesa_partecipanti 
                        WHERE articolo_id = ?";
    $stmtPartecipanti = $pdo->prepare($queryPartecipanti);
    $stmtPartecipanti->execute([$id_spesa]);

    //poi l'articolo vero e proprio
    $querySpesa = "DELETE FROM articoli_lista
                    WHERE id = ?";
    $stmtSpesa = $pdo->prepare($querySpesa);
    $stmtSpesa->execute([$id_spesa]);

    // salva le modifiche
    $pdo->commit();

    echo json_encode(["success" => true]);

} catch (Exception $e) {
    // se c'è stato un errore, ripristina il db a prima dell'inizio della transazione
    $pdo->rollBack();
    echo json_encode(["success" => false, "message" => "Errore del server " . $e->getMessage()]);
}
?>