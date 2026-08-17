/* =========================================================
   DIXANI
   Inventory Variance Report Generator
   Version 1.0
   ========================================================= */


document.addEventListener("DOMContentLoaded", function () {


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const inventoryBody =
        document.getElementById("inventoryBody");

    const addItemButton =
        document.getElementById("addItemButton");

    const calculateButton =
        document.getElementById("calculateButton");

    const loadSampleButton =
        document.getElementById("loadSampleButton");

    const clearButton =
        document.getElementById("clearButton");

    const exportCsvButton =
        document.getElementById("exportCsvButton");

    const printButton =
        document.getElementById("printButton");

    const csvFile =
        document.getElementById("csvFile");

    const itemSearch =
        document.getElementById("itemSearch");

    const statusFilter =
        document.getElementById("statusFilter");

    const currencySelect =
        document.getElementById("currency");

    const decimalPlacesSelect =
        document.getElementById("decimalPlaces");


    /* =====================================================
       REPORT DATE
    ===================================================== */

    const reportDate =
        document.getElementById("reportDate");


    const today =
        new Date();


    const localDate =
        new Date(
            today.getTime()
            -
            today.getTimezoneOffset() * 60000
        )
        .toISOString()
        .split("T")[0];


    reportDate.value = localDate;



    /* =====================================================
       STORAGE KEY
    ===================================================== */

    const STORAGE_KEY =
        "dixani_inventory_variance_v1";



    /* =====================================================
       STATE
    ===================================================== */

    let items = [];



    /* =====================================================
       UTILITY FUNCTIONS
    ===================================================== */


    function generateId() {

        return (
            Date.now().toString(36)
            +
            Math.random()
                .toString(36)
                .substring(2, 8)
        );

    }



    function numberValue(value) {

        const number =
            parseFloat(value);

        return Number.isFinite(number)
            ? number
            : 0;

    }



    function getDecimals() {

        return parseInt(
            decimalPlacesSelect.value,
            10
        );

    }



    function formatNumber(value) {

        return new Intl.NumberFormat(
            undefined,
            {
                minimumFractionDigits:
                    getDecimals(),

                maximumFractionDigits:
                    getDecimals()
            }
        ).format(
            numberValue(value)
        );

    }



    function formatCurrency(value) {

        const currency =
            currencySelect.value;

        return new Intl.NumberFormat(
            undefined,
            {
                style: "currency",

                currency: currency,

                minimumFractionDigits:
                    getDecimals(),

                maximumFractionDigits:
                    getDecimals()
            }
        ).format(
            numberValue(value)
        );

    }



    function escapeHtml(value) {

        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }



    /* =====================================================
       ITEM CALCULATION
    ===================================================== */

    function calculateItem(item) {

        const systemQty =
            numberValue(item.systemQty);

        const physicalQty =
            numberValue(item.physicalQty);

        const unitCost =
            numberValue(item.unitCost);


        const variance =
            physicalQty - systemQty;


        let variancePercent =
            0;


        if (systemQty !== 0) {

            variancePercent =
                (variance / systemQty) * 100;

        }


        const varianceValue =
            variance * unitCost;


        let status =
            "matched";


        if (variance < 0) {

            status =
                "shortage";

        }
        else if (variance > 0) {

            status =
                "excess";

        }


        return {

            ...item,

            systemQty,

            physicalQty,

            unitCost,

            variance,

            variancePercent,

            varianceValue,

            status

        };

    }



    /* =====================================================
       CREATE NEW ITEM
    ===================================================== */

    function createItem(
        sku = "",
        description = "",
        systemQty = "",
        physicalQty = "",
        unitCost = ""
    ) {

        return {

            id: generateId(),

            sku,

            description,

            systemQty,

            physicalQty,

            unitCost

        };

    }



    /* =====================================================
       RENDER TABLE
    ===================================================== */

    function renderTable() {

        inventoryBody.innerHTML = "";


        const search =
            itemSearch.value
                .trim()
                .toLowerCase();


        const filter =
            statusFilter.value;


        const calculatedItems =
            items.map(calculateItem);


        const filtered =
            calculatedItems.filter(function (item) {

                const matchesSearch =
                    !search
                    ||
                    item.sku
                        .toLowerCase()
                        .includes(search)
                    ||
                    item.description
                        .toLowerCase()
                        .includes(search);


                const matchesStatus =
                    filter === "all"
                    ||
                    item.status === filter;


                return (
                    matchesSearch
                    &&
                    matchesStatus
                );

            });


        filtered.forEach(function (item, index) {

            const row =
                document.createElement("tr");


            const varianceClass =
                item.variance < 0
                    ? "variance-negative"
                    :
                    item.variance > 0
                        ? "variance-positive"
                        :
                        "variance-zero";


            const statusClass =
                "status-" + item.status;


            const statusText =
                item.status === "shortage"
                    ? "SHORTAGE"
                    :
                    item.status === "excess"
                        ? "EXCESS"
                        :
                        "MATCHED";


            row.dataset.id =
                item.id;


            row.innerHTML = `

                <td class="col-number">
                    ${index + 1}
                </td>


                <td>

                    <input
                        class="table-input input-sku"
                        data-field="sku"
                        value="${escapeHtml(item.sku)}"
                        placeholder="SKU001"
                    >

                </td>


                <td>

                    <input
                        class="table-input input-description"
                        data-field="description"
                        value="${escapeHtml(item.description)}"
                        placeholder="Product description"
                    >

                </td>


                <td>

                    <input
                        class="table-input input-number"
                        data-field="systemQty"
                        type="number"
                        step="any"
                        min="0"
                        value="${item.systemQty}"
                        placeholder="0"
                    >

                </td>


                <td>

                    <input
                        class="table-input input-number"
                        data-field="physicalQty"
                        type="number"
                        step="any"
                        min="0"
                        value="${item.physicalQty}"
                        placeholder="0"
                    >

                </td>


                <td
                    class="calculated-cell ${varianceClass}">
                    ${formatNumber(item.variance)}
                </td>


                <td
                    class="calculated-cell ${varianceClass}">
                    ${formatNumber(item.variancePercent)}%
                </td>


                <td>

                    <input
                        class="table-input input-number"
                        data-field="unitCost"
                        type="number"
                        step="any"
                        min="0"
                        value="${item.unitCost}"
                        placeholder="0.00"
                    >

                </td>


                <td
                    class="calculated-cell ${varianceClass}">
                    ${formatCurrency(item.varianceValue)}
                </td>


                <td>

                    <span
                        class="status-badge ${statusClass}">
                        ${statusText}
                    </span>

                </td>


                <td>

                    <button
                        type="button"
                        class="delete-button"
                        title="Delete item"
                        data-delete="${item.id}">

                        ×

                    </button>

                </td>

            `;


            inventoryBody.appendChild(row);

        });


        const emptyMessage =
            document.getElementById(
                "emptyMessage"
            );


        emptyMessage.style.display =
            filtered.length === 0
                ? "block"
                : "none";


        attachRowEvents();

    }



    /* =====================================================
       ROW EVENTS
    ===================================================== */

    function attachRowEvents() {


        const rows =
            inventoryBody.querySelectorAll("tr");


        rows.forEach(function (row) {


            const id =
                row.dataset.id;


            const inputs =
                row.querySelectorAll(
                    "input[data-field]"
                );


            inputs.forEach(function (input) {

                input.addEventListener(
                    "input",
                    function () {

                        const field =
                            input.dataset.field;


                        const item =
                            items.find(
                                function (i) {
                                    return i.id === id;
                                }
                            );


                        if (!item) {
                            return;
                        }


                        item[field] =
                            input.value;


                        saveData();

                        renderTable();

                        updateSummary();

                    }
                );

            });


            const deleteButton =
                row.querySelector(
                    "[data-delete]"
                );


            deleteButton.addEventListener(
                "click",
                function () {

                    deleteItem(id);

                }
            );

        });

    }



    /* =====================================================
       ADD ITEM
    ===================================================== */

    function addItem() {

        items.push(
            createItem()
        );

        saveData();

        renderTable();

        updateSummary();


        setTimeout(function () {

            const rows =
                inventoryBody.querySelectorAll("tr");


            if (rows.length) {

                const lastRow =
                    rows[rows.length - 1];


                const firstInput =
                    lastRow.querySelector(
                        "input"
                    );


                if (firstInput) {

                    firstInput.focus();

                }

            }

        }, 50);

    }



    /* =====================================================
       DELETE ITEM
    ===================================================== */

    function deleteItem(id) {

        items =
            items.filter(
                function (item) {

                    return item.id !== id;

                }
            );


        saveData();

        renderTable();

        updateSummary();

    }



    /* =====================================================
       SUMMARY
    ===================================================== */

    function updateSummary() {

        const calculated =
            items.map(calculateItem);


        const total =
            calculated.length;


        const matched =
            calculated.filter(
                item =>
                    item.status === "matched"
            ).length;


        const shortage =
            calculated.filter(
                item =>
                    item.status === "shortage"
            ).length;


        const excess =
            calculated.filter(
                item =>
                    item.status === "excess"
            ).length;


        let shortageQty =
            0;


        let excessQty =
            0;


        let shortageValue =
            0;


        let excessValue =
            0;


        calculated.forEach(function (item) {


            if (item.variance < 0) {

                shortageQty +=
                    Math.abs(item.variance);

                shortageValue +=
                    Math.abs(item.varianceValue);

            }


            if (item.variance > 0) {

                excessQty +=
                    item.variance;

                excessValue +=
                    item.varianceValue;

            }

        });


        const netVariance =
            excessValue - shortageValue;


        document.getElementById(
            "totalItems"
        ).textContent =
            formatNumber(total);


        document.getElementById(
            "matchedItems"
        ).textContent =
            formatNumber(matched);


        document.getElementById(
            "shortageItems"
        ).textContent =
            formatNumber(shortage);


        document.getElementById(
            "excessItems"
        ).textContent =
            formatNumber(excess);


        document.getElementById(
            "shortageQty"
        ).textContent =
            "-" + formatNumber(shortageQty);


        document.getElementById(
            "excessQty"
        ).textContent =
            "+" + formatNumber(excessQty);


        document.getElementById(
            "shortageValue"
        ).textContent =
            "-" + formatCurrency(shortageValue);


        document.getElementById(
            "excessValue"
        ).textContent =
            "+" + formatCurrency(excessValue);


        const netElement =
            document.getElementById(
                "netVariance"
            );


        netElement.textContent =
            formatCurrency(netVariance);


        netElement.style.color =
            netVariance < 0
                ? "#fca5a5"
                :
                netVariance > 0
                    ? "#fdba74"
                    :
                    "#86efac";

    }



    /* =====================================================
       SAVE DATA
    ===================================================== */

    function saveData() {

        const data = {

            items,

            companyName:
                document.getElementById(
                    "companyName"
                ).value,

            warehouseName:
                document.getElementById(
                    "warehouseName"
                ).value,

            reportDate:
                document.getElementById(
                    "reportDate"
                ).value,

            preparedBy:
                document.getElementById(
                    "preparedBy"
                ).value,

            currency:
                currencySelect.value,

            decimalPlaces:
                decimalPlacesSelect.value

        };


        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(data)
        );

    }



    /* =====================================================
       LOAD DATA
    ===================================================== */

    function loadData() {

        try {

            const saved =
                localStorage.getItem(
                    STORAGE_KEY
                );


            if (!saved) {

                items = [
                    createItem(
                        "SKU001",
                        "Sample Product A",
                        100,
                        96,
                        1.20
                    )
                ];

                return;

            }


            const data =
                JSON.parse(saved);


            items =
                Array.isArray(data.items)
                    ? data.items
                    : [];


            if (
                data.companyName !== undefined
            ) {

                document.getElementById(
                    "companyName"
                ).value =
                    data.companyName;

            }


            if (
                data.warehouseName !== undefined
            ) {

                document.getElementById(
                    "warehouseName"
                ).value =
                    data.warehouseName;

            }


            if (
                data.reportDate !== undefined
            ) {

                reportDate.value =
                    data.reportDate;

            }


            if (
                data.preparedBy !== undefined
            ) {

                document.getElementById(
                    "preparedBy"
                ).value =
                    data.preparedBy;

            }


            if (
                data.currency !== undefined
            ) {

                currencySelect.value =
                    data.currency;

            }


            if (
                data.decimalPlaces !== undefined
            ) {

                decimalPlacesSelect.value =
                    data.decimalPlaces;

            }

        }
        catch (error) {

            console.error(
                "Unable to load saved data:",
                error
            );

            items = [];

        }

    }



    /* =====================================================
       SAMPLE DATA
    ===================================================== */

    function loadSampleData() {

        items = [

            createItem(
                "SKU001",
                "Coca Cola 330ml",
                100,
                96,
                1.20
            ),

            createItem(
                "SKU002",
                "Mineral Water 500ml",
                50,
                55,
                0.80
            ),

            createItem(
                "SKU003",
                "Orange Juice 1L",
                80,
                80,
                3.50
            ),

            createItem(
                "SKU004",
                "Chocolate Biscuits",
                120,
                113,
                2.25
            ),

            createItem(
                "SKU005",
                "Potato Chips",
                75,
                79,
                1.75
            )

        ];


        saveData();

        renderTable();

        updateSummary();

    }



    /* =====================================================
       CLEAR ALL
    ===================================================== */

    function clearAll() {

        const confirmed =
            confirm(
                "Are you sure you want to clear all inventory data?"
            );


        if (!confirmed) {
            return;
        }


        items = [];


        document.getElementById(
            "companyName"
        ).value = "";


        document.getElementById(
            "warehouseName"
        ).value = "";


        document.getElementById(
            "preparedBy"
        ).value = "";


        localStorage.removeItem(
            STORAGE_KEY
        );


        renderTable();

        updateSummary();

    }



    /* =====================================================
       CSV PARSER
    ===================================================== */

    function parseCSV(text) {

        const rows = [];

        let row = [];

        let value = "";

        let insideQuotes = false;


        for (
            let i = 0;
            i < text.length;
            i++
        ) {

            const character =
                text[i];


            const nextCharacter =
                text[i + 1];


            if (
                character === '"'
                &&
                insideQuotes
                &&
                nextCharacter === '"'
            ) {

                value += '"';

                i++;

                continue;

            }


            if (
                character === '"'
            ) {

                insideQuotes =
                    !insideQuotes;

                continue;

            }


            if (
                character === ","
                &&
                !insideQuotes
            ) {

                row.push(value);

                value = "";

                continue;

            }


            if (
                (
                    character === "\n"
                    ||
                    character === "\r"
                )
                &&
                !insideQuotes
            ) {

                if (
                    character === "\r"
                    &&
                    nextCharacter === "\n"
                ) {

                    i++;

                }


                row.push(value);

                rows.push(row);

                row = [];

                value = "";

                continue;

            }


            value += character;

        }


        if (
            value !== ""
            ||
            row.length > 0
        ) {

            row.push(value);

            rows.push(row);

        }


        return rows;

    }



    /* =====================================================
       IMPORT CSV
    ===================================================== */

    function importCSV(file) {

        const reader =
            new FileReader();


        reader.onload =
            function (event) {


                try {

                    const rows =
                        parseCSV(
                            event.target.result
                        );


                    if (
                        rows.length < 2
                    ) {

                        alert(
                            "The CSV file does not contain enough data."
                        );

                        return;

                    }


                    const headers =
                        rows[0].map(
                            function (header) {

                                return header
                                    .trim()
                                    .toLowerCase();

                            }
                        );


                    function findColumn(
                        names
                    ) {

                        return headers.findIndex(
                            function (header) {

                                return names.includes(
                                    header
                                );

                            }
                        );

                    }


                    const skuIndex =
                        findColumn([
                            "sku",
                            "item code",
                            "itemcode",
                            "item"
                        ]);


                    const descriptionIndex =
                        findColumn([
                            "description",
                            "item description",
                            "product"
                        ]);


                    const systemIndex =
                        findColumn([
                            "system qty",
                            "system quantity",
                            "system",
                            "book qty",
                            "book quantity"
                        ]);


                    const physicalIndex =
                        findColumn([
                            "physical qty",
                            "physical quantity",
                            "physical",
                            "counted qty",
                            "count"
                        ]);


                    const costIndex =
                        findColumn([
                            "unit cost",
                            "cost",
                            "unit price",
                            "price"
                        ]);


                    if (
                        systemIndex === -1
                        ||
                        physicalIndex === -1
                    ) {

                        alert(
                            "CSV must contain System Qty and Physical Qty columns."
                        );

                        return;

                    }


                    const imported = [];


                    for (
                        let i = 1;
                        i < rows.length;
                        i++
                    ) {

                        const current =
                            rows[i];


                        if (
                            current.length === 0
                            ||
                            current.every(
                                cell =>
                                    !cell.trim()
                            )
                        ) {

                            continue;

                        }


                        imported.push(
                            createItem(

                                skuIndex >= 0
                                    ? current[skuIndex]
                                    : "",

                                descriptionIndex >= 0
                                    ? current[descriptionIndex]
                                    : "",

                                current[systemIndex] || 0,

                                current[physicalIndex] || 0,

                                costIndex >= 0
                                    ? current[costIndex]
                                    : 0

                            )
                        );

                    }


                    if (
                        imported.length === 0
                    ) {

                        alert(
                            "No inventory rows were found."
                        );

                        return;

                    }


                    items =
                        items.concat(
                            imported
                        );


                    saveData();

                    renderTable();

                    updateSummary();


                    alert(
                        imported.length
                        +
                        " inventory item(s) imported successfully."
                    );

                }
                catch (error) {

                    console.error(error);

                    alert(
                        "Unable to read this CSV file."
                    );

                }

            };


        reader.readAsText(file);

    }



    /* =====================================================
       CSV ESCAPE
    ===================================================== */

    function csvEscape(value) {

        const text =
            String(value ?? "");


        if (
            text.includes(",")
            ||
            text.includes('"')
            ||
            text.includes("\n")
        ) {

            return (
                '"'
                +
                text.replace(
                    /"/g,
                    '""'
                )
                +
                '"'
            );

        }


        return text;

    }



    /* =====================================================
       EXPORT CSV
    ===================================================== */

    function exportCSV() {

        if (
            items.length === 0
        ) {

            alert(
                "There are no inventory items to export."
            );

            return;

        }


        const calculated =
            items.map(calculateItem);


        const headers = [

            "SKU",

            "Description",

            "System Qty",

            "Physical Qty",

            "Variance",

            "Variance %",

            "Unit Cost",

            "Variance Value",

            "Status"

        ];


        const rows =
            calculated.map(
                function (item) {

                    return [

                        item.sku,

                        item.description,

                        item.systemQty,

                        item.physicalQty,

                        item.variance,

                        item.variancePercent.toFixed(
                            getDecimals()
                        ),

                        item.unitCost,

                        item.varianceValue.toFixed(
                            getDecimals()
                        ),

                        item.status.toUpperCase()

                    ];

                }
            );


        const csv = [

            headers,

            ...rows

        ]
        .map(
            row =>
                row
                    .map(csvEscape)
                    .join(",")
        )
        .join("\r\n");


        const blob =
            new Blob(
                [csv],
                {
                    type:
                        "text/csv;charset=utf-8;"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        const date =
            reportDate.value
            ||
            localDate;


        link.href =
            url;


        link.download =
            "DIXANI_Inventory_Variance_"
            +
            date
            +
            ".csv";


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();


        URL.revokeObjectURL(
            url
        );

    }



    /* =====================================================
       EVENT LISTENERS
    ===================================================== */

    addItemButton.addEventListener(
        "click",
        addItem
    );


    calculateButton.addEventListener(
        "click",
        function () {

            saveData();

            renderTable();

            updateSummary();

        }
    );


    loadSampleButton.addEventListener(
        "click",
        loadSampleData
    );


    clearButton.addEventListener(
        "click",
        clearAll
    );


    exportCsvButton.addEventListener(
        "click",
        exportCSV
    );


    printButton.addEventListener(
        "click",
        function () {

            saveData();

            window.print();

        }
    );


    csvFile.addEventListener(
        "change",
        function () {

            if (
                csvFile.files
                &&
                csvFile.files.length
            ) {

                importCSV(
                    csvFile.files[0]
                );

                csvFile.value = "";

            }

        }
    );


    itemSearch.addEventListener(
        "input",
        renderTable
    );


    statusFilter.addEventListener(
        "change",
        renderTable
    );


    currencySelect.addEventListener(
        "change",
        function () {

            saveData();

            renderTable();

            updateSummary();

        }
    );


    decimalPlacesSelect.addEventListener(
        "change",
        function () {

            saveData();

            renderTable();

            updateSummary();

        }
    );


    [
        "companyName",
        "warehouseName",
        "reportDate",
        "preparedBy"
    ]
    .forEach(
        function (id) {

            const element =
                document.getElementById(
                    id
                );


            element.addEventListener(
                "input",
                saveData
            );

        }
    );



    /* =====================================================
       INITIALIZE
    ===================================================== */

    loadData();

    renderTable();

    updateSummary();


});
