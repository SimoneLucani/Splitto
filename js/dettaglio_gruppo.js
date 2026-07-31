const btnIndietro = document.getElementById("btnIndietro");
const titoloNomeGruppo = document.getElementById("titoloNomeGruppo");
const trePuntini = document.getElementById("trePuntini");

const menuGruppo = document.getElementById("menuGruppo");
const btnCodiceInvito = document.getElementById("btnCodiceInvito");
const btnAbbandonaGruppo = document.getElementById("btnAbbandonaGruppo");

const dialogDettaglio = document.getElementById("dialogDettaglio");
const titoloModale = document.getElementById("titoloModale");
const areaContenutoModale = document.getElementById("areaContenutoModale");
const btnAnnullaModale = document.getElementById("btnAnnullaModale");
const btnConfermaModale = document.getElementById("btnConfermaModale");

const areaAnteprimaLista = document.getElementById("areaAnteprimaLista");
const areaAnteprimaSpese = document.getElementById("areaAnteprimaSpese");
const areaAnteprimaSaldi = document.getElementById("areaAnteprimaSaldi");

const bloccoListaSpesa = document.getElementById("bloccoListaSpesa");
const bloccoSpese = document.getElementById("bloccoSpese");
const bloccoSaldi = document.getElementById("bloccoSaldi");

//prendo "id "= x window.location.search prende da ? in poi, 
//URLSearchParams associa a "id" il valore associato
const parametriUrl = new URLSearchParams(window.location.search)
const idGruppo = parametriUrl.get("id");
let codiceInvito = "";
let saldoUtenteCorrente = null;




const datiGruppo = new FormData();
datiGruppo.append("id_gruppo", idGruppo);
console.log(idGruppo);

btnIndietro.addEventListener("click", (event) => {
    event.preventDefault();

    window.location.href = "../html/gruppi.html";
});

document.addEventListener("DOMContentLoaded", () => {
    caricaNomeCodice();
    caricaAnteprime();
});

//Prendo il nome e il codice del gruppo
async function caricaNomeCodice() {

    await caricaNomeMembri(); //scrivo il titolo e il codice. Restituice anche i membri ma non serve qui

    // controllo se c'è il parametro "nuovo"
    if (parametriUrl.get("nuovo") === "true") {

        // pulisco l'URL per evitare che se l'utente ricarica la pagina
        // gli ricompaia il popup. Lascio solo l'id.
        const urlPulito = window.location.pathname + "?id=" + parametriUrl.get("id");
        window.history.replaceState({}, document.title, urlPulito); //Per modificare l' URL nella barra

        //  Simulo il click sul bottone del codice invito
        btnCodiceInvito.click();
    }
}



//nelle tre card delle sezioni principali mostro gli ultimi 3 elementi inseriti nella lista della spesa
//gli ultimi tre comprati
//il saldo dell'utente loggato
//per dare una panoramica, per il dettaglio poi clicca sulla sezione interessata
async function caricaAnteprime() {
    areaAnteprimaLista.textContent = "";
    areaAnteprimaSpese.textContent = "";
    areaAnteprimaSaldi.textContent = "";

    if (!idGruppo) {
        window.location.href = "../html/gruppi.html";
        return;
    }

    try {
        const risultato = await inviaRichiesta("../php/anteprime.php", datiGruppo);

        if (risultato.success === true) {

            if (risultato.saldoUtente !== undefined) {
                saldoUtenteCorrente = risultato.saldoUtente;
            }

            //Creo la lista 
            if (risultato.quantiArticoli > 0) {
                const lista = document.createElement("ul");
                risultato.ultimiOggetti.forEach(oggetto => {
                    const elementoLista = document.createElement("li");
                    elementoLista.classList.add("itemAnteprima");
                    const nome = oggetto;
                    elementoLista.textContent = nome.charAt(0).toUpperCase() + nome.slice(1);
                    lista.appendChild(elementoLista);
                });
                areaAnteprimaLista.appendChild(lista);
                if ((risultato.quantiArticoli - 3) > 0) {
                    const rimanenti = document.createElement("div");
                    rimanenti.classList.add("altriAnteprima");
                    rimanenti.textContent = "+" + (risultato.quantiArticoli - 3) + " altri";
                    areaAnteprimaLista.appendChild(rimanenti);
                }
                lista.classList.add("listaAnteprima")
            }
            else {
                areaAnteprimaLista.textContent = "Nessun articolo da comprare";
            }

            //ultime tre spese
            if (risultato.ultimeSpese && risultato.ultimeSpese.length > 0) {
                const listaSpese = document.createElement("ul");
                listaSpese.classList.add("listaAnteprima");
                risultato.ultimeSpese.forEach(spesa => {
                    const e = document.createElement("li");
                    const prezzo = parseFloat(spesa.prezzo).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
                    e.classList.add("itemAnteprima");
                    const nome = spesa.nome_articolo;
                    e.textContent = nome.charAt(0).toUpperCase() + nome.slice(1) + ", pagato da " + spesa.nome_acquirente + ":  " + prezzo;
                    listaSpese.appendChild(e);
                });
                areaAnteprimaSpese.appendChild(listaSpese);
            }
            else {
                areaAnteprimaSpese.textContent = "Nessun acquisto recente";
            }

            //saldo personale
            if (risultato.saldoUtente !== undefined) {
                areaAnteprimaSaldi.classList.add("badgeSaldo");
                if (risultato.saldoUtente > 0) {
                    areaAnteprimaSaldi.textContent = "Sei in positivo: " + risultato.saldoUtente + " € ";
                    areaAnteprimaSaldi.style.color = "#2e7d5b";
                }
                else if (risultato.saldoUtente < 0) {
                    areaAnteprimaSaldi.textContent = "Sei in negativo: " + risultato.saldoUtente + " € ";
                    areaAnteprimaSaldi.style.color = "#c0392b";
                }
                else {
                    areaAnteprimaSaldi.textContent = "Sei in pari: " + risultato.saldoUtente + " € ";
                }
            }
        }
    }
    catch (errore) {
        console.error("Errore durante la creazione del gruppo:", errore)
    }
}

bloccoListaSpesa.addEventListener("click", (event) => {
    event.preventDefault();

    window.location.href = "../html/lista_spesa.html?id=" + idGruppo;
});

bloccoSpese.addEventListener("click", (event) => {
    event.preventDefault();

    window.location.href = "../html/spese.html?id=" + idGruppo;
});

bloccoSaldi.addEventListener("click", (event) => {
    event.preventDefault();

    window.location.href = "../html/saldi.html?id=" + idGruppo;
});

trePuntini.addEventListener("click", (event) => {
    event.preventDefault();

    menuGruppo.classList.toggle("nascosto");
})

//per chiudere il menu cliccando fuori
document.addEventListener("click", (event) => {
    const menuAperto = !menuGruppo.classList.contains("nascosto");

    const clickFuori = !trePuntini.contains(event.target);

    if (menuAperto && clickFuori) {
        menuGruppo.classList.add("nascosto");
    }
});

//------click su codice invito------
btnCodiceInvito.addEventListener("click", async (event) => {
    event.preventDefault();

    event.stopPropagation(); //Non fa aprire il menu al "click" del btnCodiceInvito
    menuGruppo.classList.add("nascosto"); // chiudo menu

    apriDialog(dialogDettaglio);

    titoloModale.textContent = "Codice per entrare nel gruppo";
    const h2 = document.createElement("h2");
    h2.textContent = "Condividilo con chi vuoi che si unisca"
    titoloModale.appendChild(h2);

    areaContenutoModale.textContent = codiceInvito;

    areaContenutoModale.className = ""; //resetto stile contenuto
    areaContenutoModale.classList.add("stileCodice");

    btnConfermaModale.textContent = "Copia";
    btnAnnullaModale.textContent = "Chiudi";

        //onclick() per non accumulare listener. onclick() ogni volta sovrascrive
    btnConfermaModale.onclick = (event) => {
        copia(event, areaContenutoModale, btnConfermaModale);
    };

    btnAnnullaModale.onclick = (event) => {
        chiudiDialog(dialogDettaglio);
    }
});

async function copia(event, areaContenuto,bottone) {
    event.preventDefault();

    const testoDaCopiare = areaContenuto.textContent;

    try {
        // Salvo il testo nella clipboard dell'utente
        await navigator.clipboard.writeText(testoDaCopiare);

        const testoOriginale = bottone.textContent;
        bottone.textContent = "Copiato!";

        bottone.disabled = true;
        setTimeout(() => {
            bottone.textContent = testoOriginale;
            bottone.disabled = false;
        }, 2000);

    } catch (errore) {
        console.error('Errore durante la copia negli appunti: ', errore);
    }
}

//----click su abbandona gruppo-----
btnAbbandonaGruppo.addEventListener("click", async (event) => {
    event.preventDefault();

    apriDialog(dialogDettaglio);
    titoloModale.textContent = "Abbandona gruppo";
    areaContenutoModale.className = ""; //resetto stile contenuto
    areaContenutoModale.classList.add("stileMessaggio");
    
    // controllo lato client, il server ricontrolla comunque
    if (saldoUtenteCorrente !== null && Math.abs(saldoUtenteCorrente) > 0.001) {
        const saldoFormattato = parseFloat(saldoUtenteCorrente).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
        areaContenutoModale.innerHTML = "Non puoi abbandonare il gruppo. <br>  Il tuo saldo è: <strong>" + saldoFormattato + "</strong><br>Sistema i conti prima di uscire.";
        btnConfermaModale.classList.add("nascosto"); // nascondo il bottone di conferma
        btnAnnullaModale.textContent = "Chiudi";
        btnAnnullaModale.onclick = () => chiudiDialog(dialogDettaglio);
        return;
    }
    btnConfermaModale.classList.remove("nascosto");

    areaContenutoModale.textContent = "Sei sicuro di voler abbandonare il gruppo?"
    btnConfermaModale.textContent = "Abbandona";
    btnAnnullaModale.textContent = "Annulla";

    //onclick() per non accumulare listener. onclick() ogni volta sovrascrive
    btnConfermaModale.onclick = (event) => {
        abbandona(event, areaContenutoModale, btnConfermaModale);
    };

    btnAnnullaModale.onclick = (event) => {
        chiudiDialog(dialogDettaglio);
    }
    
});

async function abbandona() {
    const dati = new FormData();
    dati.append("id_gruppo", idGruppo);
    const risultato = await inviaRichiesta("../php/abbandona_gruppo.php", dati);

    if (risultato.success === true) {
        window.location.href = "../html/gruppi.html";
    }
    else {
        areaContenutoModale.className = "";
        areaContenutoModale.classList.add("stileMessaggio");
        areaContenutoModale.textContent = risultato.message || "Errore nell'abbandono del gruppo";
        console.error("Errore nell' abbondono del gruppo");
    }
}

