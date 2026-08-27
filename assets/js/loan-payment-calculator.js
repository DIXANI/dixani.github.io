document.addEventListener("DOMContentLoaded", () => {

    const loanAmount = document.getElementById("loanAmount");
    const interestRate = document.getElementById("interestRate");
    const loanTerm = document.getElementById("loanTerm");
    const termUnit = document.getElementById("termUnit");
    const extraPayment = document.getElementById("extraPayment");
    const currency = document.getElementById("currency");
    const decimalPlaces = document.getElementById("decimalPlaces");

    const currencyPrefix = document.getElementById("currencyPrefix");
    const extraCurrencyPrefix = document.getElementById("extraCurrencyPrefix");

    const calculateBtn = document.getElementById("calculate");
    const clearBtn = document.getElementById("clear");
    const loadExampleBtn = document.getElementById("loadExample");

    const warning = document.getElementById("warning");

    const monthlyPayment = document.getElementById("monthlyPayment");
    const totalInterest = document.getElementById("totalInterest");
    const totalPaid = document.getElementById("totalPaid");
    const numberPayments = document.getElementById("numberPayments");

    const standardTerm = document.getElementById("standardTerm");
    const extraTerm = document.getElementById("extraTerm");
    const interestSaved = document.getElementById("interestSaved");

    const loanSummary = document.getElementById("loanSummary");


    /* =====================================================
       HELPERS
    ===================================================== */

    function formatMoney(value) {

        const decimals = Number(decimalPlaces.value);

        return `${currency.value} ${value.toLocaleString("en-US", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        })}`;
    }


    function formatTerm(months) {

        months = Math.round(months);

        if (months <= 0) {
            return "—";
        }

        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;

        if (years === 0) {
            return `${remainingMonths} month${remainingMonths !== 1 ? "s" : ""}`;
        }

        if (remainingMonths === 0) {
            return `${years} year${years !== 1 ? "s" : ""}`;
        }

        return `${years} year${years !== 1 ? "s" : ""} ${remainingMonths} month${remainingMonths !== 1 ? "s" : ""}`;
    }


    function showWarning(message) {

        warning.textContent = message;
        warning.hidden = false;
    }


    function hideWarning() {

        warning.textContent = "";
        warning.hidden = true;
    }


    function resetResults() {

        monthlyPayment.textContent = "—";
        totalInterest.textContent = "—";
        totalPaid.textContent = "—";
        numberPayments.textContent = "—";

        standardTerm.textContent = "—";
        extraTerm.textContent = "—";
        interestSaved.textContent = "—";

        loanSummary.innerHTML = `
            <h3>Enter your loan details</h3>
            <p>
                DIXANI will estimate your monthly payment,
                total interest and total repayment.
            </p>
        `;
    }


    /* =====================================================
       STANDARD LOAN CALCULATION
    ===================================================== */

    function calculateStandardLoan(principal, annualRate, months) {

        const monthlyRate = annualRate / 100 / 12;

        let payment;

        if (monthlyRate === 0) {

            payment = principal / months;

        } else {

            const factor = Math.pow(1 + monthlyRate, months);

            payment =
                principal *
                (monthlyRate * factor) /
                (factor - 1);
        }

        const total = payment * months;
        const interest = Math.max(0, total - principal);

        return {
            payment,
            total,
            interest
        };
    }


    /* =====================================================
       EXTRA PAYMENT SIMULATION
    ===================================================== */

    function calculateWithExtra(
        principal,
        annualRate,
        regularPayment,
        extra
    ) {

        const monthlyRate = annualRate / 100 / 12;

        let balance = principal;
        let months = 0;
        let totalInterestPaid = 0;

        const maximumMonths = 12000;

        while (balance > 0.000001 && months < maximumMonths) {

            let interestForMonth = balance * monthlyRate;

            let paymentForMonth =
                regularPayment + extra;

            if (monthlyRate === 0) {
                interestForMonth = 0;
            }

            const amountDue =
                balance + interestForMonth;

            if (paymentForMonth > amountDue) {
                paymentForMonth = amountDue;
            }

            const principalPaid =
                paymentForMonth - interestForMonth;

            if (principalPaid <= 0) {
                return null;
            }

            totalInterestPaid += interestForMonth;

            balance -= principalPaid;

            if (balance < 0.000001) {
                balance = 0;
            }

            months++;
        }

        if (months >= maximumMonths) {
            return null;
        }

        return {
            months,
            interest: totalInterestPaid
        };
    }


    /* =====================================================
       CALCULATE
    ===================================================== */

    function calculateLoan() {

        hideWarning();

        const principal = Number(loanAmount.value);
        const annualRate = Number(interestRate.value);
        const term = Number(loanTerm.value);

        const extra =
            extraPayment.value.trim() === ""
                ? 0
                : Number(extraPayment.value);


        if (!Number.isFinite(principal) || principal <= 0) {

            showWarning(
                "Please enter a loan amount greater than zero."
            );

            resetResults();
            return;
        }


        if (!Number.isFinite(annualRate) || annualRate < 0) {

            showWarning(
                "Please enter a valid annual interest rate."
            );

            resetResults();
            return;
        }


        if (!Number.isFinite(term) || term <= 0) {

            showWarning(
                "Please enter a loan term greater than zero."
            );

            resetResults();
            return;
        }


        if (!Number.isFinite(extra) || extra < 0) {

            showWarning(
                "Extra monthly payment cannot be negative."
            );

            resetResults();
            return;
        }


        let months;

        if (termUnit.value === "years") {

            months = Math.round(term * 12);

        } else {

            months = Math.round(term);
        }


        if (months < 1) {

            showWarning(
                "The loan term must be at least one month."
            );

            resetResults();
            return;
        }


        const standard =
            calculateStandardLoan(
                principal,
                annualRate,
                months
            );


        monthlyPayment.textContent =
            formatMoney(standard.payment);

        totalInterest.textContent =
            formatMoney(standard.interest);

        totalPaid.textContent =
            formatMoney(standard.total);

        numberPayments.textContent =
            months.toLocaleString("en-US");


        standardTerm.textContent =
            formatTerm(months);


        /* =================================================
           EXTRA PAYMENT
        ================================================= */

        if (extra > 0) {

            const extraResult =
                calculateWithExtra(
                    principal,
                    annualRate,
                    standard.payment,
                    extra
                );


            if (!extraResult) {

                showWarning(
                    "The extra-payment scenario could not be calculated with the entered values."
                );

                extraTerm.textContent = "—";
                interestSaved.textContent = "—";

            } else {

                const saved =
                    Math.max(
                        0,
                        standard.interest -
                        extraResult.interest
                    );


                extraTerm.textContent =
                    formatTerm(extraResult.months);

                interestSaved.textContent =
                    formatMoney(saved);


                const monthsSaved =
                    Math.max(
                        0,
                        months - extraResult.months
                    );


                loanSummary.innerHTML = `
                    <h3>Extra payments may shorten the loan</h3>

                    <p>
                        Your estimated regular monthly payment is
                        <strong>${formatMoney(standard.payment)}</strong>.
                        Adding <strong>${formatMoney(extra)}</strong>
                        per month may shorten the repayment period by
                        approximately <strong>${formatTerm(monthsSaved)}</strong>
                        and reduce estimated interest by
                        <strong>${formatMoney(saved)}</strong>.
                    </p>
                `;
            }

        } else {

            extraTerm.textContent =
                "No extra payment";

            interestSaved.textContent =
                formatMoney(0);


            loanSummary.innerHTML = `
                <h3>Estimated monthly payment</h3>

                <p>
                    A loan of
                    <strong>${formatMoney(principal)}</strong>
                    at <strong>${annualRate}%</strong>
                    for <strong>${formatTerm(months)}</strong>
                    has an estimated monthly payment of
                    <strong>${formatMoney(standard.payment)}</strong>.
                </p>
            `;
        }
    }


    /* =====================================================
       LOAD EXAMPLE
    ===================================================== */

    loadExampleBtn.addEventListener("click", () => {

        loanAmount.value = "100000";
        interestRate.value = "5";
        loanTerm.value = "5";
        termUnit.value = "years";
        extraPayment.value = "500";
        currency.value = "QAR";
        decimalPlaces.value = "2";

        currencyPrefix.textContent = "QAR";
        extraCurrencyPrefix.textContent = "QAR";

        calculateLoan();
    });


    /* =====================================================
       CLEAR
    ===================================================== */

    clearBtn.addEventListener("click", () => {

        loanAmount.value = "";
        interestRate.value = "";
        loanTerm.value = "";
        termUnit.value = "years";
        extraPayment.value = "";

        currency.value = "QAR";
        decimalPlaces.value = "2";

        currencyPrefix.textContent = "QAR";
        extraCurrencyPrefix.textContent = "QAR";

        hideWarning();
        resetResults();

        loanAmount.focus();
    });


    /* =====================================================
       CURRENCY
    ===================================================== */

    currency.addEventListener("change", () => {

        currencyPrefix.textContent =
            currency.value;

        extraCurrencyPrefix.textContent =
            currency.value;
    });


    /* =====================================================
       BUTTON
    ===================================================== */

    calculateBtn.addEventListener(
        "click",
        calculateLoan
    );


    /* =====================================================
       ENTER KEY
    ===================================================== */

    [
        loanAmount,
        interestRate,
        loanTerm,
        extraPayment
    ].forEach(input => {

        input.addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {
                    calculateLoan();
                }

            }
        );

    });


    resetResults();

});