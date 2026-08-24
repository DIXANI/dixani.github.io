const tabs = document.querySelectorAll(".calc-tab");

const currency = document.getElementById("currency");
const costPrice = document.getElementById("costPrice");
const sellingPrice = document.getElementById("sellingPrice");
const targetMargin = document.getElementById("targetMargin");
const quantity = document.getElementById("quantity");

const sellingPriceGroup = document.getElementById("sellingPriceGroup");
const targetMarginGroup = document.getElementById("targetMarginGroup");

const inputHeading = document.getElementById("inputHeading");
const inputDescription = document.getElementById("inputDescription");

const calculateButton = document.getElementById("calculateButton");
const exampleButton = document.getElementById("exampleButton");
const clearButton = document.getElementById("clearButton");

const calculatorError = document.getElementById("calculatorError");

const primaryResultLabel = document.getElementById("primaryResultLabel");
const primaryResult = document.getElementById("primaryResult");
const primaryResultNote = document.getElementById("primaryResultNote");

const profitPerUnit = document.getElementById("profitPerUnit");
const markupPercent = document.getElementById("markupPercent");
const resultSellingPrice = document.getElementById("resultSellingPrice");
const resultCostPrice = document.getElementById("resultCostPrice");
const totalRevenue = document.getElementById("totalRevenue");
const totalCost = document.getElementById("totalCost");
const totalProfit = document.getElementById("totalProfit");

const costCurrency = document.getElementById("costCurrency");
const sellingCurrency = document.getElementById("sellingCurrency");

const formulaBox = document.getElementById("formulaBox");
const resultPrimary = document.querySelector(".result-primary");

let currentMode = "margin";

function money(value) {
    return `${currency.value} ${Number(value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}

function percent(value) {
    return `${Number(value).toFixed(2)}%`;
}

function showError(message) {
    calculatorError.textContent = message;
    calculatorError.classList.add("show");
}

function hideError() {
    calculatorError.textContent = "";
    calculatorError.classList.remove("show");
}

function updateCurrencyLabels() {
    costCurrency.textContent = currency.value;
    sellingCurrency.textContent = currency.value;
}

function resetResults() {
    primaryResultLabel.textContent =
        currentMode === "margin" ? "Profit Margin" : "Required Selling Price";

    primaryResult.textContent =
        currentMode === "margin" ? "0.00%" : money(0);

    primaryResultNote.textContent = "Enter your values and calculate.";

    profitPerUnit.textContent = money(0);
    markupPercent.textContent = "0.00%";
    resultSellingPrice.textContent = money(0);
    resultCostPrice.textContent = money(0);
    totalRevenue.textContent = money(0);
    totalCost.textContent = money(0);
    totalProfit.textContent = money(0);

    resultPrimary.classList.remove("loss", "positive");
}

function switchMode(mode) {
    currentMode = mode;

    tabs.forEach(tab => {
        tab.classList.toggle(
            "active",
            tab.dataset.mode === mode
        );
    });

    hideError();

    if (mode === "margin") {
        sellingPriceGroup.classList.remove("hidden");
        targetMarginGroup.classList.add("hidden");

        inputHeading.textContent = "Calculate Profit Margin";
        inputDescription.textContent =
            "Enter your cost price and selling price to calculate profit, margin and markup.";

        formulaBox.innerHTML = `
            <strong>Profit Margin Formula</strong>
            <p>
                Margin % = (Selling Price − Cost Price)
                ÷ Selling Price × 100
            </p>
        `;
    } else {
        sellingPriceGroup.classList.add("hidden");
        targetMarginGroup.classList.remove("hidden");

        inputHeading.textContent = "Calculate Target Selling Price";
        inputDescription.textContent =
            "Enter your cost price and desired profit margin to calculate the required selling price.";

        formulaBox.innerHTML = `
            <strong>Target Selling Price Formula</strong>
            <p>
                Selling Price = Cost Price
                ÷ (1 − Target Margin)
            </p>
        `;
    }

    resetResults();
}

function getQuantity() {
    const q = parseFloat(quantity.value);

    if (!quantity.value.trim()) {
        return 1;
    }

    if (!Number.isFinite(q) || q <= 0) {
        return null;
    }

    return q;
}

function calculateMarginMode() {
    const cost = parseFloat(costPrice.value);
    const sell = parseFloat(sellingPrice.value);
    const qty = getQuantity();

    if (!Number.isFinite(cost) || cost < 0) {
        showError("Please enter a valid cost price.");
        return;
    }

    if (!Number.isFinite(sell) || sell <= 0) {
        showError("Please enter a valid selling price greater than zero.");
        return;
    }

    if (qty === null) {
        showError("Quantity must be greater than zero.");
        return;
    }

    hideError();

    const profit = sell - cost;
    const margin = (profit / sell) * 100;

    let markup = 0;

    if (cost > 0) {
        markup = (profit / cost) * 100;
    } else if (profit > 0) {
        markup = Infinity;
    }

    const revenue = sell * qty;
    const costTotal = cost * qty;
    const profitTotal = profit * qty;

    primaryResultLabel.textContent = "Profit Margin";
    primaryResult.textContent = percent(margin);

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

    profitPerUnit.textContent = money(profit);

    markupPercent.textContent =
        Number.isFinite(markup)
            ? percent(markup)
            : "N/A";

    resultSellingPrice.textContent = money(sell);
    resultCostPrice.textContent = money(cost);

    totalRevenue.textContent = money(revenue);
    totalCost.textContent = money(costTotal);
    totalProfit.textContent = money(profitTotal);
}

function calculateTargetMode() {
    const cost = parseFloat(costPrice.value);
    const margin = parseFloat(targetMargin.value);
    const qty = getQuantity();

    if (!Number.isFinite(cost) || cost < 0) {
        showError("Please enter a valid cost price.");
        return;
    }

    if (!Number.isFinite(margin) || margin < 0 || margin >= 100) {
        showError("Target margin must be between 0% and less than 100%.");
        return;
    }

    if (qty === null) {
        showError("Quantity must be greater than zero.");
        return;
    }

    hideError();

    const decimalMargin = margin / 100;

    const requiredSellingPrice =
        cost / (1 - decimalMargin);

    const profit = requiredSellingPrice - cost;

    const markup =
        cost > 0
            ? (profit / cost) * 100
            : 0;

    const revenue = requiredSellingPrice * qty;
    const totalCostValue = cost * qty;
    const totalProfitValue = profit * qty;

    primaryResultLabel.textContent =
        "Required Selling Price";

    primaryResult.textContent =
        money(requiredSellingPrice);

    primaryResultNote.textContent =
        `Required selling price for a ${margin.toFixed(2)}% margin.`;

    resultPrimary.classList.remove("loss");
    resultPrimary.classList.add("positive");

    profitPerUnit.textContent = money(profit);
    markupPercent.textContent = percent(markup);
    resultSellingPrice.textContent = money(requiredSellingPrice);
    resultCostPrice.textContent = money(cost);
    totalRevenue.textContent = money(revenue);
    totalCost.textContent = money(totalCostValue);
    totalProfit.textContent = money(totalProfitValue);
}

function calculate() {
    if (currentMode === "margin") {
        calculateMarginMode();
    } else {
        calculateTargetMode();
    }
}

function loadExample() {
    hideError();

    currency.value = "QAR";
    updateCurrencyLabels();

    costPrice.value = "100";
    quantity.value = "10";

    if (currentMode === "margin") {
        sellingPrice.value = "150";
        targetMargin.value = "";
    } else {
        targetMargin.value = "30";
        sellingPrice.value = "";
    }

    calculate();
}

function clearCalculator() {
    hideError();

    costPrice.value = "";
    sellingPrice.value = "";
    targetMargin.value = "";
    quantity.value = "";

    resetResults();
}

tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        switchMode(tab.dataset.mode);
    });
});

currency.addEventListener("change", () => {
    updateCurrencyLabels();
    resetResults();
});

calculateButton.addEventListener("click", calculate);
exampleButton.addEventListener("click", loadExample);
clearButton.addEventListener("click", clearCalculator);

[
    costPrice,
    sellingPrice,
    targetMargin,
    quantity
].forEach(input => {
    input.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            calculate();
        }
    });
});

updateCurrencyLabels();
switchMode("margin");