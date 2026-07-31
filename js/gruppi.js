const info = document.getElementById("info");
const btnEsci = document.getElementById("btnEsci");
const spazioGruppi = document.getElementById("spazioGruppi");
const btnCrea = document.getElementById("btnCrea");
const btnUnisciti = document.getElementById("btnUnisciti");

const dialogCreaGruppo = document.getElementById("dialogCreaGruppo");
const formCreaGruppo = document.getElementById("formCreaGruppo");
const inputNomeGruppo = document.getElementById("inputNomeGruppo");
const btnAnnullaCreazione = document.getElementById("btnAnnullaCreazione");
const btnConfermaCreazione = document.getElementById("btnConfermaCreazione");
const areaErroreCrea = document.getElementById("areaErroreCrea");

const dialogUniscitiGruppo = document.getElementById("dialogUniscitiGruppo");
const formUniscitiGruppo = document.getElementById("formUniscitiGruppo");
const inputCodiceGruppo = document.getElementById("inputCodiceGruppo");
const btnAnnullaUnione = document.getElementById("btnAnnullaUnione");
const btnConfermaUnione = document.getElementById("btnConfermaUnione");
const areaErroreUnisciti = document.getElementById("areaErroreUnisciti");

document.addEventListener("DOMContentLoaded", caricaGruppi);

//prendo i gruppi dell'utente e li disegno
async function caricaGruppi() {

    //creo dati vuoti perché la funzione di utilità inviaRichiesta fa una POST e vuole url e dati
    const datiVuoti = new FormData();

    const risultato = await inviaRichiesta("../php/prendi_gruppi.php", datiVuoti);
    if (risultato.success === true) {
        //Badge con nome utente
        info.textContent = "Ciao, " + risultato.nomeUtente;

        spazioGruppi.textContent = "";

        if (risultato.gruppi.length === 0) {
            spazioGruppi.textContent = "Non fai ancora parte di nessun gruppo. Creane uno o unisciti!";
            spazioGruppi.classList.add("testoSemplice");
            return;
        }

        //gruppi è un array
        risultato.gruppi.forEach((gruppo, indice) => {
            const divGruppo = document.createElement("div");
            divGruppo.classList.add("bloccoLista","bloccoBianco");

            const temiColore = [
                { bordo: "var(--colore-principale)", testoBadge: "#c94f2d", sfondoBadge: "rgba(201, 79, 45, 0.12)" },
                { bordo: "var(--colore-dettaglio)", testoBadge: "#8a6d1f", sfondoBadge: "rgba(244, 185, 66, 0.18)" },
                { bordo: "var(--colore-successo)", testoBadge: "#1f5c40", sfondoBadge: "rgba(46, 125, 91, 0.12)" },
            ];
            const tema = temiColore[indice % temiColore.length];

            divGruppo.style.borderLeftColor = tema.bordo;

            const infoGruppo = document.createElement("div");
            infoGruppo.classList.add("infoGruppo");

            const titoloGruppo = document.createElement("h3");
            titoloGruppo.classList.add("titoloGruppo");
            titoloGruppo.textContent = gruppo.nome;
            infoGruppo.appendChild(titoloGruppo);

            const partecipanti = document.createElement("div");
            partecipanti.classList.add("badgePartecipanti");
            partecipanti.style.color = tema.testoBadge;
            partecipanti.style.backgroundColor = tema.sfondoBadge;
            partecipanti.textContent = gruppo.numero_membri + (gruppo.numero_membri > 1 ? " partecipanti" : " partecipante");
            infoGruppo.appendChild(partecipanti);

            divGruppo.appendChild(infoGruppo);

            const freccia = document.createElement("span");
            freccia.textContent = "→";
            freccia.classList.add("freccia");
            divGruppo.appendChild(freccia);

            divGruppo.addEventListener("click", () => {
                window.location.href = "../html/dettaglio_gruppo.html?id=" + gruppo.id;
            })
            spazioGruppi.appendChild(divGruppo);
        });
    }
    else {
        console.error(risultato.message);
        if (risultato.message === "Non autorizzato") {
            window.location.href = "../index.html";
        }
    }
}

//----------CREAZIONE---------------
btnCrea.addEventListener("click", (event) => {
    event.preventDefault();

    apriDialog(dialogCreaGruppo)
});

btnAnnullaCreazione.addEventListener("click", (event) => {
    event.preventDefault();
    inputNomeGruppo.value = "";
    chiudiDialog(dialogCreaGruppo);
    areaErroreCrea.classList.add("nascosto");
})

formCreaGruppo.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (inputNomeGruppo.checkValidity()) {
        await creaNuovoGruppo();
    }
    else {
        console.log("Nome del gruppo non valido");
        inputNomeGruppo.classList.add("inputErrore");
        areaErroreCrea.textContent = "Inserisci il nome del gruppo";
        areaErroreCrea.classList.remove("nascosto");
    }
});

inputNomeGruppo.addEventListener("input", () => {
    inputNomeGruppo.classList.toggle("inputErrore", !inputNomeGruppo.checkValidity());
    areaErroreCrea.classList.toggle("nascosto", inputNomeGruppo.checkValidity());
});

async function creaNuovoGruppo() {
    const datiForm = new FormData(formCreaGruppo);

    try {
        const risultato = await inviaRichiesta("../php/crea_gruppo.php", datiForm);

        if (risultato.success === true) {

            inputNomeGruppo.value = "";

            //aggiungo all'url il parametro nuovo = true
            window.location.href = "../html/dettaglio_gruppo.html?id=" + risultato.id_nuovo_gruppo + "&nuovo=true";
            chiudiDialog(dialogCreaGruppo);
        }

        else {
            console.error("Impossibile creare il gruppo");
        }
    }
    catch (errore) {
        console.error("Errore durante la creazione del gruppo:", errore)
    }
}

//---------UNIONE--------------
btnUnisciti.addEventListener("click", (event) => {
    event.preventDefault();

    apriDialog(dialogUniscitiGruppo);
});


btnAnnullaUnione.addEventListener("click", (event) => {
    event.preventDefault();
    inputCodiceGruppo.value = "";
    chiudiDialog(dialogUniscitiGruppo);
    areaErroreUnisciti.classList.add("nascosto");
    inputCodiceGruppo.classList.remove("inputErrore");
    btnUnisciti.blur();


})

formUniscitiGruppo.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (inputCodiceGruppo.checkValidity()) {
        await uniscitiGruppo();
    }
    else {
        console.log("Codice del gruppo non valido");
        inputCodiceGruppo.classList.add("inputErrore");
        areaErroreUnisciti.textContent = "Inserisci un codice valido";
        areaErroreUnisciti.classList.remove("nascosto");
    }
});

inputCodiceGruppo.addEventListener("input", () => {
    inputCodiceGruppo.value = inputCodiceGruppo.value.toUpperCase();
    inputCodiceGruppo.classList.toggle("inputErrore", !inputCodiceGruppo.checkValidity());
    areaErroreUnisciti.textContent = "Inserisci 6 caratteri"
    areaErroreUnisciti.classList.toggle("nascosto", inputCodiceGruppo.checkValidity());
});

async function uniscitiGruppo() {
    const datiForm = new FormData(formUniscitiGruppo);

    try {
        const risultato = await inviaRichiesta("../php/unisciti_gruppo.php", datiForm);

        if (risultato.success === true) {
            chiudiDialog(dialogUniscitiGruppo);
            inputCodiceGruppo.value = "";
            areaErroreUnisciti.classList.add("nascosto");
            await caricaGruppi();
        }
        else {
            inputCodiceGruppo.classList.add("inputErrore");
            areaErroreUnisciti.textContent = risultato.message;
            areaErroreUnisciti.classList.remove("nascosto");
            console.error("Impossibile unirsi al gruppo");
        }
    }
    catch (errore) {
        console.error("Errore durante l'unione: ", errore);
        areaErroreUnisciti.textContent = "Errore di connessione. Riprova.";
        areaErroreUnisciti.classList.remove("nascosto");
    }
}

btnEsci.addEventListener("click",async (event) => {
    event.preventDefault();

    const datiVuoti = new FormData();

    const risultato = await inviaRichiesta("../php/logout.php", datiVuoti);

    if (risultato.success === true) {
        window.location.href = "../index.html";
    } else {
        console.error("Impossibile effettuare il logout.");
    }
});



