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
$id_articolo = $_POST['id_articolo'] ?? null;   // presente solo se "compro dalla lista"
$nome = trim($_POST['nome'] ?? '');             // presente solo se "spesa libera"
$partecipanti = $_POST['partecipanti'] ?? [];

$p = $_POST['prezzo'] ?? '0';
$prezzo = (float) $p;

if (!is_numeric($p) || (float)$p <= 0) { 
    echo json_encode(["success" => false, "message" => "Dati mancanti o non validi"]);
    exit;
}

// Deve arrivare o un id_articolo o un nome, non entrambi vuoti
if (!$gruppo_id || (!$id_articolo && $nome === '') || empty($partecipanti)) {
    echo json_encode(["success" => false, "message" => "Dati mancanti o non validi"]);
    exit;
}
        
//Nelle quote non perfettamente divisibili, assegno il resto a chi ha pagato
// Calcolo delle quote 
$numero_partecipanti = count($partecipanti);
//lavoro in centesimi per rimuovere la virgola
$totale_centesimi = (int) round($prezzo * 100);

$quota_base_centesimi = intdiv($totale_centesimi, $numero_partecipanti);//funzione php
$resto_centesimi = $totale_centesimi - ($quota_base_centesimi * $numero_partecipanti);

// preparo un array [utente_id => quota_in_centesimi]
$quote_centesimi = array_fill_keys($partecipanti, $quota_base_centesimi);

if ($resto_centesimi > 0) {
    // salvo l'acquirente prima del foreach, perché $utente_id viene riusata dopo
    $acquirente_id = $utente_id;

    if (in_array($acquirente_id, $partecipanti)) {
        $quote_centesimi[$acquirente_id] += $resto_centesimi;
    } else {
        // il pagatore non partecipa: il resto va al primo partecipante
        $quote_centesimi[$partecipanti[0]] += $resto_centesimi;
    }
}

//Transazione, perche modifico più tabelle contemporaneamente
try{
    controlloAppartenenzaGruppo($pdo,$gruppo_id,$utente_id);
    
    $pdo->beginTransaction();

    

    $data = date("Y-m-d");

    if($id_articolo){
        //Caso articolo dalla lista della spesa
        $queryArticolo = "UPDATE articoli_lista
                            SET stato = 'comprato', acquirente_id = ?, prezzo = ?, data_acquisto = ? 
                            WHERE id = ? AND gruppo_id = ?";
        $stmtArticolo = $pdo->prepare($queryArticolo);
        $stmtArticolo->execute([$utente_id, $prezzo,$data, $id_articolo, $gruppo_id]);

        //conrollo, non inserire le quote se non ha fatto UPDATE
        if ($stmtArticolo->rowCount() === 0) {
            throw new Exception("Articolo non trovato o non modificabile");
        }
    }
    else{
        // Caso spesa libera, creo direttamente un articolo già "comprato"
        $queryArticolo = "INSERT INTO articoli_lista
                            (gruppo_id, nome, stato, inserito_da, acquirente_id, prezzo, data_acquisto)
                            VALUES (?, ?, 'comprato', ?, ?, ?, ?)";
        $stmtArticolo = $pdo->prepare($queryArticolo);
        $stmtArticolo->execute([$gruppo_id, $nome,$utente_id, $utente_id, $prezzo, $data]);
        $id_articolo = $pdo->lastInsertId();
    }

    //Query per inserire le varie quote
    $queryQuota = "INSERT INTO spesa_partecipanti (articolo_id, utente_id, quota) 
                    VALUES (?, ?, ?)";
    $stmtQuota = $pdo->prepare($queryQuota);
    
    // Ciclo su ogni utente spuntato per salvare la sua quota
    foreach ($quote_centesimi as $id_partecipante => $centesimi) {
        $quota = $centesimi / 100;
        $stmtQuota->execute([$id_articolo, $id_partecipante, $quota]);
    }

    $pdo->commit();
    echo json_encode(["success" => true]);
}
catch(PDOException $e){
    $pdo->rollback();

    echo json_encode(["success" => false, "message" => "Errore del server " . $e->getMessage()]);

}
?>