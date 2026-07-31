<?php
require_once "config.php";
require_once "common.php";
header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION["utente_id"])) {
    echo json_encode(["success" => false, "message" => "Non autorizzato"]);
    exit;
}

$utente_id = $_SESSION["utente_id"];
$gruppo_id = $_POST["id_gruppo"] ?? null;

if (!$gruppo_id) {
    echo json_encode(["success" => false, "message" => "ID gruppo mancante"]);
    exit;
}

//prendo id,nome,prezzo,data di acquisto di un articolo
//il nome dell'utente
//
try {
    controlloAppartenenzaGruppo($pdo,$gruppo_id,$utente_id);

    $query = "SELECT a.id, a.nome AS nome_articolo, u.nome AS nome_utente, 
                 a.prezzo, DATE_FORMAT(a.data_acquisto, '%d-%m-%Y') as data,
                 IF(a.acquirente_id = ?,true,false) AS creatore,
                 GROUP_CONCAT(u2.nome ORDER BY u2.nome SEPARATOR ', ') AS partecipanti 
                 -- raggruppa i partecipanti in una stringa separata da virgole

        -- utenti collegata due colte per due cose diverse
        -- u per chi ha pagato la spesa
        -- u2 per il nome dei patecipanti alla spesa
          FROM articoli_lista a
          JOIN utenti u ON a.acquirente_id = u.id -- incollo articoli_lista a utenti, solo le righe dove chi ha comprato l'articolo è l'utente
          JOIN spesa_partecipanti sp ON sp.articolo_id = a.id -- ad ogni articolo, attacco i partecipanti, per ogni partecipante una riga (id)
          JOIN utenti u2 ON sp.utente_id = u2.id --  altro join per avere i nomi di chi ha partecipato
          -- dopo tutti i JOIn ho tipo a.id | nome_articolo | u.nome (acquirente) | prezzo | u2.nome (partecipante)
          -- con una riga per ogni partecipante, quindi tutte le altre colonne di quelle righe duplicat. Es:
          -- 5    | Acqua          | Simone               | 6.00   | Luca
          -- 5    | Acqua          | Simone               | 6.00   | Marco
          -- 5    | Acqua          | Simone               | 6.00   | Simone
          -- 8    | Pane           | Luca                 | 3.50   | Luca

          WHERE a.gruppo_id = ? AND a.stato = 'comprato' 
          GROUP BY a.id -- quindi le raggruppo per a.id, però così ne prenderebbe una a caso, ma con GROUPCONCAT li raggruppo
          ORDER BY a.data_acquisto DESC, a.id DESC";
              
    $stmt = $pdo->prepare($query);
    $stmt->execute([$utente_id,$gruppo_id]);
    
    $articoli = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true, 
        "articoli" => $articoli
    ]);

    // ES: {"success":true,"articoli":[{"id":"5","nome_articolo":"Pane","nome_utente":"Luca","prezzo":"4.00","data":"18-07-2026","creatore":"0","partecipanti":"Luca, Simone"}]}

} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "Errore del server " . $e->getMessage()]);
}
?>