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

if(!$gruppo_id){
    echo json_encode(["success" => false, "message" => "ID gruppo mancante"]);
    exit;
}

try {
    controlloAppartenenzaGruppo($pdo,$gruppo_id,$utente_id);

    //array che conterrà la risposta finale
    $risposta = [
        "success" => true,
        "quantiArticoli" => 0,
        "ultimiOggetti" => [],
        "ultimeSpese" => [],
        "saldoUtente" => 0
    ];
 
    
    //quanti articoli ci sono nella lista della spesa
    $queryConteggio = "SELECT COUNT(*) as totale FROM articoli_lista WHERE gruppo_id = ? AND stato= 'da_comprare'";
    $stmt = $pdo->prepare($queryConteggio);
    $stmt->execute([$gruppo_id]);
    $risultatoConteggio = $stmt->fetch(PDO::FETCH_ASSOC);

    $risposta["quantiArticoli"] = (int)$risultatoConteggio["totale"];

    //ultimi tre articoli inseriti in lista
    if($risposta["quantiArticoli"]>0){
        $queryOggetti = "SELECT nome
                            FROM articoli_lista
                            WHERE gruppo_id = ? AND stato = 'da_comprare'
                            ORDER BY id DESC LIMIT 3";
        
        $stmt = $pdo->prepare($queryOggetti);
        $stmt->execute([$gruppo_id]);
        $articoli = $stmt->fetchALL(PDO::FETCH_COLUMN); 
        //FETCH_COLUMN prende i valori di una sola colonnna, per prima la prima, poi seconda...
        //$articoli = ["Pasta","Dentifricio","Acqua"]
        $risposta["ultimiOggetti"]= $articoli;
    }

    //ultimi tre articoli comprati
    //qui prendo solo tre nomi. Non utilizzo la stessa di lista_spesa perche mi darebbe troppe informazioni inutili
    $queryComprati = "SELECT al.nome AS nome_articolo, al.prezzo, u.nome AS nome_acquirente
                      FROM articoli_lista al
                      JOIN utenti u ON al.acquirente_id = u.id
                      WHERE al.gruppo_id = ? AND al.stato = 'comprato'
                      ORDER BY al.id DESC LIMIT 3";
                    
    $stmt = $pdo->prepare($queryComprati);
    $stmt->execute([$gruppo_id]);
    $risposta["ultimeSpese"] = $stmt->fetchAll(PDO::FETCH_ASSOC); //array di oggetti

    //saldo dell'utente loggato
    $saldo_finale = calcolaSaldoUtente($pdo,$gruppo_id,$utente_id);

    $risposta["saldoUtente"] = round($saldo_finale,2); //arrotondo a due cifre decimali


    echo json_encode($risposta);
}
catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Errore del server " . $e->getMessage()]);
}

?>