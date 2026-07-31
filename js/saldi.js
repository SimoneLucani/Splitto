const btnIndietroLista = document.getElementById("btnIndietroLista");
const titoloNomeGruppo = document.getElementById("titoloNomeGruppo");

const spazioListaSaldi = document.getElementById("spazioListaSaldi");
const areaPagamentiConsigliati = document.getElementById("areaPagamentiConsigliati");

const parametriUrl = new URLSearchParams(window.location.search)
const idGruppo = parametriUrl.get("id");

const datiGruppo = new FormData();
datiGruppo.append("id_gruppo", idGruppo);


document.addEventListener("DOMContentLoaded", () => {
    caricaNomeMembri(); //common
    caricaSaldi();
});

btnIndietroLista.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.href = "../html/dettaglio_gruppo.html?id=" + idGruppo;
});

async function caricaSaldi() {
    try {
        const risultato = await inviaRichiesta("../php/saldi.php", datiGruppo);

        if (risultato.success === true) {
            spazioListaSaldi.textContent = "";
            const lista = risultato.saldi;
            const h2 = document.createElement("h2");
            h2.textContent = "Situazione attuale "
            spazioListaSaldi.appendChild(h2);
            lista.forEach(utente => {
                const divUtente = document.createElement("div");
                divUtente.classList.add("bloccoBianco");
                divUtente.classList.add("bloccoLista");

                const contenitore = document.createElement("div");
                contenitore.classList.add("infoGruppo");

                const titoloUtente = document.createElement("h3");
                titoloUtente.classList.add("titoloOggetto");
                titoloUtente.textContent = utente.nome_utente;
                contenitore.appendChild(titoloUtente);


                const divSaldo = document.createElement("div");
                const valoreAssoluto = Math.abs(utente.saldo);
                const saldo = parseFloat(valoreAssoluto).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
                divSaldo.classList.add("prezzo");
                
                if (utente.saldo > 0) {
                    divSaldo.style.color = "#2e7d5b"; //colore-successo
                    divSaldo.textContent = "+ " + saldo;
                }

                else if (utente.saldo < 0) {
                    divSaldo.style.color = "#c0392b"; //colore-errore
                    divSaldo.textContent = "- " + saldo;
                }

                else {
                    divSaldo.style.color = "#665c54"; //colore-testo2
                    divSaldo.textContent = " " + saldo;
                }
                

                divUtente.appendChild(contenitore);
                divUtente.appendChild(divSaldo);
                spazioListaSaldi.appendChild(divUtente);

            });
            const pagamenti = calcolaPagamenti(lista);
            mostraPagamenti(pagamenti);
        }
    }
    catch (errore) {
        console.error("Errore nella scrittura del titolo:", errore)
    }
}

//funzione per il calcolo dei pagamenti da fare per saldare il debito nel minor numero di transazioni possibili
//logica divido tra creditori e debitori. Prendo i due "estremi". Quindi pareggio 1 (o due se va bene), rifaccio
function calcolaPagamenti(lista) {
    // Converto in centesimi per evitare errori di arrotondamento
    // e creo due array separati: chi deve ricevere, chi deve dare
    const creditori = [];
    const debitori = [];

    lista.forEach(utente => {
        const centesimi = Math.round(utente.saldo * 100);
        if (centesimi > 0) {
            creditori.push({ nome: utente.nome_utente, importo: centesimi });
        } else if (centesimi < 0) {
            debitori.push({ nome: utente.nome_utente, importo: -centesimi }); // reso positivo
        }
        // saldo == 0: non partecipa, non deve né dare né ricevere
    });

    // ordine decrescente: chi ha il credito/debito più alto viene fatto per primo
    creditori.sort((a, b) => b.importo - a.importo);
    debitori.sort((a, b) => b.importo - a.importo);

    const pagamenti = [];
    let i = 0, j = 0;

    while (i< debitori.length && j < creditori.length) {
        const debitore = debitori[i];
        const creditore = creditori[j];

        const importo = Math.min(debitore.importo, creditore.importo);

        pagamenti.push({
            da: debitore.nome,
            a: creditore.nome,
            importo: importo / 100   // riconverto in euro per l'output
        });

        debitore.importo -= importo;
        creditore.importo -= importo;

        // chi si è esaurito (arriva a 0) passa al successivo
        if (debitore.importo === 0) {
            i++;
        }
        if (creditore.importo === 0) {
            j++;
        }
    }

    return pagamenti;
}

//funzione per visualizzare i pagamenti consigliati
function mostraPagamenti(pagamenti) {
    areaPagamentiConsigliati.textContent = "";
    if (pagamenti.length > 0) {
        pagamenti.forEach(pagamento => {
            const div = document.createElement("div");
            const azione = document.createElement("div");
            azione.textContent = pagamento.da + "  paga  " + pagamento.a;
            azione.classList.add("titoloOggetto");
    
            const freccia = document.createElement("span");
            freccia.textContent = "→";
            freccia.classList.add("frecciaPagamento");
            
            div.appendChild(azione);
            div.appendChild(freccia);
            div.classList.add("bloccoLista");
            const quanto = document.createElement("div");
            const soldi = parseFloat(pagamento.importo).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
            quanto.textContent = soldi;
            quanto.classList.add("prezzo");
            div.appendChild(quanto);
            areaPagamentiConsigliati.appendChild(div);
        });
    }
    else {
        const div = document.createElement("div");
        div.textContent = "Non è necessario effettuare nessun pagamento, tutti i conti sono in pari"
        div.classList.add("testoSemplice");
        areaPagamentiConsigliati.appendChild(div);
    }
}