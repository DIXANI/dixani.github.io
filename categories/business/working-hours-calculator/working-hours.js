const startTime = document.getElementById("startTime");
const endTime = document.getElementById("endTime");
const breakMinutes = document.getElementById("breakMinutes");
const hourlyRate = document.getElementById("hourlyRate");
const currency = document.getElementById("currency");

const calculateButton = document.getElementById("calculateButton");
const exampleButton = document.getElementById("exampleButton");
const clearButton = document.getElementById("clearButton");

const calculatorError = document.getElementById("calculatorError");

const workedTime = document.getElementById("workedTime");
const workedTimeNote = document.getElementById("workedTimeNote");

const shiftDuration = document.getElementById("shiftDuration");
const breakResult = document.getElementById("breakResult");
const decimalHours = document.getElementById("decimalHours");
const paidMinutes = document.getElementById("paidMinutes");
const estimatedEarnings = document.getElementById("estimatedEarnings");

const calculationBreakdown = document.getElementById("calculationBreakdown");

const resultPrimary = document.querySelector(".result-primary");


/* =========================================================
   HELPERS
   ========================================================= */

function timeToMinutes(timeValue) {

    if (!timeValue) {
        return null;
    }

    const parts = timeValue.split(":");

    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);

    if (
        !Number.isFinite(hours) ||
        !Number.isFinite(minutes)
    ) {
        return null;
    }

    return (hours * 60) + minutes;
}


function formatDuration(totalMinutes) {

    totalMinutes = Math.max(
        0,
        Math.round(totalMinutes)
    );

    const hours =
        Math.floor(totalMinutes / 60);

    const minutes =
        totalMinutes % 60;

    return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}


function formatMoney(value) {

    return `${currency.value} ${Number(value).toLocaleString(
        undefined,
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    )}`;
}


/* =========================================================
   ERROR
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
   RESET RESULTS
   ========================================================= */

function resetResults() {

    workedTime.textContent = "0h 00m";

    workedTimeNote.textContent =
        "Enter your shift times and calculate.";

    shiftDuration.textContent = "0h 00m";

    breakResult.textContent = "0h 00m";

    decimalHours.textContent = "0.00";

    paidMinutes.textContent = "0 min";

    estimatedEarnings.textContent = "—";

    calculationBreakdown.textContent =
        "Shift Duration − Unpaid Break = Worked Time";

    resultPrimary.classList.remove(
        "positive",
        "loss"
    );
}


/* =========================================================
   CALCULATE
   ========================================================= */

function calculate() {

    hideError();

    const start =
        timeToMinutes(startTime.value);

    const end =
        timeToMinutes(endTime.value);


    if (start === null) {

        showError(
            "Please enter a valid start time."
        );

        return;
    }


    if (end === null) {

        showError(
            "Please enter a valid end time."
        );

        return;
    }


    let shiftMinutes;

    let overnight = false;


    /*
       If end time is earlier than start time,
       treat the end as the following day.
    */

    if (end < start) {

        shiftMinutes =
            (24 * 60 - start) + end;

        overnight = true;

    } else {

        shiftMinutes =
            end - start;
    }


    /*
       Same start/end time is ambiguous.
       We treat it as zero hours instead
       of automatically assuming 24 hours.
    */

    if (shiftMinutes === 0) {

        showError(
            "Start time and end time are the same. Please enter a valid shift duration."
        );

        return;
    }


    let breakValue = 0;

    if (breakMinutes.value.trim() !== "") {

        breakValue =
            Number(breakMinutes.value);

        if (
            !Number.isFinite(breakValue) ||
            breakValue < 0
        ) {

            showError(
                "Please enter a valid unpaid break in minutes."
            );

            return;
        }
    }


    if (breakValue >= shiftMinutes) {

        showError(
            "Unpaid break must be shorter than the total shift duration."
        );

        return;
    }


    const workedMinutes =
        shiftMinutes - breakValue;


    const workedDecimal =
        workedMinutes / 60;


    /* =====================================================
       HOURLY RATE
       ===================================================== */

    let rate = null;

    if (hourlyRate.value.trim() !== "") {

        rate =
            Number(hourlyRate.value);

        if (
            !Number.isFinite(rate) ||
            rate < 0
        ) {

            showError(
                "Please enter a valid hourly rate."
            );

            return;
        }
    }


    /* =====================================================
       DISPLAY RESULTS
       ===================================================== */

    shiftDuration.textContent =
        formatDuration(shiftMinutes);

    breakResult.textContent =
        formatDuration(breakValue);

    workedTime.textContent =
        formatDuration(workedMinutes);

    decimalHours.textContent =
        workedDecimal.toFixed(2);

    paidMinutes.textContent =
        `${Math.round(workedMinutes)} min`;


    if (rate !== null) {

        const earnings =
            workedDecimal * rate;

        estimatedEarnings.textContent =
            formatMoney(earnings);

    } else {

        estimatedEarnings.textContent =
            "Not calculated";
    }


    if (overnight) {

        workedTimeNote.textContent =
            "Overnight shift detected — end time treated as the following day.";

    } else {

        workedTimeNote.textContent =
            "Working time after deducting the unpaid break.";
    }


    calculationBreakdown.textContent =
        `${formatDuration(shiftMinutes)} − ${formatDuration(breakValue)} = ${formatDuration(workedMinutes)}`;


    resultPrimary.classList.remove("loss");
    resultPrimary.classList.add("positive");
}


/* =========================================================
   LOAD EXAMPLE
   ========================================================= */

function loadExample() {

    hideError();

    startTime.value = "08:00";

    endTime.value = "17:30";

    breakMinutes.value = "60";

    currency.value = "QAR";

    hourlyRate.value = "25";

    calculate();
}


/* =========================================================
   CLEAR
   ========================================================= */

function clearCalculator() {

    hideError();

    startTime.value = "";

    endTime.value = "";

    breakMinutes.value = "";

    hourlyRate.value = "";

    currency.value = "QAR";

    resetResults();
}


/* =========================================================
   EVENTS
   ========================================================= */

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
    startTime,
    endTime,
    breakMinutes,
    hourlyRate
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

        /*
           If results have already been calculated,
           recalculate so the earnings currency updates.
        */

        if (
            startTime.value &&
            endTime.value
        ) {
            calculate();
        }
    }
);


/* =========================================================
   INITIALIZE
   ========================================================= */

resetResults();