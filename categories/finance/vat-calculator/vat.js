/* =========================================================
   ELEMENTS
   ========================================================= */

const tabs = document.querySelectorAll(".calc-tab");

const currency = document.getElementById("currency");
const amount = document.getElementById("amount");
const vatRate = document.getElementById("vatRate");

const amountCurrency = document.getElementById("amountCurrency");
const amountLabel = document.getElementById("amountLabel");
const amountHelp = document.getElementById("amountHelp");

const inputHeading = document.getElementById("inputHeading");
const inputDescription = document.getElementById("inputDescription");

const calculateButton = document.getElementById("calculateButton");
const exampleButton = document.getElementById("exampleButton");
const clearButton = document.getElementById("clearButton");

const calculatorError = document.getElementById("calculatorError");

const primaryResultLabel = document.getElementById("primaryResultLabel");
const primaryResult = document.getElementById("primaryResult");
const primaryResultNote = document.getElementById("primaryResultNote");

const netAmount = document.getElementById("netAmount");
const resultVatRate = document.getElementById("resultVatRate");
const vatAmount = document.getElementById("vatAmount");
const grossAmount = document.getElementById("grossAmount");

const formulaBox = document.getElementById("formulaBox");
const resultPrimary = document.querySelector(".result-primary");

let currentMode = "add";


/* =========================================================
   FORMATTING
   ========================================================= */

function money(value) {

    return `${currency.value} ${Number(value).toLocaleString(
        undefined,
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    )}`;
}


function percent(value) {

    return `${Number(value).toLocaleString(
        undefined,
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    )}%`;
}


/* =========================================================
   ERROR HANDLING
   ========================================================= */

function showError(message) {

    calculatorError.textContent = message;
    calculatorError.classList.add("show");
}


function hideError() {

    calculatorError.textContent = "";
    calculatorError.classList.remove("show");
}


/* =========================================================
   CURRENCY
   ========================================================= */

function updateCurrencyLabel() {

    amountCurrency.textContent = currency.value;
}


/* =========================================================
   RESET RESULTS
   ========================================================= */

function resetResults() {

    netAmount.textContent = money(0);
    resultVatRate.textContent = "0.00%";
    vatAmount.textContent = money(0);
    grossAmount.textContent = money(0);

    primaryResult.textContent = money(0);

    primaryResultNote.textContent =
        "Enter your values and calculate.";

    resultPrimary.classList.remove(
        "positive",
        "loss"
    );


    if (currentMode === "add") {

        primaryResultLabel.textContent =
            "Gross Amount";

        formulaBox.innerHTML = `
            <strong>Add VAT Formula</strong>
            <p>
                Gross Amount = Net Amount × (1 + VAT Rate)
            </p>
        `;

    } else {

        primaryResultLabel.textContent =
            "Net Amount";

        formulaBox.innerHTML = `
            <strong>Remove VAT Formula</strong>
            <p>
                Net Amount = Gross Amount ÷ (1 + VAT Rate)
            </p>
        `;
    }
}


/* =========================================================
   MODE SWITCHING
   ========================================================= */

function setMode(mode) {

    currentMode = mode;

    tabs.forEach(tab => {

        tab.classList.toggle(
            "active",
            tab.dataset.mode === mode
        );

    });


    if (mode === "add") {

        inputHeading.textContent =
            "Add VAT to an Amount";

        inputDescription.textContent =
            "Enter the net amount and VAT rate to calculate the VAT amount and gross total.";

        amountLabel.textContent =
            "Net Amount";

        amountHelp.textContent =
            "Enter the amount before VAT is added.";

        primaryResultLabel.textContent =
            "Gross Amount";

    } else {

        inputHeading.textContent =
            "Remove VAT from an Amount";

        inputDescription.textContent =
            "Enter the VAT-inclusive gross amount and VAT rate to calculate the underlying net amount and included VAT.";

        amountLabel.textContent =
            "Gross Amount";

        amountHelp.textContent =
            "Enter the amount that already includes VAT.";

        primaryResultLabel.textContent =
            "Net Amount";
    }


    hideError();
    resetResults();
}


/* =========================================================
   VALIDATION
   ========================================================= */

function getValues() {

    const enteredAmount =
        Number(amount.value);

    const rate =
        Number(vatRate.value);


    if (
        amount.value.trim() === "" ||
        !Number.isFinite(enteredAmount) ||
        enteredAmount < 0
    ) {

        showError(
            "Please enter a valid amount."
        );

        return null;
    }


    if (
        vatRate.value.trim() === "" ||
        !Number.isFinite(rate) ||
        rate < 0
    ) {

        showError(
            "Please enter a valid VAT rate."
        );

        return null;
    }


    return {
        enteredAmount,
        rate
    };
}


/* =========================================================
   ADD VAT
   ========================================================= */

function calculateAddVAT(enteredAmount, rate) {

    const vat =
        enteredAmount * (rate / 100);

    const gross =
        enteredAmount + vat;


    netAmount.textContent =
        money(enteredAmount);

    resultVatRate.textContent =
        percent(rate);

    vatAmount.textContent =
        money(vat);

    grossAmount.textContent =
        money(gross);


    primaryResultLabel.textContent =
        "Gross Amount";

    primaryResult.textContent =
        money(gross);

    primaryResultNote.textContent =
        `${money(vat)} VAT added at ${percent(rate)}.`;


    formulaBox.innerHTML = `
        <strong>Add VAT Formula</strong>

        <p>
            ${money(enteredAmount)} ×
            ${percent(rate)} =
            ${money(vat)} VAT
        </p>

        <p>
            ${money(enteredAmount)} +
            ${money(vat)} =
            ${money(gross)}
        </p>
    `;


    resultPrimary.classList.remove("loss");
    resultPrimary.classList.add("positive");
}


/* =========================================================
   REMOVE VAT
   ========================================================= */

function calculateRemoveVAT(enteredAmount, rate) {

    /*
       Gross = Net × (1 + VAT rate)

       Therefore:

       Net = Gross ÷ (1 + VAT rate)
    */

    const divisor =
        1 + (rate / 100);

    const net =
        enteredAmount / divisor;

    const vat =
        enteredAmount - net;


    netAmount.textContent =
        money(net);

    resultVatRate.textContent =
        percent(rate);

    vatAmount.textContent =
        money(vat);

    grossAmount.textContent =
        money(enteredAmount);


    primaryResultLabel.textContent =
        "Net Amount";

    primaryResult.textContent =
        money(net);

    primaryResultNote.textContent =
        `${money(vat)} VAT is included in the gross amount at ${percent(rate)}.`;


    formulaBox.innerHTML = `
        <strong>Remove VAT Formula</strong>

        <p>
            ${money(enteredAmount)} ÷
            (1 + ${percent(rate)}) =
            ${money(net)}
        </p>

        <p>
            ${money(enteredAmount)} −
            ${money(net)} =
            ${money(vat)} VAT
        </p>
    `;


    resultPrimary.classList.remove("loss");
    resultPrimary.classList.add("positive");
}


/* =========================================================
   CALCULATE
   ========================================================= */

function calculate() {

    hideError();

    const values = getValues();

    if (!values) {
        return;
    }


    if (currentMode === "add") {

        calculateAddVAT(
            values.enteredAmount,
            values.rate
        );

    } else {

        calculateRemoveVAT(
            values.enteredAmount,
            values.rate
        );
    }
}


/* =========================================================
   LOAD EXAMPLE
   ========================================================= */

function loadExample() {

    hideError();

    currency.value = "QAR";
    vatRate.value = "5";

    updateCurrencyLabel();


    if (currentMode === "add") {

        amount.value = "1000";

    } else {

        amount.value = "1050";
    }


    calculate();
}


/* =========================================================
   CLEAR
   ========================================================= */

function clearCalculator() {

    hideError();

    currency.value = "QAR";

    amount.value = "";
    vatRate.value = "";

    updateCurrencyLabel();
    resetResults();
}


/* =========================================================
   EVENTS
   ========================================================= */

tabs.forEach(tab => {

    tab.addEventListener(
        "click",
        () => setMode(tab.dataset.mode)
    );

});


calculateButton.addEventListener(
    "click",
    calculate
);


exampleButton.addEventListener(
    "click",
    loadExample
);


clearButton.addEventListener(
    "click",
    clearCalculator
);


[
    amount,
    vatRate
].forEach(input => {

    input.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {
                calculate();
            }

        }
    );

});


currency.addEventListener(
    "change",
    () => {

        updateCurrencyLabel();

        if (
            amount.value.trim() !== "" &&
            vatRate.value.trim() !== ""
        ) {

            calculate();

        } else {

            resetResults();
        }

    }
);


/* =========================================================
   INITIALIZE
   ========================================================= */

updateCurrencyLabel();
setMode("add");