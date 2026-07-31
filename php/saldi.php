<?php
// saldi.php
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


try {
    controlloAppartenenzaGruppo($pdo,$gruppo_id,$utente_id);

    // Query che prende tutti i membri del gruppo 
    $queryUtenti = "SELECT u.id, u.nome AS nome_utente 
                    FROM gruppo_utenti gu
                    JOIN utenti u ON gu.utente_id = u.id
                    WHERE gu.gruppo_id = ?
                    ORDER BY u.nome ASC";
    $stmtUtenti = $pdo->prepare($queryUtenti);
    $stmtUtenti->execute([$gruppo_id]);
    $listaUtenti = $stmtUtenti->fetchAll(PDO::FETCH_ASSOC);

    $saldiFinali = [];

    // Ciclo sui membri e calcolo il saldo di ognuno con la funzione comune
    foreach ($listaUtenti as $utente) {
        $saldo = calcolaSaldoUtente($pdo, $gruppo_id, $utente['id']);
        
        $saldiFinali[] = [
            "nome_utente" => $utente['nome_utente'],
            "saldo" => $saldo
        ];
    }
    echo json_encode([
        "success" => true,
        "saldi" => $saldiFinali
    ]);

} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "Errore del server " . $e->getMessage()]);
}
?>