const btnIndietroLista = document.getElementById("btnIndietroLista");
const btnAggiungiSpesa = document.getElementById("btnAggiungiSpesa");

const spazioListaSpese = document.getElementById("spazioListaSpese");
const dialogPartecipanti = document.getElementById("dialogPartecipanti");
const quantoTesta = document.getElementById("quantoTesta");
const listaPartecipanti = document.getElementById("listaPartecipanti");
const btnChiudiDettaglio = document.getElementById("btnChiudiDettaglio");


const dialogEliminazione = document.getElementById("dialogEliminazione");
const msgConferma = document.getElementById("msgConferma");
const btnAnnullaEliminazione = document.getElementById("btnAnnullaEliminazione");
const btnConfermaEliminazione = document.getElementById("btnConfermaEliminazione");

const dialogSpesa = document.getElementById("dialogSpesa");

const inputNome = document.getElementById("inputNome");

const inputPrezzo = document.getElementById("inputPrezzo");
const listaMembri = document.getElementById("listaMembri");
const btnAnnullaModale = document.getElementById("btnAnnullaModale");

const formSpesa = document.getElementById("formSpesa");
const areaErroreSpesa = document.getElementById("areaErroreSpesa");

const parametriUrl = new URLSearchParams(window.location.search)
const idGruppo = parametriUrl.get("id");

let membriGruppo = []; // per selezionare chi partecipa alla spesa

const datiGruppo = new FormData();
datiGruppo.append("id_gruppo", idGruppo);

document.addEventListener("DOMContentLoaded", () => {
    caricaNomeMembri(); //common
    caricaSpese();
});

btnIndietroLista.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.href = "../html/dettaglio_gruppo.html?id=" + idGruppo;
});


//recupero e disegno tutte le spese fatte
async function caricaSpese() {
    try {
        const risultato = await inviaRichiesta("../php/spese.php", datiGruppo);

        if (risultato.success === true) {
            spazioListaSpese.textContent = "";
            const lista = risultato.articoli;
            if (lista.length <= 0) {
                const div = document.createElement("div");
                div.classList.add("bloccoBianco");
                div.classList.add("coppiaMessaggi");

                const messaggioVuoto = document.createElement("p");
                messaggioVuoto.textContent = "Non è stata fatta nessuna spesa"
                messaggioVuoto.classList.add("messaggioInformativo1");
                div.appendChild(messaggioVuoto);

                const messaggioInizia = document.createElement("p");
                messaggioInizia.textContent = "Usa il campo qui sopra per aggiungerne una"
                messaggioInizia.classList.add("messaggioInformativo2");
                div.appendChild(messaggioInizia);

                spazioListaSpese.appendChild(div);
            }

            else {
                const h2 = document.createElement("h2");
                h2.textContent = "Movimenti effettuati"
                spazioListaSpese.appendChild(h2);
                lista.forEach(oggetto => {
                    const divOggetto = document.createElement("div");
                    divOggetto.classList.add("bloccoBianco");
                    divOggetto.classList.add("bloccoLista");

                    //prima riga
                    const primaRiga = document.createElement("div");
                    primaRiga.classList.add("riga");

                    const titoloOggetto = document.createElement("h3");
                    titoloOggetto.classList.add("titoloOggetto");
                    const testo = oggetto.nome_articolo;
                    titoloOggetto.textContent = testo.charAt(0).toUpperCase() + testo.slice(1); //prima lettera maiuscola

                    const divPrezzo = document.createElement("div");
                    const prezzo = parseFloat(oggetto.prezzo).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
                    divPrezzo.textContent = prezzo;
                    divPrezzo.classList.add("prezzo");


                    const freccia = document.createElement("span");
                    freccia.textContent = "→";
                    freccia.classList.add("freccia");

                    const divPrezzoFreccia = document.createElement("div");
                    divPrezzoFreccia.classList.add("divPrezzoFreccia");


                    divPrezzoFreccia.appendChild(divPrezzo);
                    divPrezzoFreccia.appendChild(freccia);

                    primaRiga.appendChild(titoloOggetto);
                    primaRiga.appendChild(divPrezzoFreccia);

                    //seconda riga
                    const secondaRiga = document.createElement("div");
                    secondaRiga.classList.add("infoSotto");
                    

                    const data = document.createElement("div");
                    data.classList.add("testo");
                    data.textContent = oggetto.data;

                    const pagante = document.createElement("div");
                    pagante.classList.add("testo");
                    pagante.textContent = "Pagata da " + oggetto.nome_utente;

                    const arrayPartecipanti = oggetto.partecipanti.split(",").map(nome => nome.trim());
                    const quanti = document.createElement("div");
                    quanti.textContent = arrayPartecipanti.length + (arrayPartecipanti.length > 1 ? " partecipanti" : " partecipante");
                    quanti.style.fontSize = "1rem";
                    quanti.classList.add("testo");

                    secondaRiga.appendChild(data);
                    secondaRiga.appendChild(pagante);
                    secondaRiga.appendChild(quanti);

                    divOggetto.appendChild(primaRiga);
                    divOggetto.appendChild(secondaRiga);

                    divOggetto.addEventListener("click", (event) => {
                        event.preventDefault();
                        event.stopPropagation();

                        const quota = parseFloat(oggetto.prezzo) / arrayPartecipanti.length;
                        const quotaFormattata = quota.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
                        quantoTesta.textContent = quotaFormattata + " a testa";
                        
                        listaPartecipanti.textContent = "";

                        arrayPartecipanti.forEach(nome => {
                            const li = document.createElement("li");
                            li.textContent = nome;
                            li.classList.add("itemAnteprima");

                            listaPartecipanti.appendChild(li);
                        });

                        apriDialog(dialogPartecipanti);
                    });
                    
                    const btnElimina = document.createElement("button");
                    btnElimina.textContent = "🗑️";
                    btnElimina.classList.add("btnElimina");
                    //booleano settato in php
                    btnElimina.classList.toggle("nascosto", oggetto.creatore != 1);

                    btnElimina.addEventListener("click", (event) => {
                        event.preventDefault();
                        event.stopPropagation();

                        apriDialog(dialogEliminazione);

                        //onclick() per non accumulare listener. onclick() ogni volta sovrascrive
                        btnConfermaEliminazione.onclick = (event) => {
                            event.preventDefault();
                            elimina(oggetto.id,btnConfermaEliminazione);
                        };

                        btnAnnullaEliminazione.onclick = (event) => {
                            chiudiDialog(dialogEliminazione);
                        }


                    })
                    divOggetto.classList.add("dueRighe");
                    divOggetto.appendChild(btnElimina);
                    spazioListaSpese.appendChild(divOggetto);

                });
            }
        }
    }
    catch (errore) {
        console.error("Errore nella scrittura del titolo:", errore)
    }
}

btnAggiungiSpesa.addEventListener("click", (event) => {
    event.preventDefault();

    apriModale();
});

function apriModale() {
    areaErroreSpesa.textContent = "";
    areaErroreSpesa.classList.add("nascosto");
    inputPrezzo.value = "";
    inputNome.value = "";

    popolaListaMembri(listaMembri, membriGruppo); //common

    apriDialog(dialogSpesa);
}

btnAnnullaModale.addEventListener("click", (event) => {
    event.preventDefault();

    chiudiDialog(dialogSpesa);
});


//invio del form per aggiunta di una nuova spesa
formSpesa.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (inputPrezzo.value === "" || inputNome.value === "") {
        areaErroreSpesa.textContent = "Inserisci articolo e prezzo pagato";
        areaErroreSpesa.classList.remove("nascosto");
        inputPrezzo.classList.toggle("inputErrore", !inputPrezzo.checkValidity());
        inputNome.classList.toggle("inputErrore", !inputNome.checkValidity());
        return;
    }
    else {

        areaErroreSpesa.textContent = "";
        areaErroreSpesa.classList.add("nascosto");
    }

    //con la sintassi del css, prendo solo le checbox spuntate
    const checkboxSelezionate = document.querySelectorAll("#listaMembri input[type='checkbox']:checked");
    if (checkboxSelezionate.length === 0) {
        areaErroreSpesa.textContent = "Devi selezionare almeno un partecipante per dividere la spesa";
        areaErroreSpesa.classList.remove("nascosto");
        return;
    }

    const nome = inputNome.value.trim();

    //dati per il php
    const datiSpesa = new FormData();
    datiSpesa.append("id_gruppo", idGruppo);
    datiSpesa.append("nome", nome );
    datiSpesa.append("prezzo", inputPrezzo.value);

    //ciclo sulle checkbox spuntate, per ognuna aggiungo l'id dell'utente a datiSpesa
    // Aggiungo "[]" al nome, così dico al PHP che è un array e non un singolo valore
    checkboxSelezionate.forEach(checkbox => {
        datiSpesa.append("partecipanti[]", checkbox.value); //riceve come al solito $_POST["partecipanti"]
    });

    aggiungiSpesa(dialogSpesa,datiSpesa,caricaSpese); //chiamo aggiungi_spesa.php
});

inputPrezzo.addEventListener("input", () => {
    inputPrezzo.classList.toggle("inputErrore", !inputPrezzo.checkValidity());

});

inputNome.addEventListener("input", () => {
    inputNome.classList.toggle("inputErrore", !inputNome.checkValidity());

});

async function elimina(id,bottone) {
    bottone.disabled = true; //per evitare doppi click
    bottone.textContent = "Eliminazione...";

    try {
        const dati = new FormData();
        dati.append("id_spesa", id);

        const risultato = await inviaRichiesta("../php/elimina_spesa.php", dati);

        if (risultato.success === true) {
            chiudiDialog(dialogEliminazione);
            await caricaSpese();
        }
        else {
            console.error("Errore del server:", risultato.message);
        }
    }
    catch (errore) {
        console.error("Errore di rete:", errore);
    } finally { //sia errore che successo
        bottone.disabled = false;
        bottone.textContent = "Elimina";
    }
}

btnChiudiDettaglio.addEventListener("click", (event) => {
    event.preventDefault();
    chiudiDialog(dialogPartecipanti);
})