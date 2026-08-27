document.addEventListener("DOMContentLoaded", function () {

    // =====================================================
    // INPUTS
    // =====================================================

    const principal = document.getElementById("principal");
    const interestRate = document.getElementById("interestRate");
    const investmentPeriod = document.getElementById("investmentPeriod");
    const periodUnit = document.getElementById("periodUnit");

    const compoundFrequency = document.getElementById("compoundFrequency");

    const contribution = document.getElementById("contribution");
    const contributionFrequency = document.getElementById("contributionFrequency");

    const currency = document.getElementById("currency");
    const decimalPlaces = document.getElementById("decimalPlaces");

    const currencyPrefix = document.getElementById("currencyPrefix");
    const contributionCurrencyPrefix =
        document.getElementById("contributionCurrencyPrefix");


    // =====================================================
    // BUTTONS
    // =====================================================

    const calculateBtn = document.getElementById("calculate");
    const clearBtn = document.getElementById("clear");
    const loadExampleBtn = document.getElementById("loadExample");


    // =====================================================
    // WARNING
    // =====================================================

    const warning = document.getElementById("warning");


    // =====================================================
    // RESULTS
    // =====================================================

    const futureValue = document.getElementById("futureValue");
    const totalContributions = document.getElementById("totalContributions");
    const interestEarned = document.getElementById("interestEarned");
    const growthPercent = document.getElementById("growthPercent");

    const initialBreakdown = document.getElementById("initialBreakdown");
    const contributionBreakdown =
        document.getElementById("contributionBreakdown");

    const interestBreakdown =
        document.getElementById("interestBreakdown");

    const investmentSummary =
        document.getElementById("investmentSummary");


    // =====================================================
    // FORMAT MONEY
    // =====================================================

    function formatMoney(value) {

        const decimals = Number(decimalPlaces.value);

        return `${currency.value} ${Number(value).toLocaleString("en-US", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        })}`;
    }


    // =====================================================
    // WARNING
    // =====================================================

    function showWarning(message) {

        warning.textContent = message;
        warning.hidden = false;
    }


    function hideWarning() {

        warning.textContent = "";
        warning.hidden = true;
    }


    // =====================================================
    // RESET RESULTS
    // =====================================================

    function resetResults() {

        futureValue.textContent = "—";
        totalContributions.textContent = "—";
        interestEarned.textContent = "—";
        growthPercent.textContent = "—";

        initialBreakdown.textContent = "—";
        contributionBreakdown.textContent = "—";
        interestBreakdown.textContent = "—";

        investmentSummary.innerHTML = `
            <h3>Enter your investment details</h3>

            <p>
                DIXANI will estimate your future value,
                total contributions and compound interest.
            </p>
        `;
    }


    // =====================================================
    // CALCULATE
    // =====================================================

    function calculateInvestment() {

        hideWarning();


        const startingAmount = Number(principal.value);
        const rate = Number(interestRate.value);
        const period = Number(investmentPeriod.value);

        const contributionAmount =
            contribution.value.trim() === ""
                ? 0
                : Number(contribution.value);


        // VALIDATION

        if (!Number.isFinite(startingAmount) || startingAmount < 0) {

            showWarning("Please enter a valid initial investment.");
            resetResults();
            return;
        }


        if (!Number.isFinite(rate) || rate < 0) {

            showWarning("Please enter a valid annual interest rate.");
            resetResults();
            return;
        }


        if (!Number.isFinite(period) || period <= 0) {

            showWarning("Please enter an investment period greater than zero.");
            resetResults();
            return;
        }


        if (
            !Number.isFinite(contributionAmount) ||
            contributionAmount < 0
        ) {

            showWarning("Additional contribution cannot be negative.");
            resetResults();
            return;
        }


        // =================================================
        // CONVERT PERIOD TO YEARS
        // =================================================

        let years;

        if (periodUnit.value === "months") {

            years = period / 12;

        } else {

            years = period;
        }


        // =================================================
        // FREQUENCIES
        // =================================================

        const compoundsPerYear =
            Number(compoundFrequency.value);

        const contributionsPerYear =
            Number(contributionFrequency.value);


        /*
        Use daily simulation.

        This makes annual, semi-annual,
        quarterly, monthly and daily compounding
        work reliably together with recurring
        contributions.
        */

        const daysPerYear = 365;

        const totalDays =
            Math.round(years * daysPerYear);


        const daysBetweenCompounding =
            daysPerYear / compoundsPerYear;


        const daysBetweenContributions =
            contributionsPerYear > 0
                ? daysPerYear / contributionsPerYear
                : null;


        const interestPerCompound =
            rate / 100 / compoundsPerYear;


        let balance = startingAmount;

        let totalAdded = 0;

        let nextCompound =
            daysBetweenCompounding;

        let nextContribution =
            daysBetweenContributions;


        // =================================================
        // SIMULATION
        // =================================================

        for (let day = 1; day <= totalDays; day++) {


            // APPLY COMPOUNDING

            if (day + 0.0001 >= nextCompound) {

                balance *=
                    1 + interestPerCompound;

                nextCompound +=
                    daysBetweenCompounding;
            }


            // ADD CONTRIBUTION AT END OF PERIOD

            if (
                contributionsPerYear > 0 &&
                contributionAmount > 0 &&
                day + 0.0001 >= nextContribution
            ) {

                balance +=
                    contributionAmount;

                totalAdded +=
                    contributionAmount;

                nextContribution +=
                    daysBetweenContributions;
            }

        }


        // =================================================
        // RESULTS
        // =================================================

        const investedAmount =
            startingAmount + totalAdded;


        const earned =
            balance - investedAmount;


        const growth =
            investedAmount > 0
                ? (earned / investedAmount) * 100
                : 0;


        futureValue.textContent =
            formatMoney(balance);


        totalContributions.textContent =
            formatMoney(investedAmount);


        interestEarned.textContent =
            formatMoney(Math.max(0, earned));


        growthPercent.textContent =
            `${growth.toFixed(Number(decimalPlaces.value))}%`;


        initialBreakdown.textContent =
            formatMoney(startingAmount);


        contributionBreakdown.textContent =
            formatMoney(totalAdded);


        interestBreakdown.textContent =
            formatMoney(Math.max(0, earned));


        // =================================================
        // SUMMARY
        // =================================================

        let periodLabel;

        if (periodUnit.value === "years") {

            periodLabel =
                `${period} ${period === 1 ? "year" : "years"}`;

        } else {

            periodLabel =
                `${period} ${period === 1 ? "month" : "months"}`;
        }


        investmentSummary.innerHTML = `

            <h3>Estimated investment growth</h3>

            <p>
                Starting with
                <strong>${formatMoney(startingAmount)}</strong>,
                your estimated balance after
                <strong>${periodLabel}</strong>
                is
                <strong>${formatMoney(balance)}</strong>.

                Estimated compound interest earned is
                <strong>${formatMoney(Math.max(0, earned))}</strong>.
            </p>

        `;
    }


    // =====================================================
    // LOAD EXAMPLE
    // =====================================================

    loadExampleBtn.addEventListener("click", function () {

        principal.value = "10000";
        interestRate.value = "5";
        investmentPeriod.value = "10";

        periodUnit.value = "years";

        compoundFrequency.value = "12";

        contribution.value = "500";

        contributionFrequency.value = "12";

        currency.value = "QAR";

        decimalPlaces.value = "2";


        currencyPrefix.textContent = "QAR";

        contributionCurrencyPrefix.textContent =
            "QAR";


        calculateInvestment();
    });


    // =====================================================
    // CLEAR
    // =====================================================

    clearBtn.addEventListener("click", function () {

        principal.value = "";
        interestRate.value = "";
        investmentPeriod.value = "";

        periodUnit.value = "years";

        compoundFrequency.value = "12";

        contribution.value = "";

        contributionFrequency.value = "12";

        currency.value = "QAR";

        decimalPlaces.value = "2";


        currencyPrefix.textContent = "QAR";

        contributionCurrencyPrefix.textContent =
            "QAR";


        hideWarning();

        resetResults();

        principal.focus();
    });


    // =====================================================
    // CURRENCY CHANGE
    // =====================================================

    currency.addEventListener("change", function () {

        currencyPrefix.textContent =
            currency.value;

        contributionCurrencyPrefix.textContent =
            currency.value;
    });


    // =====================================================
    // CALCULATE BUTTON
    // =====================================================

    calculateBtn.addEventListener(
        "click",
        calculateInvestment
    );


    // =====================================================
    // ENTER KEY
    // =====================================================

    [
        principal,
        interestRate,
        investmentPeriod,
        contribution

    ].forEach(function (input) {

        input.addEventListener("keydown", function (event) {

            if (event.key === "Enter") {

                calculateInvestment();
            }

        });

    });


    resetResults();

});