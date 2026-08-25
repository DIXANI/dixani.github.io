const tabs = document.querySelectorAll(".calc-tab");

const currency = document.getElementById("currency");
const costPrice = document.getElementById("costPrice");
const markupPercentInput = document.getElementById("markupPercentInput");
const sellingPrice = document.getElementById("sellingPrice");
const quantity = document.getElementById("quantity");

const markupInputGroup = document.getElementById("markupInputGroup");
const sellingPriceGroup = document.getElementById("sellingPriceGroup");

const inputHeading = document.getElementById("inputHeading");
const inputDescription = document.getElementById("inputDescription");

const calculateButton = document.getElementById("calculateButton");
const exampleButton = document.getElementById("exampleButton");
const clearButton = document.getElementById("clearButton");

const calculatorError = document.getElementById("calculatorError");

const primaryResultLabel = document.getElementById("primaryResultLabel");
const primaryResult = document.getElementById("primaryResult");
const primaryResultNote = document.getElementById("primaryResultNote");

const resultMarkup = document.getElementById("resultMarkup");
const resultMargin = document.getElementById("resultMargin");
const profitPerUnit = document.getElementById("profitPerUnit");
const resultSellingPrice = document.getElementById("resultSellingPrice");
const totalRevenue = document.getElementById("totalRevenue");
const totalCost = document.getElementById("totalCost");
const totalProfit = document.getElementById("totalProfit");

const costCurrency = document.getElementById("costCurrency");
const sellingCurrency = document.getElementById("sellingCurrency");

const formulaBox = document.getElementById("formulaBox");
const resultPrimary = document.querySelector(".result-primary");

let currentMode = "selling";


/* =========================================================
   FORMATTING
   ========================================================= */

function money(value) {
    return `${currency.value} ${Number(value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}

function percent(value) {
    return `${Number(value).toFixed(2)}%`;
}


/* =========================================================
   ERROR MESSAGE
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

function updateCurrencyLabels() {
    costCurrency.textContent = currency.value;
    sellingCurrency.textContent = currency.value;
}


/* =========================================================
   RESET RESULTS
   ========================================================= */

function resetResults() {

    if (currentMode === "selling") {
        primaryResultLabel.textContent = "Selling Price";
        primaryResult.textContent = money(0);
    } else {
        primaryResultLabel.textContent = "Markup";
        primaryResult.textContent = "0.00%";
    }

    primaryResultNote.textContent =
        "Enter your values and calculate.";

    resultMarkup.textContent = "0.00%";
    resultMargin.textContent = "0.00%";

    profitPerUnit.textContent = money(0);
    resultSellingPrice.textContent = money(0);

    totalRevenue.textContent = money(0);
    totalCost.textContent = money(0);
    totalProfit.textContent = money(0);

    resultPrimary.classList.remove("loss", "positive");
}


/* =========================================================
   SWITCH MODE
   ========================================================= */

function switchMode(mode) {

    currentMode = mode;

    tabs.forEach(tab => {
        tab.classList.toggle(
            "active",
            tab.dataset.mode === mode
        );
    });

    hideError();

    if (mode === "selling") {

        markupInputGroup.classList.remove("hidden");
        sellingPriceGroup.classList.add("hidden");

        inputHeading.textContent =
            "Calculate Selling Price";

        inputDescription.textContent =
            "Enter your cost price and markup percentage to calculate the required selling price.";

        formulaBox.innerHTML = `
            <strong>Selling Price Formula</strong>
            <p>
                Selling Price = Cost Price × (1 + Markup %)
            </p>
        `;

    } else {

        markupInputGroup.classList.add("hidden");
        sellingPriceGroup.classList.remove("hidden");

        inputHeading.textContent =
            "Calculate Markup";

        inputDescription.textContent =
            "Enter your cost price and selling price to calculate markup, margin and profit.";

        formulaBox.innerHTML = `
            <strong>Markup Formula</strong>
            <p>
                Markup % = (Selling Price − Cost Price)
                ÷ Cost Price × 100
            </p>
        `;
    }

    resetResults();
}


/* =========================================================
   QUANTITY
   ========================================================= */

function getQuantity() {

    if (!quantity.value.trim()) {
        return 1;
    }

    const qty = parseFloat(quantity.value);

    if (!Number.isFinite(qty) || qty <= 0) {
        return null;
    }

    return qty;
}


/* =========================================================
   MODE 1 — COST + MARKUP → SELLING PRICE
   ========================================================= */

function calculateSellingPrice() {

    const cost = parseFloat(costPrice.value);
    const markup = parseFloat(markupPercentInput.value);
    const qty = getQuantity();

    if (!Number.isFinite(cost) || cost < 0) {
        showError("Please enter a valid cost price.");
        return;
    }

    if (!Number.isFinite(markup)) {
        showError("Please enter a valid markup percentage.");
        return;
    }

    if (markup < -100) {
        showError("Markup cannot be less than -100%.");
        return;
    }

    if (qty === null) {
        showError("Quantity must be greater than zero.");
        return;
    }

    const sell = cost * (1 + markup / 100);

    if (sell < 0) {
        showError("The calculated selling price cannot be negative.");
        return;
    }

    hideError();

    const profit = sell - cost;

    let margin = 0;

    if (sell > 0) {
        margin = (profit / sell) * 100;
    }

    const revenue = sell * qty;
    const costTotal = cost * qty;
    const profitTotal = profit * qty;

    primaryResultLabel.textContent =
        "Selling Price";

    primaryResult.textContent =
        money(sell);

    if (profit > 0) {

        primaryResultNote.textContent =
            `${money(profit)} profit per unit.`;

        resultPrimary.classList.remove("loss");
        resultPrimary.classList.add("positive");

    } else if (profit < 0) {

        primaryResultNote.textContent =
            `${money(Math.abs(profit))} loss per unit.`;

        resultPrimary.classList.remove("positive");
        resultPrimary.classList.add("loss");

    } else {

        primaryResultNote.textContent =
            "Selling price equals cost price — no profit or loss.";

        resultPrimary.classList.remove("loss", "positive");
    }

    resultMarkup.textContent =
        percent(markup);

    resultMargin.textContent =
        percent(margin);

    profitPerUnit.textContent =
        money(profit);

    resultSellingPrice.textContent =
        money(sell);

    totalRevenue.textContent =
        money(revenue);

    totalCost.textContent =
        money(costTotal);

    totalProfit.textContent =
        money(profitTotal);
}


/* =========================================================
   MODE 2 — COST + SELLING PRICE → MARKUP
   ========================================================= */

function calculateMarkup() {

    const cost = parseFloat(costPrice.value);
    const sell = parseFloat(sellingPrice.value);
    const qty = getQuantity();

    if (!Number.isFinite(cost) || cost <= 0) {
        showError(
            "Cost price must be greater than zero to calculate markup."
        );
        return;
    }

    if (!Number.isFinite(sell) || sell < 0) {
        showError("Please enter a valid selling price.");
        return;
    }

    if (qty === null) {
        showError("Quantity must be greater than zero.");
        return;
    }

    hideError();

    const profit = sell - cost;

    const markup =
        (profit / cost) * 100;

    let margin = 0;

    if (sell > 0) {
        margin = (profit / sell) * 100;
    }

    const revenue = sell * qty;
    const costTotal = cost * qty;
    const profitTotal = profit * qty;

    primaryResultLabel.textContent =
        "Markup";

    primaryResult.textContent =
        percent(markup);

    if (profit > 0) {

        primaryResultNote.textContent =
            `${money(profit)} profit per unit.`;

        resultPrimary.classList.remove("loss");
        resultPrimary.classList.add("positive");

    } else if (profit < 0) {

        primaryResultNote.textContent =
            `${money(Math.abs(profit))} loss per unit.`;

        resultPrimary.classList.remove("positive");
        resultPrimary.classList.add("loss");

    } else {

        primaryResultNote.textContent =
            "Selling price equals cost price — 0% markup.";

        resultPrimary.classList.remove("loss", "positive");
    }

    resultMarkup.textContent =
        percent(markup);

    resultMargin.textContent =
        sell > 0
            ? percent(margin)
            : "N/A";

    profitPerUnit.textContent =
        money(profit);

    resultSellingPrice.textContent =
        money(sell);

    totalRevenue.textContent =
        money(revenue);

    totalCost.textContent =
        money(costTotal);

    totalProfit.textContent =
        money(profitTotal);
}


/* =========================================================
   CALCULATE
   ========================================================= */

function calculate() {

    if (currentMode === "selling") {
        calculateSellingPrice();
    } else {
        calculateMarkup();
    }
}


/* =========================================================
   LOAD EXAMPLE
   ========================================================= */

function loadExample() {

    hideError();

    currency.value = "QAR";

    updateCurrencyLabels();

    costPrice.value = "100";
    quantity.value = "10";

    if (currentMode === "selling") {

        markupPercentInput.value = "50";
        sellingPrice.value = "";

    } else {

        sellingPrice.value = "150";
        markupPercentInput.value = "";
    }

    calculate();
}


/* =========================================================
   CLEAR
   ========================================================= */

function clearCalculator() {

    hideError();

    costPrice.value = "";
    markupPercentInput.value = "";
    sellingPrice.value = "";
    quantity.value = "";

    resetResults();
}


/* =========================================================
   EVENTS
   ========================================================= */

tabs.forEach(tab => {

    tab.addEventListener("click", () => {
        switchMode(tab.dataset.mode);
    });

});


currency.addEventListener("change", () => {
    updateCurrencyLabels();
    resetResults();
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


/* ENTER KEY */

[
    costPrice,
    markupPercentInput,
    sellingPrice,
    quantity
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


/* =========================================================
   INITIALIZE
   ========================================================= */

updateCurrencyLabels();
switchMode("selling");