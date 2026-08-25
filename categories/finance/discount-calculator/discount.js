/* =========================================================
   ELEMENTS
   ========================================================= */

const tabs = document.querySelectorAll(".calc-tab");

const currency = document.getElementById("currency");
const originalPrice = document.getElementById("originalPrice");
const discountPercent = document.getElementById("discountPercent");
const salePrice = document.getElementById("salePrice");
const secondDiscount = document.getElementById("secondDiscount");
const quantity = document.getElementById("quantity");

const discountGroup = document.getElementById("discountGroup");
const salePriceGroup = document.getElementById("salePriceGroup");
const secondDiscountGroup = document.getElementById("secondDiscountGroup");

const originalCurrency = document.getElementById("originalCurrency");
const saleCurrency = document.getElementById("saleCurrency");

const inputHeading = document.getElementById("inputHeading");
const inputDescription = document.getElementById("inputDescription");

const calculateButton = document.getElementById("calculateButton");
const exampleButton = document.getElementById("exampleButton");
const clearButton = document.getElementById("clearButton");

const calculatorError = document.getElementById("calculatorError");

const primaryResultLabel = document.getElementById("primaryResultLabel");
const primaryResult = document.getElementById("primaryResult");
const primaryResultNote = document.getElementById("primaryResultNote");

const resultOriginalPrice = document.getElementById("resultOriginalPrice");
const amountSaved = document.getElementById("amountSaved");
const resultDiscount = document.getElementById("resultDiscount");
const effectiveDiscount = document.getElementById("effectiveDiscount");
const resultQuantity = document.getElementById("resultQuantity");
const totalOriginal = document.getElementById("totalOriginal");
const totalSavings = document.getElementById("totalSavings");
const finalTotal = document.getElementById("finalTotal");

const formulaBox = document.getElementById("formulaBox");
const resultPrimary = document.querySelector(".result-primary");

let currentMode = "price";


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

function updateCurrencyLabels() {

    originalCurrency.textContent = currency.value;
    saleCurrency.textContent = currency.value;
}


/* =========================================================
   QUANTITY
   ========================================================= */

function getQuantity() {

    if (quantity.value.trim() === "") {
        return 1;
    }

    const qty = Number(quantity.value);

    if (
        !Number.isFinite(qty) ||
        qty < 1 ||
        !Number.isInteger(qty)
    ) {
        return null;
    }

    return qty;
}


/* =========================================================
   RESET RESULTS
   ========================================================= */

function resetResults() {

    primaryResultLabel.textContent = "Final Price";
    primaryResult.textContent = money(0);

    primaryResultNote.textContent =
        "Enter your values and calculate.";

    resultOriginalPrice.textContent = money(0);
    amountSaved.textContent = money(0);

    resultDiscount.textContent = "0.00%";
    effectiveDiscount.textContent = "0.00%";

    resultQuantity.textContent = "1";

    totalOriginal.textContent = money(0);
    totalSavings.textContent = money(0);
    finalTotal.textContent = money(0);

    formulaBox.innerHTML = `
        <strong>Discount Formula</strong>
        <p>
            Final Price = Original Price × (1 − Discount %)
        </p>
    `;

    resultPrimary.classList.remove(
        "positive",
        "loss"
    );
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


    discountGroup.classList.add("hidden");
    salePriceGroup.classList.add("hidden");
    secondDiscountGroup.classList.add("hidden");


    if (mode === "price") {

        discountGroup.classList.remove("hidden");

        inputHeading.textContent =
            "Calculate Price After Discount";

        inputDescription.textContent =
            "Enter the original price and discount percentage to calculate the sale price and amount saved.";

        primaryResultLabel.textContent =
            "Final Price";

    }


    if (mode === "percentage") {

        salePriceGroup.classList.remove("hidden");

        inputHeading.textContent =
            "Find the Discount Percentage";

        inputDescription.textContent =
            "Enter the original price and sale price to calculate the discount percentage and amount saved.";

        primaryResultLabel.textContent =
            "Discount Percentage";

    }


    if (mode === "stacked") {

        discountGroup.classList.remove("hidden");
        secondDiscountGroup.classList.remove("hidden");

        inputHeading.textContent =
            "Calculate Stacked Discounts";

        inputDescription.textContent =
            "Apply two discounts one after another and calculate the final price and effective total discount.";

        primaryResultLabel.textContent =
            "Final Price";
    }


    hideError();
    resetResults();


    /*
       resetResults sets the default label,
       so restore the percentage-mode label.
    */

    if (mode === "percentage") {
        primaryResultLabel.textContent =
            "Discount Percentage";
    }
}


/* =========================================================
   PRICE AFTER DISCOUNT
   ========================================================= */

function calculatePriceMode(original, qty) {

    const discount = Number(discountPercent.value);

    if (
        discountPercent.value.trim() === "" ||
        !Number.isFinite(discount) ||
        discount < 0 ||
        discount > 100
    ) {

        showError(
            "Please enter a discount between 0% and 100%."
        );

        return;
    }


    const saving =
        original * (discount / 100);

    const finalPrice =
        original - saving;


    displayResults({
        original,
        finalPrice,
        saving,
        discount,
        effective: discount,
        qty
    });


    primaryResultLabel.textContent =
        "Final Price";

    primaryResult.textContent =
        money(finalPrice);

    primaryResultNote.textContent =
        `${percent(discount)} off saves ${money(saving)} per unit.`;


    formulaBox.innerHTML = `
        <strong>Discount Formula</strong>
        <p>
            ${money(original)} ×
            (1 − ${percent(discount)}) =
            ${money(finalPrice)}
        </p>
    `;
}


/* =========================================================
   FIND DISCOUNT %
   ========================================================= */

function calculatePercentageMode(original, qty) {

    const sale = Number(salePrice.value);

    if (
        salePrice.value.trim() === "" ||
        !Number.isFinite(sale) ||
        sale < 0
    ) {

        showError(
            "Please enter a valid sale price."
        );

        return;
    }


    if (sale > original) {

        showError(
            "Sale price cannot be greater than the original price when calculating a discount."
        );

        return;
    }


    const saving =
        original - sale;

    const discount =
        (saving / original) * 100;


    displayResults({
        original,
        finalPrice: sale,
        saving,
        discount,
        effective: discount,
        qty
    });


    primaryResultLabel.textContent =
        "Discount Percentage";

    primaryResult.textContent =
        percent(discount);

    primaryResultNote.textContent =
        `${money(original)} reduced to ${money(sale)} saves ${money(saving)} per unit.`;


    formulaBox.innerHTML = `
        <strong>Discount Formula</strong>
        <p>
            (${money(original)} − ${money(sale)})
            ÷ ${money(original)} × 100 =
            ${percent(discount)}
        </p>
    `;
}


/* =========================================================
   STACKED DISCOUNTS
   ========================================================= */

function calculateStackedMode(original, qty) {

    const first =
        Number(discountPercent.value);

    const second =
        Number(secondDiscount.value);


    if (
        discountPercent.value.trim() === "" ||
        !Number.isFinite(first) ||
        first < 0 ||
        first > 100
    ) {

        showError(
            "Please enter a first discount between 0% and 100%."
        );

        return;
    }


    if (
        secondDiscount.value.trim() === "" ||
        !Number.isFinite(second) ||
        second < 0 ||
        second > 100
    ) {

        showError(
            "Please enter a second discount between 0% and 100%."
        );

        return;
    }


    const afterFirst =
        original * (1 - first / 100);

    const finalPrice =
        afterFirst * (1 - second / 100);

    const saving =
        original - finalPrice;

    const effective =
        (saving / original) * 100;


    displayResults({
        original,
        finalPrice,
        saving,
        discount: first,
        effective,
        qty
    });


    primaryResultLabel.textContent =
        "Final Price";

    primaryResult.textContent =
        money(finalPrice);

    primaryResultNote.textContent =
        `${percent(first)} followed by ${percent(second)} gives an effective discount of ${percent(effective)}.`;


    formulaBox.innerHTML = `
        <strong>Stacked Discount Formula</strong>
        <p>
            ${money(original)}
            → ${percent(first)} off = ${money(afterFirst)}
            → ${percent(second)} off = ${money(finalPrice)}
        </p>
    `;
}


/* =========================================================
   DISPLAY COMMON RESULTS
   ========================================================= */

function displayResults({
    original,
    finalPrice,
    saving,
    discount,
    effective,
    qty
}) {

    resultOriginalPrice.textContent =
        money(original);

    amountSaved.textContent =
        money(saving);

    resultDiscount.textContent =
        percent(discount);

    effectiveDiscount.textContent =
        percent(effective);

    resultQuantity.textContent =
        qty.toLocaleString();

    totalOriginal.textContent =
        money(original * qty);

    totalSavings.textContent =
        money(saving * qty);

    finalTotal.textContent =
        money(finalPrice * qty);


    resultPrimary.classList.remove("loss");
    resultPrimary.classList.add("positive");
}


/* =========================================================
   MAIN CALCULATE
   ========================================================= */

function calculate() {

    hideError();


    const original =
        Number(originalPrice.value);


    if (
        originalPrice.value.trim() === "" ||
        !Number.isFinite(original) ||
        original <= 0
    ) {

        showError(
            "Original price must be greater than zero."
        );

        return;
    }


    const qty = getQuantity();


    if (qty === null) {

        showError(
            "Quantity must be a whole number of at least 1."
        );

        return;
    }


    if (currentMode === "price") {

        calculatePriceMode(
            original,
            qty
        );

    } else if (currentMode === "percentage") {

        calculatePercentageMode(
            original,
            qty
        );

    } else if (currentMode === "stacked") {

        calculateStackedMode(
            original,
            qty
        );
    }
}


/* =========================================================
   LOAD EXAMPLE
   ========================================================= */

function loadExample() {

    hideError();

    currency.value = "QAR";

    updateCurrencyLabels();

    originalPrice.value = "100";
    quantity.value = "5";


    if (currentMode === "price") {

        discountPercent.value = "20";

    }


    if (currentMode === "percentage") {

        salePrice.value = "75";

    }


    if (currentMode === "stacked") {

        discountPercent.value = "20";
        secondDiscount.value = "10";

    }


    calculate();
}


/* =========================================================
   CLEAR
   ========================================================= */

function clearCalculator() {

    hideError();

    currency.value = "QAR";

    originalPrice.value = "";
    discountPercent.value = "";
    salePrice.value = "";
    secondDiscount.value = "";
    quantity.value = "";

    updateCurrencyLabels();

    setMode(currentMode);
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
    originalPrice,
    discountPercent,
    salePrice,
    secondDiscount,
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


currency.addEventListener(
    "change",
    () => {

        updateCurrencyLabels();

        if (originalPrice.value) {
            calculate();
        } else {
            resetResults();
        }

    }
);


/* =========================================================
   INITIALIZE
   ========================================================= */

updateCurrencyLabels();
setMode("price");