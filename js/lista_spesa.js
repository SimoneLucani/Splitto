const btnIndietroLista = document.getElementById("btnIndietroLista");

const formAggiungiArticolo = document.getElementById("formAggiungiArticolo");
const inputArticolo = document.getElementById("inputArticolo");
const btnAggiungiArticolo = document.getElementById("btnAggiungiArticolo");
const erroreAggiungi = document.getElementById("erroreAggiungi");


const spazioLista = document.getElementById("spazioLista");

const dialogComprato = document.getElementById("dialogComprato");
const nomeArticoloSelezionato = document.getElementById("nomeArticoloSelezionato");
const inputPrezzo = document.getElementById("inputPrezzo");
const listaMembri = document.getElementById("listaMembri");
const btnAnnullaModale = document.getElementById("btnAnnullaModale");
const formComprato = document.getElementById("formComprato");
const areaErroreSpesa = document.getElementById("areaErroreSpesa");

const parametriUrl = new URLSearchParams(window.location.search)
const idGruppo = parametriUrl.get("id");

let idArticoloSelezionato = null; //per gestire il click su un oggetto
let membriGruppo = []; // per selezionare chi partecipa alla spesa

const datiGruppo = new FormData();
datiGruppo.append("id_gruppo", idGruppo);


document.addEventListener("DOMContentLoaded", () => {
    caricaNomeMembri(); //common che popola anche membriGruppo, oltra a scrivere il titolo ed il codice
    caricaListaSpesa();
});

btnIndietroLista.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.href = "../html/dettaglio_gruppo.html?id=" + idGruppo;
});


//recupero e disegno la lista della spesa
async function caricaListaSpesa() {
    try {
        const risultato = await inviaRichiesta("../php/lista_spesa.php", datiGruppo);
        
        if (risultato.success === true) {
            spazioLista.textContent = "";
            const lista = risultato.articoli;
            if (lista.length <= 0) {
                const div = document.createElement("div");
                div.classList.add("bloccoBianco");
                div.classList.add("coppiaMessaggi");

                const messaggioVuoto = document.createElement("p");
                messaggioVuoto.textContent = "Non c'è nulla da comprare"
                messaggioVuoto.classList.add("messaggioInformativo1");
                div.appendChild(messaggioVuoto);

                const messaggioInizia = document.createElement("p");
                messaggioInizia.textContent = "Usa il campo qui sopra per aggiungere ciò che manca"
                messaggioInizia.classList.add("messaggioInformativo2");
                div.appendChild(messaggioInizia);

                spazioLista.appendChild(div);
            }

            else {
                const h2 = document.createElement("h2");
                h2.textContent = "Da comprare"
                spazioLista.appendChild(h2);
                lista.forEach(oggetto => {
                    const divOggetto = document.createElement("div");
                    divOggetto.classList.add("bloccoBianco");
                    divOggetto.classList.add("bloccoLista");

                    const contenitore = document.createElement("div");
                    contenitore.classList.add("infoGruppo");

                    const titoloOggetto = document.createElement("h3");
                    titoloOggetto.classList.add("titoloOggetto");
                    const testo = oggetto.nome_articolo;
                    titoloOggetto.textContent = testo.charAt(0).toUpperCase() + testo.slice(1); //prima lettera maiuscola
                    contenitore.appendChild(titoloOggetto);

                    const richiedente = document.createElement("div");
                    richiedente.classList.add("testo");
                    richiedente.textContent ="Aggiunto da " + oggetto.nome_utente;
                    contenitore.appendChild(richiedente);

                    divOggetto.appendChild(contenitore);

                    const freccia = document.createElement("span");
                    freccia.textContent = "→";
                    freccia.classList.add("freccia");
                    divOggetto.appendChild(freccia); 

                    divOggetto.addEventListener("click", (event) => {
                        event.preventDefault();

                        idArticoloSelezionato = oggetto.id;
                        apriModale(oggetto.id, oggetto.nome_articolo);
                    })

                    spazioLista.appendChild(divOggetto);

                });
            }
        }
    }
    catch (errore) {
        console.error("Errore nella scrittura del titolo:", errore)
    }
}

function apriModale(id, nome) {
    areaErroreSpesa.textContent = "";
    areaErroreSpesa.classList.add("nascosto");
    nomeArticoloSelezionato.textContent = nome;
    inputPrezzo.value = "";

    popolaListaMembri(listaMembri, membriGruppo);

    apriDialog(dialogComprato);
}

btnAnnullaModale.addEventListener("click", (event) => {
    event.preventDefault();

    chiudiDialog(dialogComprato);
});


//----Aggiunta oggetto comprato------
formComprato.addEventListener("submit",async (event) => {
    event.preventDefault();

    if (inputPrezzo.value === "") {
        areaErroreSpesa.textContent = "Inserisci quanto hai speso";
        areaErroreSpesa.classList.remove("nascosto");
        inputPrezzo.classList.add("inputErrore");
        return;
    }
    else {

        areaErroreSpesa.textContent = "";
        areaErroreSpesa.classList.add("nascosto");
    }

    //sintassi del css, prendo tutte le checbox spuntate
    const checkboxSelezionate = document.querySelectorAll("#listaMembri input[type='checkbox']:checked");
    if (checkboxSelezionate.length === 0) {
        areaErroreSpesa.textContent = "Devi selezionare almeno un partecipante per dividere la spesa";
        areaErroreSpesa.classList.remove("nascosto");
        return;
    }

    const datiSpesa = new FormData();
    datiSpesa.append("id_gruppo", idGruppo);
    //Qui non invio testo con il nome, ma l'id dell'articolo selezionato
    datiSpesa.append("id_articolo", idArticoloSelezionato);
    datiSpesa.append("prezzo", inputPrezzo.value);

    // Aggiungo "[]" al nome, così PHP capisce che è un array
    //"partecipanti" ogni volta sovrascrive
    //partecipanti[0] ) => 4, partecipanti[1] = > 7...
    checkboxSelezionate.forEach(checkbox => {
        datiSpesa.append("partecipanti[]", checkbox.value);
    });

    aggiungiSpesa(dialogComprato, datiSpesa,caricaListaSpesa); //chiamo aggiungi_spesa.php
});

inputPrezzo.addEventListener("input", () => {
    inputPrezzo.classList.toggle("inputErrore", !inputPrezzo.checkValidity());

});


//-----aggiunta articolo alla lista----
formAggiungiArticolo.addEventListener("submit", async (event) => {
    event.preventDefault();

    inputArticolo.classList.toggle("inputErrore", !inputArticolo.checkValidity());
    erroreAggiungi.classList.toggle("nascosto", inputArticolo.checkValidity());
    if (!inputArticolo.checkValidity()) {
        return;
    }

    //prende i dati automaticamente dal form, con nome->value
    const datiArticolo = new FormData(formAggiungiArticolo);
    datiArticolo.append("id_gruppo", idGruppo); //aggiungo id gruppo

    try {
        const risultato = await inviaRichiesta("../php/aggiungi_articolo.php", datiArticolo);

        if (risultato.success === true) {
            inputArticolo.value = "";
            inputArticolo.blur();
            inputArticolo.classList.remove("inputErrore");

            caricaListaSpesa();
        }
        else {
            console.error("Errore dal server");
        }
    }
    catch (errore) {
        console.error("Errore durante l'aggiunta dell'articolo:", errore);
    }
});

inputArticolo.addEventListener("input", () => {
    inputArticolo.classList.toggle("inputErrore", !inputArticolo.checkValidity());
    erroreAggiungi.classList.toggle("nascosto", inputArticolo.checkValidity());
});

