const currency = document.getElementById("currency");
const fixedCosts = document.getElementById("fixedCosts");
const sellingPrice = document.getElementById("sellingPrice");
const variableCost = document.getElementById("variableCost");
const expectedUnits = document.getElementById("expectedUnits");

const fixedCurrency = document.getElementById("fixedCurrency");
const sellingCurrency = document.getElementById("sellingCurrency");
const variableCurrency = document.getElementById("variableCurrency");

const calculateButton = document.getElementById("calculateButton");
const exampleButton = document.getElementById("exampleButton");
const clearButton = document.getElementById("clearButton");

const calculatorError = document.getElementById("calculatorError");

const breakEvenUnits = document.getElementById("breakEvenUnits");
const breakEvenNote = document.getElementById("breakEvenNote");
const breakEvenRevenue = document.getElementById("breakEvenRevenue");
const contributionPerUnit = document.getElementById("contributionPerUnit");
const contributionMargin = document.getElementById("contributionMargin");
const resultFixedCosts = document.getElementById("resultFixedCosts");
const resultExpectedUnits = document.getElementById("resultExpectedUnits");
const unitsDifference = document.getElementById("unitsDifference");
const estimatedProfit = document.getElementById("estimatedProfit");
const formulaText = document.getElementById("formulaText");

const resultPrimary = document.querySelector(".result-primary");


/* =========================================================
   FORMATTING
   ========================================================= */

function money(value) {
    return `${currency.value} ${Number(value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}


function number(value, decimals = 2) {
    return Number(value).toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
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
   CURRENCY LABELS
   ========================================================= */

function updateCurrencyLabels() {
    fixedCurrency.textContent = currency.value;
    sellingCurrency.textContent = currency.value;
    variableCurrency.textContent = currency.value;
}


/* =========================================================
   RESET
   ========================================================= */

function resetResults() {

    breakEvenUnits.textContent = "0";

    breakEvenNote.textContent =
        "Enter your values and calculate.";

    breakEvenRevenue.textContent = money(0);
    contributionPerUnit.textContent = money(0);
    contributionMargin.textContent = "0.00%";
    resultFixedCosts.textContent = money(0);

    resultExpectedUnits.textContent = "—";
    unitsDifference.textContent = "—";
    estimatedProfit.textContent = "—";

    formulaText.textContent =
        "Break-Even Units = Fixed Costs ÷ (Selling Price − Variable Cost per Unit)";

    resultPrimary.classList.remove("positive", "loss");
}


/* =========================================================
   CALCULATE
   ========================================================= */

function calculate() {

    hideError();

    const fixed = Number(fixedCosts.value);
    const price = Number(sellingPrice.value);
    const variable = Number(variableCost.value);

    if (
        fixedCosts.value.trim() === "" ||
        !Number.isFinite(fixed) ||
        fixed < 0
    ) {
        showError("Please enter valid fixed costs.");
        return;
    }


    if (
        sellingPrice.value.trim() === "" ||
        !Number.isFinite(price) ||
        price <= 0
    ) {
        showError(
            "Selling price per unit must be greater than zero."
        );
        return;
    }


    if (
        variableCost.value.trim() === "" ||
        !Number.isFinite(variable) ||
        variable < 0
    ) {
        showError(
            "Please enter a valid variable cost per unit."
        );
        return;
    }


    const contribution = price - variable;


    /*
       Break-even requires a positive contribution.
    */

    if (contribution <= 0) {

        showError(
            "Selling price must be greater than variable cost to produce a positive contribution margin."
        );

        return;
    }


    const marginPercent =
        (contribution / price) * 100;


    /*
       Exact break-even units may contain a decimal.
       Operationally, a business normally needs to sell
       the next whole unit to fully cover fixed costs.
    */

    const exactBreakEven =
        fixed / contribution;

    const requiredUnits =
        Math.ceil(exactBreakEven);

    const revenueAtRequiredUnits =
        requiredUnits * price;


    /* =====================================================
       MAIN RESULTS
       ===================================================== */

    breakEvenUnits.textContent =
        requiredUnits.toLocaleString();

    breakEvenRevenue.textContent =
        money(revenueAtRequiredUnits);

    contributionPerUnit.textContent =
        money(contribution);

    contributionMargin.textContent =
        `${marginPercent.toFixed(2)}%`;

    resultFixedCosts.textContent =
        money(fixed);


    if (fixed === 0) {

        breakEvenNote.textContent =
            "With no fixed costs, the break-even point is 0 units.";

    } else if (requiredUnits === exactBreakEven) {

        breakEvenNote.textContent =
            `${requiredUnits.toLocaleString()} units are required to cover fixed costs.`;

    } else {

        breakEvenNote.textContent =
            `${number(exactBreakEven, 2)} units mathematically; rounded up to ${requiredUnits.toLocaleString()} whole units.`;
    }


    resultPrimary.classList.remove("loss");
    resultPrimary.classList.add("positive");


    /* =====================================================
       EXPECTED SALES — OPTIONAL
       ===================================================== */

    if (expectedUnits.value.trim() !== "") {

        const expected =
            Number(expectedUnits.value);

        if (
            !Number.isFinite(expected) ||
            expected < 0 ||
            !Number.isInteger(expected)
        ) {

            showError(
                "Expected sales volume must be a whole number of units."
            );

            return;
        }


        const difference =
            expected - requiredUnits;

        const profit =
            (expected * contribution) - fixed;


        resultExpectedUnits.textContent =
            `${expected.toLocaleString()} units`;


        if (difference > 0) {

            unitsDifference.textContent =
                `${difference.toLocaleString()} above`;

        } else if (difference < 0) {

            unitsDifference.textContent =
                `${Math.abs(difference).toLocaleString()} below`;

        } else {

            unitsDifference.textContent =
                "At break-even";
        }


        if (profit > 0) {

            estimatedProfit.textContent =
                `${money(profit)} Profit`;

        } else if (profit < 0) {

            estimatedProfit.textContent =
                `${money(Math.abs(profit))} Loss`;

        } else {

            estimatedProfit.textContent =
                `${money(0)} Break-even`;
        }

    } else {

        resultExpectedUnits.textContent = "—";
        unitsDifference.textContent = "—";
        estimatedProfit.textContent = "—";
    }


    /* =====================================================
       FORMULA BREAKDOWN
       ===================================================== */

    formulaText.textContent =
        `${money(fixed)} ÷ (${money(price)} − ${money(variable)}) = ${number(exactBreakEven, 2)} units → ${requiredUnits.toLocaleString()} whole units`;

}


/* =========================================================
   LOAD EXAMPLE
   ========================================================= */

function loadExample() {

    hideError();

    currency.value = "QAR";

    fixedCosts.value = "10000";
    sellingPrice.value = "100";
    variableCost.value = "60";
    expectedUnits.value = "400";

    updateCurrencyLabels();

    calculate();
}


/* =========================================================
   CLEAR
   ========================================================= */

function clearCalculator() {

    hideError();

    currency.value = "QAR";

    fixedCosts.value = "";
    sellingPrice.value = "";
    variableCost.value = "";
    expectedUnits.value = "";

    updateCurrencyLabels();
    resetResults();
}


/* =========================================================
   EVENTS
   ========================================================= */

calculateButton.addEventListener("click", calculate);

exampleButton.addEventListener("click", loadExample);

clearButton.addEventListener("click", clearCalculator);


[
    fixedCosts,
    sellingPrice,
    variableCost,
    expectedUnits
].forEach(input => {

    input.addEventListener("keydown", event => {

        if (event.key === "Enter") {
            calculate();
        }

    });

});


currency.addEventListener("change", () => {

    updateCurrencyLabels();

    /*
       Recalculate existing values so all displayed
       currency labels update immediately.
    */

    if (
        fixedCosts.value &&
        sellingPrice.value &&
        variableCost.value
    ) {
        calculate();
    } else {
        resetResults();
    }

});


/* =========================================================
   INITIALIZE
   ========================================================= */

updateCurrencyLabels();
resetResults();