//Utilità per inviare richiesta fetch a url
async function inviaRichiesta(url, dati) {
    try {
        //mi fermo in attesa di una risposta dal server
        const risposta = await fetch(url, {
            method: "POST",
            body: dati
        });

        //ok attributo di deafult, true o false
        if (!risposta.ok) {
            throw new Error(`Errore di rete: ${risposta.status}`);
        }

        //converte il JSON in un oggetto Javascript e lo restituisce
        return await risposta.json();

    } catch (errore) {
        console.error("Si è verificato un problema di connessione:", errore);

        // Restituisce oggetto js di errore
        return {
            success: false,
            message: "Impossibile contattare il server. Riprova più tardi."
        };
    }
}

//funzione che rimpiazza .showModal(), passando l'oggeto html
function apriDialog(elementoDialog) {
    if (elementoDialog) {
        elementoDialog.classList.remove("nascosto");
    } else {
        console.error("L'elemento passato non è valido.");
    }
}

//funzione che rimpiazza .close()
function chiudiDialog(elementoDialog) {
    if (elementoDialog) {
        elementoDialog.classList.add("nascosto");
    }
}

//se clicco sullo sfondo del dialog lo chiudo
document.addEventListener("click", (event) => {
    if (event.target.classList.contains("sfondoDialog")) {
        event.target.classList.add("nascosto");
    }
});

// funzione che scrive in titoloNomeGruppo il nome del gruppo e salva i membri in MembriGruppo
async function caricaNomeMembri() {
    try {
        const risultato = await inviaRichiesta("../php/info_gruppo.php", datiGruppo);
        if (risultato.success === true) {
            // Controllo che la variabile esista e che l'elemento html esista
            if (typeof titoloNomeGruppo !== 'undefined' && titoloNomeGruppo !== null) {
                titoloNomeGruppo.textContent = risultato.nome;
            }

            //membri
            if (typeof membriGruppo !== 'undefined') {
                membriGruppo = risultato.membri;
            }

            //codice invito
            if (typeof codiceInvito !== 'undefined') {
                codiceInvito = risultato.codice.trim();
            }

        }
    }
    catch (errore) {
        console.error("Errore nella scrittura del titolo:", errore)
    }
}



//funzione per la lista degli utenti, sia in lista_spesa che spese
function popolaListaMembri(listaMembriEl, membri) {
    listaMembriEl.textContent = "";

    membri.forEach(utente => {
        const li = document.createElement("li");
        const label = document.createElement("label");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = utente.id; //per vedere chi è spuntato all'invio del form
        checkbox.checked = true;

        label.append(checkbox, " " + utente.nome);
        li.appendChild(label);
        li.classList.add("itemPartecipante");

        listaMembriEl.appendChild(li);
    });
}


//sia per acquisto dalla lista che per spesa extra
async function aggiungiSpesa(dialogSpesa,datiSpesa,daChiamare) {
    try {
        const risultato = await inviaRichiesta("../php/aggiungi_spesa.php", datiSpesa);

        if (risultato.success === true) {
            chiudiDialog(dialogSpesa);

            daChiamare();
        } else {
            console.error("Errore nel salvataggio della spesa");
        }
    }
    catch (errore) {
        console.error("Errore nel salvataggio della spesa:", errore);
    }
}