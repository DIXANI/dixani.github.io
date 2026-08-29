/* =========================================================
   DIXANI — UNIT CONVERTER
   Length | Weight | Volume | Area
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
       ===================================================== */

    const conversionType = document.getElementById("conversionType");
    const inputValue = document.getElementById("inputValue");
    const fromUnit = document.getElementById("fromUnit");
    const toUnit = document.getElementById("toUnit");
    const swapUnits = document.getElementById("swapUnits");
    const decimalPlaces = document.getElementById("decimalPlaces");

    const convertButton = document.getElementById("convertButton");
    const clearButton = document.getElementById("clearButton");

    const resultValue = document.getElementById("resultValue");
    const resultUnits = document.getElementById("resultUnits");
    const conversionSummary = document.getElementById("conversionSummary");


    /* =====================================================
       UNIT DATA

       factor = value required to convert the unit
       into the category's base unit.

       Length base  = metre
       Weight base  = kilogram
       Volume base  = cubic metre
       Area base    = square metre
       ===================================================== */

    const unitData = {

        length: {
            mm: {
                name: "Millimetre",
                symbol: "mm",
                factor: 0.001
            },

            cm: {
                name: "Centimetre",
                symbol: "cm",
                factor: 0.01
            },

            m: {
                name: "Metre",
                symbol: "m",
                factor: 1
            },

            in: {
                name: "Inch",
                symbol: "in",
                factor: 0.0254
            },

            ft: {
                name: "Foot",
                symbol: "ft",
                factor: 0.3048
            }
        },


        weight: {
            g: {
                name: "Gram",
                symbol: "g",
                factor: 0.001
            },

            kg: {
                name: "Kilogram",
                symbol: "kg",
                factor: 1
            },

            lb: {
                name: "Pound",
                symbol: "lb",
                factor: 0.45359237
            },

            oz: {
                name: "Ounce",
                symbol: "oz",
                factor: 0.028349523125
            }
        },


        volume: {
            ml: {
                name: "Millilitre",
                symbol: "ml",
                factor: 0.000001
            },

            l: {
                name: "Litre",
                symbol: "L",
                factor: 0.001
            },

            m3: {
                name: "Cubic Metre",
                symbol: "m³",
                factor: 1
            },

            ft3: {
                name: "Cubic Foot",
                symbol: "ft³",
                factor: 0.028316846592
            }
        },


        area: {
            cm2: {
                name: "Square Centimetre",
                symbol: "cm²",
                factor: 0.0001
            },

            m2: {
                name: "Square Metre",
                symbol: "m²",
                factor: 1
            },

            ft2: {
                name: "Square Foot",
                symbol: "ft²",
                factor: 0.09290304
            }
        }
    };


    /* =====================================================
       DEFAULT UNIT PAIRS
       ===================================================== */

    const defaultUnits = {
        length: {
            from: "m",
            to: "ft"
        },

        weight: {
            from: "kg",
            to: "lb"
        },

        volume: {
            from: "l",
            to: "m3"
        },

        area: {
            from: "m2",
            to: "ft2"
        }
    };


    /* =====================================================
       POPULATE UNIT DROPDOWNS
       ===================================================== */

    function populateUnits() {

        const category = conversionType.value;
        const units = unitData[category];

        if (!units) {
            return;
        }

        fromUnit.innerHTML = "";
        toUnit.innerHTML = "";

        Object.entries(units).forEach(([key, unit]) => {

            const fromOption = document.createElement("option");
            fromOption.value = key;
            fromOption.textContent =
                `${unit.name} (${unit.symbol})`;

            fromUnit.appendChild(fromOption);


            const toOption = document.createElement("option");
            toOption.value = key;
            toOption.textContent =
                `${unit.name} (${unit.symbol})`;

            toUnit.appendChild(toOption);

        });


        const defaults = defaultUnits[category];

        fromUnit.value = defaults.from;
        toUnit.value = defaults.to;

        resetResult();
    }


    /* =====================================================
       CONVERT
       ===================================================== */

    function convertMeasurement() {

        const category = conversionType.value;

        const rawValue = inputValue.value.trim();

        if (rawValue === "") {
            showMessage(
                "Enter a value to convert."
            );
            return;
        }


        const value = Number(rawValue);

        if (!Number.isFinite(value)) {
            showMessage(
                "Please enter a valid number."
            );
            return;
        }


        const fromKey = fromUnit.value;
        const toKey = toUnit.value;

        const from = unitData[category][fromKey];
        const to = unitData[category][toKey];


        /*
           Convert source value into the category base unit,
           then convert the base unit into the target unit.
        */

        const baseValue =
            value * from.factor;

        const convertedValue =
            baseValue / to.factor;


        const decimals =
            Number(decimalPlaces.value);


        const formattedResult =
            formatNumber(
                convertedValue,
                decimals
            );


        resultValue.textContent =
            formattedResult;

        resultUnits.textContent =
            `${from.symbol} → ${to.symbol}`;


        const inputFormatted =
            formatNumber(
                value,
                decimals
            );


        conversionSummary.textContent =
            `${inputFormatted} ${from.symbol} = ` +
            `${formattedResult} ${to.symbol}`;
    }


    /* =====================================================
       NUMBER FORMATTING
       ===================================================== */

    function formatNumber(value, decimals) {

        /*
           toLocaleString keeps large results readable:
           12500 becomes 12,500.00
        */

        return value.toLocaleString(
            "en-US",
            {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            }
        );
    }


    /* =====================================================
       SWAP UNITS
       ===================================================== */

    function swapSelectedUnits() {

        const oldFrom = fromUnit.value;

        fromUnit.value = toUnit.value;
        toUnit.value = oldFrom;


        /*
           If a value has already been entered,
           immediately show the reversed conversion.
        */

        if (inputValue.value.trim() !== "") {
            convertMeasurement();
        } else {
            resetResult();
        }
    }


    /* =====================================================
       CLEAR
       ===================================================== */

    function clearConverter() {

        inputValue.value = "";

        decimalPlaces.value = "2";

        const category =
            conversionType.value;

        const defaults =
            defaultUnits[category];

        fromUnit.value =
            defaults.from;

        toUnit.value =
            defaults.to;

        resetResult();

        inputValue.focus();
    }


    /* =====================================================
       RESULT STATES
       ===================================================== */

    function resetResult() {

        const decimals =
            Number(decimalPlaces.value || 2);

        resultValue.textContent =
            (0).toFixed(decimals);

        resultUnits.textContent =
            "Select units to begin";

        conversionSummary.textContent =
            "Enter a value and select your units.";
    }


    function showMessage(message) {

        resultValue.textContent = "—";

        resultUnits.textContent =
            "Waiting for input";

        conversionSummary.textContent =
            message;
    }


    /* =====================================================
       EVENTS
       ===================================================== */

    conversionType.addEventListener(
        "change",
        populateUnits
    );


    convertButton.addEventListener(
        "click",
        convertMeasurement
    );


    clearButton.addEventListener(
        "click",
        clearConverter
    );


    swapUnits.addEventListener(
        "click",
        swapSelectedUnits
    );


    /*
       Update conversion when decimal places change,
       but only when a value exists.
    */

    decimalPlaces.addEventListener(
        "change",
        () => {

            if (inputValue.value.trim() !== "") {
                convertMeasurement();
            } else {
                resetResult();
            }

        }
    );


    /*
       Changing either unit recalculates an existing value.
    */

    fromUnit.addEventListener(
        "change",
        () => {

            if (inputValue.value.trim() !== "") {
                convertMeasurement();
            }

        }
    );


    toUnit.addEventListener(
        "change",
        () => {

            if (inputValue.value.trim() !== "") {
                convertMeasurement();
            }

        }
    );


    /*
       Press Enter inside the value field
       to perform the conversion.
    */

    inputValue.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Enter") {

                event.preventDefault();

                convertMeasurement();
            }

        }
    );


    /* =====================================================
       INITIALIZE
       ===================================================== */

    populateUnits();

});