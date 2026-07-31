<?php

function calcolaSaldoUtente($pdo, $gruppo_id, $utente_id) {

    //1) (+)uscite : da articoli_lista, quello che ho comprato io per il gruppo
    // COALESCE per scambiare il NULL con 0
    $stmt = $pdo->prepare("SELECT COALESCE(SUM(prezzo), 0) 
                            FROM articoli_lista 
                            WHERE gruppo_id = ? AND stato = 'comprato' AND acquirente_id = ?");
    $stmt->execute([$gruppo_id,$utente_id]);
    //fetchColumn() restituisce un singolo valore.
    $totale_anticipato = (float)$stmt->fetchColumn();


    //2) (-) quote che devo pagare (le quote sono solo uscite)
    //JOIN per prendere solo quelle relative al gruppo. Non aggiungo informazione sul gruppo qui per non avere informazione duplicata
    $queryQuote = "SELECT COALESCE(SUM(spesa_partecipanti.quota), 0)
                    FROM spesa_partecipanti
                    JOIN articoli_lista ON spesa_partecipanti.articolo_id = articoli_lista.id
                    WHERE articoli_lista.gruppo_id = ? 
                        AND spesa_partecipanti.utente_id = ?
                        AND articoli_lista.stato = 'comprato'";
    $stmt = $pdo->prepare($queryQuote);
    $stmt->execute([$gruppo_id,$utente_id]);
    $quote = $stmt->fetchColumn();


    // calcolo finale arrotondato
    return round($totale_anticipato - $quote, 2);
}

function controlloAppartenenzaGruppo($pdo,$gruppo_id,$utente_id){
    //controllo che l'utente appartenga al gruppo
    //per ogni riga che soddisfa la WHERE, scrive 1. Non mi interessa il valore
    //se esiste una riga in gruppo_utenti, con l'id del gruppo e il mio id, allora fetchColumn restituisce 1
    $check = $pdo->prepare("SELECT 1 FROM gruppo_utenti 
                            WHERE gruppo_id = ? 
                            AND utente_id = ?");
    $check->execute([$gruppo_id, $utente_id]);
    if (!$check->fetchColumn()) {
        echo json_encode(["success" => false, "message" => "Non fai parte di questo gruppo"]);
    exit;
    }
}
?>