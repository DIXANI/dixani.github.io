document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const principal = document.getElementById("principal");
    const interestRate = document.getElementById("interestRate");
    const timePeriod = document.getElementById("timePeriod");
    const periodUnit = document.getElementById("periodUnit");
    const currency = document.getElementById("currency");
    const decimalPlaces = document.getElementById("decimalPlaces");

    const currencyPrefix = document.getElementById("currencyPrefix");

    const calculateBtn = document.getElementById("calculate");
    const clearBtn = document.getElementById("clear");
    const loadExampleBtn = document.getElementById("loadExample");

    const warning = document.getElementById("warning");

    /* Results */

    const simpleInterest = document.getElementById("simpleInterest");
    const totalAmount = document.getElementById("totalAmount");
    const principalResult = document.getElementById("principalResult");
    const growthPercent = document.getElementById("growthPercent");

    /* Breakdown */

    const breakdownPrincipal =
        document.getElementById("breakdownPrincipal");

    const breakdownInterest =
        document.getElementById("breakdownInterest");

    const breakdownTotal =
        document.getElementById("breakdownTotal");

    const resultSummary =
        document.getElementById("resultSummary");


    /* =====================================================
       FORMAT MONEY
    ===================================================== */

    function formatMoney(value) {

        const decimals = Number(decimalPlaces.value);

        return `${currency.value} ${Number(value).toLocaleString(
            "en-US",
            {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            }
        )}`;
    }


    /* =====================================================
       WARNING
    ===================================================== */

    function showWarning(message) {

        warning.textContent = message;
        warning.hidden = false;
    }


    function hideWarning() {

        warning.textContent = "";
        warning.hidden = true;
    }


    /* =====================================================
       RESET RESULTS
    ===================================================== */

    function resetResults() {

        simpleInterest.textContent = "—";
        totalAmount.textContent = "—";
        principalResult.textContent = "—";
        growthPercent.textContent = "—";

        breakdownPrincipal.textContent = "—";
        breakdownInterest.textContent = "—";
        breakdownTotal.textContent = "—";

        resultSummary.innerHTML = `
            <h3>Enter your calculation details</h3>

            <p>
                DIXANI will calculate the simple interest
                and total amount.
            </p>
        `;
    }


    /* =====================================================
       CALCULATE
    ===================================================== */

    function calculateInterest() {

        hideWarning();

        const principalAmount = Number(principal.value);
        const rate = Number(interestRate.value);
        const period = Number(timePeriod.value);


        /* VALIDATION */

        if (
            !Number.isFinite(principalAmount) ||
            principalAmount <= 0
        ) {

            showWarning(
                "Please enter a principal amount greater than zero."
            );

            resetResults();
            return;
        }


        if (
            !Number.isFinite(rate) ||
            rate < 0
        ) {

            showWarning(
                "Please enter a valid annual interest rate."
            );

            resetResults();
            return;
        }


        if (
            !Number.isFinite(period) ||
            period <= 0
        ) {

            showWarning(
                "Please enter a time period greater than zero."
            );

            resetResults();
            return;
        }


        /* =================================================
           CONVERT TIME TO YEARS
        ================================================= */

        let years;

        if (periodUnit.value === "months") {

            years = period / 12;

        } else {

            years = period;
        }


        /* =================================================
           SIMPLE INTEREST FORMULA

           I = P × r × t
        ================================================= */

        const rateDecimal = rate / 100;

        const interest =
            principalAmount *
            rateDecimal *
            years;


        const total =
            principalAmount + interest;


        /*
        Growth relative to original principal.

        For simple interest this is equivalent to:

        annual rate × time
        */

        const growth =
            principalAmount > 0
                ? (interest / principalAmount) * 100
                : 0;


        /* =================================================
           DISPLAY RESULTS
        ================================================= */

        simpleInterest.textContent =
            formatMoney(interest);


        totalAmount.textContent =
            formatMoney(total);


        principalResult.textContent =
            formatMoney(principalAmount);


        growthPercent.textContent =
            `${growth.toFixed(
                Number(decimalPlaces.value)
            )}%`;


        /* BREAKDOWN */

        breakdownPrincipal.textContent =
            formatMoney(principalAmount);


        breakdownInterest.textContent =
            formatMoney(interest);


        breakdownTotal.textContent =
            formatMoney(total);


        /* =================================================
           SUMMARY
        ================================================= */

        let periodLabel;

        if (periodUnit.value === "years") {

            periodLabel =
                `${period} ${
                    period === 1
                        ? "year"
                        : "years"
                }`;

        } else {

            periodLabel =
                `${period} ${
                    period === 1
                        ? "month"
                        : "months"
                }`;
        }


        resultSummary.innerHTML = `

            <h3>Simple interest calculated</h3>

            <p>
                A principal of
                <strong>${formatMoney(principalAmount)}</strong>
                at an annual simple interest rate of
                <strong>${rate}%</strong>
                for
                <strong>${periodLabel}</strong>
                produces
                <strong>${formatMoney(interest)}</strong>
                in simple interest.

                The estimated total amount is
                <strong>${formatMoney(total)}</strong>.
            </p>

        `;
    }


    /* =====================================================
       LOAD EXAMPLE
    ===================================================== */

    loadExampleBtn.addEventListener(
        "click",
        function () {

            principal.value = "10000";
            interestRate.value = "5";
            timePeriod.value = "3";

            periodUnit.value = "years";

            currency.value = "QAR";
            decimalPlaces.value = "2";

            currencyPrefix.textContent = "QAR";

            calculateInterest();
        }
    );


    /* =====================================================
       CLEAR
    ===================================================== */

    clearBtn.addEventListener(
        "click",
        function () {

            principal.value = "";
            interestRate.value = "";
            timePeriod.value = "";

            periodUnit.value = "years";

            currency.value = "QAR";
            decimalPlaces.value = "2";

            currencyPrefix.textContent = "QAR";

            hideWarning();
            resetResults();

            principal.focus();
        }
    );


    /* =====================================================
       CURRENCY CHANGE
    ===================================================== */

    currency.addEventListener(
        "change",
        function () {

            currencyPrefix.textContent =
                currency.value;
        }
    );


    /* =====================================================
       CALCULATE BUTTON
    ===================================================== */

    calculateBtn.addEventListener(
        "click",
        calculateInterest
    );


    /* =====================================================
       ENTER KEY
    ===================================================== */

    [
        principal,
        interestRate,
        timePeriod
    ].forEach(function (input) {

        input.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Enter") {
                    calculateInterest();
                }

            }
        );

    });


    resetResults();

});