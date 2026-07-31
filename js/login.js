const formLogin = document.getElementById("formLogin");
const inputNome = document.getElementById("inputNome");
const inputEmail = document.getElementById("inputEmail");
const inputPassword = document.getElementById("inputPassword");
const btnAccedi = document.getElementById("btnAccedi");
const linkRegistrati = document.getElementById("linkRegistrati");
const areaErrore = document.getElementById("areaErrore");
const labelInputNome = document.getElementById("labelInputNome");
const btnMostra = document.getElementById("btnMostra");

const listaRequisiti = document.getElementById("listaRequisiti");
const reqLunghezza = document.getElementById("reqLunghezza");
const reqMaiuscola = document.getElementById("reqMaiuscola");
const reqNumero = document.getElementById("reqNumero");
const reqSpeciale = document.getElementById("reqSpeciale");

let modalitaRegistrazione = false;



formLogin.addEventListener("submit", async (event) => {
    event.preventDefault();
    
    const nomeValido = !modalitaRegistrazione || inputNome.checkValidity();
    if (inputEmail.checkValidity() && inputPassword.checkValidity() && nomeValido) {
        areaErrore.classList.add("nascosto");
        await invioDati();
    }
    else {
        inputEmail.classList.toggle("inputErrore", !inputEmail.checkValidity());
        inputPassword.classList.toggle("inputErrore", !inputPassword.checkValidity());
        if (modalitaRegistrazione) {
            inputNome.classList.toggle("inputErrore", !inputNome.checkValidity());
        }

        areaErrore.textContent = "Credenziali non valide";
        areaErrore.classList.remove("nascosto");
        console.log("Problema login");
    }
});

//controllo password in modalità registrazione
inputPassword.addEventListener("input", (event) => {
    if (!modalitaRegistrazione) return;

    const password = inputPassword.value;

    //almeno 8 caratteri
    const lunghezzaValida = password.length >= 8;
    reqLunghezza.classList.toggle("valido", lunghezzaValida);
    reqLunghezza.classList.toggle("invalido", !lunghezzaValida);

    //maiuscola
    const maiuscolaValida = /[A-Z]/.test(password);
    reqMaiuscola.classList.toggle("valido", maiuscolaValida);
    reqMaiuscola.classList.toggle("invalido", !maiuscolaValida);

    //numero
    const numeroValido = /[0-9]/.test(password);
    reqNumero.classList.toggle("valido", numeroValido);
    reqNumero.classList.toggle("invalido", !numeroValido);

    // carattere speciale 
    const specialeValido = /[!@#$%^&*(),.?":{}|<>\-_]/.test(password);
    reqSpeciale.classList.toggle("valido", specialeValido);
    reqSpeciale.classList.toggle("invalido", !specialeValido);
});

inputNome.addEventListener("input", () => {
    inputNome.classList.toggle("inputErrore", !inputNome.checkValidity());
});

inputEmail.addEventListener("input", () => {
    inputEmail.classList.toggle("inputErrore", !inputEmail.checkValidity());
});

inputPassword.addEventListener("input", () => {
    inputPassword.classList.toggle("inputErrore", !inputPassword.checkValidity());
});

async function invioDati() {
    //Raccoglie email e password dal form
    const datiForm = new FormData(formLogin);
    const url = modalitaRegistrazione ? "php/registrazione.php" : "php/login.php";

    const risultato = await inviaRichiesta(url, datiForm);

    if (risultato.success === true) {
        console.log("sei loggato");
        areaErrore.classList.add("nascosto");
        if (!modalitaRegistrazione) { //era un login riuscito
            window.location.href = "html/gruppi.html"
        }
        else { //era una registrazione riuscita
            modalitaRegistrazione = !modalitaRegistrazione;
            inputNome.required = modalitaRegistrazione;
            labelInputNome.classList.toggle("nascosto", !modalitaRegistrazione);
            btnAccedi.textContent = modalitaRegistrazione ? "Registrati" : "Accedi";
            linkRegistrati.textContent = modalitaRegistrazione ? "Hai già un account? Accedi" : "Non hai un account? Registrati";
            listaRequisiti.classList.toggle("nascosto", !modalitaRegistrazione);
        }
    }
    else {
        console.log(risultato.message);
        areaErrore.textContent = risultato.message;
        inputEmail.classList.toggle("inputErrore", !inputEmail.checkValidity());
        inputPassword.classList.toggle("inputErrore", !inputPassword.checkValidity());
        inputNome.classList.toggle("inputErrore", !inputNome.checkValidity());
        areaErrore.classList.remove("nascosto");
    }
}

// registrazione
linkRegistrati.addEventListener("click", (event) => {
    event.preventDefault();
    
    modalitaRegistrazione = !modalitaRegistrazione;
    inputNome.required = modalitaRegistrazione;
    labelInputNome.classList.toggle("nascosto", !modalitaRegistrazione);
    btnAccedi.textContent = modalitaRegistrazione ? "Registrati" : "Accedi";
    linkRegistrati.textContent = modalitaRegistrazione ? "Hai già un account? Accedi" : "Non hai un account? Registrati";

    areaErrore.classList.add("nascosto");
    inputNome.classList.remove("inputErrore");
    inputEmail.classList.remove("inputErrore");
    inputPassword.classList.remove("inputErrore");

    listaRequisiti.classList.toggle("nascosto", !modalitaRegistrazione);

    formLogin.reset()
});

btnMostra.addEventListener("click", (event) => {
    event.preventDefault();

    const tipoAttuale = inputPassword.getAttribute("type");

    //pallini
    if (tipoAttuale === "password") {
        inputPassword.setAttribute("type", "text");
        btnMostra.textContent = "Nascondi";
    }
    else {
        inputPassword.setAttribute("type", "password");
        btnMostra.textContent = "Mostra";
    }
        
    
})





