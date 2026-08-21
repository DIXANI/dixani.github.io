const $ = id => document.getElementById(id);

let currentMode = "space";

const spaceTab = $("spaceTab");
const capacityTab = $("capacityTab");
const spaceMode = $("spaceMode");
const capacityMode = $("capacityMode");
const warning = $("warning");

function num(id) {
    return parseFloat($(id).value);
}

function validPositive(value) {
    return Number.isFinite(value) && value > 0;
}

function convertLengthToMeters(value, unit) {
    const factors = {
        mm: 0.001,
        cm: 0.01,
        m: 1,
        in: 0.0254,
        ft: 0.3048
    };

    return value * factors[unit];
}

function convertSqFtToSqM(value) {
    return value * 0.09290304;
}

function sqmToSqft(value) {
    return value * 10.7639104167;
}

function formatNumber(value, decimals = 2) {
    if (!Number.isFinite(value)) return "—";

    return value.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

function formatArea(sqm) {
    return `${formatNumber(sqm, 2)} m² / ${formatNumber(sqmToSqft(sqm), 2)} ft²`;
}

function showWarning(message) {
    warning.textContent = message;
    warning.hidden = false;
}

function hideWarning() {
    warning.hidden = true;
    warning.textContent = "";
}

function resetVisual() {
    $("storageBar").style.width = "0%";
    $("aisleBar").style.width = "0%";
    $("supportBar").style.width = "0%";

    $("storagePercent").textContent = "—";
    $("aislePercent").textContent = "—";
    $("supportPercent").textContent = "—";
}

function updateVisual(storage, aisle, support) {
    const total = storage + aisle + support;

    if (!validPositive(total)) {
        resetVisual();
        return;
    }

    const storagePct = storage / total * 100;
    const aislePct = aisle / total * 100;
    const supportPct = support / total * 100;

    $("storageBar").style.width = `${storagePct}%`;
    $("aisleBar").style.width = `${aislePct}%`;
    $("supportBar").style.width = `${supportPct}%`;

    $("storagePercent").textContent = `${formatNumber(storagePct, 1)}%`;
    $("aislePercent").textContent = `${formatNumber(aislePct, 1)}%`;
    $("supportPercent").textContent = `${formatNumber(supportPct, 1)}%`;
}

function setSpaceLabels() {
    $("resultHeading").textContent = "Warehouse Space Result";
    $("resultDescription").textContent =
        "Estimated warehouse space based on your storage assumptions.";

    $("modePill").textContent = "SPACE REQUIRED";

    $("mainResultLabel").textContent = "Estimated Warehouse Area";
    $("capacityLabel").textContent = "Total Pallet Capacity";

    $("metric1Label").textContent = "Net Pallet Footprint";
    $("metric2Label").textContent = "Aisle / Access Area";
    $("metric3Label").textContent = "Staging / Support Area";
}

function setCapacityLabels() {
    $("resultHeading").textContent = "Warehouse Storage Capacity";
    $("resultDescription").textContent =
        "Estimated pallet capacity based on available warehouse space.";

    $("modePill").textContent = "STORAGE CAPACITY";

    $("mainResultLabel").textContent = "Practical Pallet Capacity";
    $("capacityLabel").textContent = "Theoretical Pallet Capacity";

    $("metric1Label").textContent = "Allocated Storage Floor Area";
    $("metric2Label").textContent = "Non-Storage Area";
    $("metric3Label").textContent = "Target Position Utilization";
}

function switchMode(mode) {
    currentMode = mode;
    hideWarning();

    if (mode === "space") {
        spaceMode.hidden = false;
        capacityMode.hidden = true;

        spaceTab.classList.add("active");
        capacityTab.classList.remove("active");

        setSpaceLabels();
    } else {
        spaceMode.hidden = true;
        capacityMode.hidden = false;

        capacityTab.classList.add("active");
        spaceTab.classList.remove("active");

        setCapacityLabels();
    }

    clearResults();
}

function clearResults() {
    $("mainResult").textContent = "—";
    $("groundPositions").textContent = "—";
    $("palletFootprint").textContent = "—";
    $("totalCapacity").textContent = "—";

    $("metric1").textContent = "—";
    $("metric2").textContent = "—";
    $("metric3").textContent = "—";

    resetVisual();
}

function calculateSpaceRequired() {
    hideWarning();

    const pallets = num("totalPallets");
    const levels = num("storageLevels");
    const palletLength = num("palletLength");
    const palletWidth = num("palletWidth");
    const unit = $("dimensionUnit").value;

    const aislePct = num("aisleAllowance");
    const supportPct = num("supportAllowance");

    if (
        !validPositive(pallets) ||
        !validPositive(levels) ||
        !validPositive(palletLength) ||
        !validPositive(palletWidth)
    ) {
        showWarning(
            "Enter valid positive values for total pallets, storage levels and pallet dimensions."
        );
        clearResults();
        return;
    }

    if (
        !Number.isFinite(aislePct) ||
        aislePct < 0 ||
        aislePct >= 100 ||
        !Number.isFinite(supportPct) ||
        supportPct < 0 ||
        supportPct >= 100
    ) {
        showWarning(
            "Enter aisle and support allowances between 0% and 99%."
        );
        clearResults();
        return;
    }

    const lengthM = convertLengthToMeters(palletLength, unit);
    const widthM = convertLengthToMeters(palletWidth, unit);

    const palletArea = lengthM * widthM;

    /*
      Ground positions must be whole positions.

      Example:
      500 pallets / 4 levels = 125 ground positions.
      501 pallets / 4 levels = 125.25, therefore 126 positions.
    */
    const groundPositions = Math.ceil(pallets / levels);

    const netPalletArea = groundPositions * palletArea;

    /*
      V1 allowance method:

      Aisle allowance and support allowance are percentages
      of the net pallet footprint.

      Example:
      Net pallet footprint = 150 m²
      Aisle = 40% = 60 m²
      Support = 15% = 22.5 m²

      Total = 232.5 m²
    */
    const aisleArea = netPalletArea * (aislePct / 100);
    const supportArea = netPalletArea * (supportPct / 100);

    const totalArea =
        netPalletArea +
        aisleArea +
        supportArea;

    const totalCapacity = groundPositions * levels;

    $("mainResult").textContent = formatArea(totalArea);

    $("groundPositions").textContent =
        formatNumber(groundPositions, 0);

    $("palletFootprint").textContent =
        formatArea(palletArea);

    $("totalCapacity").textContent =
        `${formatNumber(totalCapacity, 0)} pallets`;

    $("metric1").textContent =
        formatArea(netPalletArea);

    $("metric2").textContent =
        formatArea(aisleArea);

    $("metric3").textContent =
        formatArea(supportArea);

    updateVisual(
        netPalletArea,
        aisleArea,
        supportArea
    );
}

function calculateCapacity() {
    hideWarning();

    const areaInput = num("warehouseArea");
    const areaUnit = $("areaUnit").value;

    const levels = num("capacityLevels");

    const palletLength = num("capacityPalletLength");
    const palletWidth = num("capacityPalletWidth");
    const dimensionUnit = $("capacityDimensionUnit").value;

    const storageAllocation = num("storageAllocation");
    const targetUtilization = num("targetUtilization");

    if (
        !validPositive(areaInput) ||
        !validPositive(levels) ||
        !validPositive(palletLength) ||
        !validPositive(palletWidth)
    ) {
        showWarning(
            "Enter valid positive values for warehouse area, storage levels and pallet dimensions."
        );
        clearResults();
        return;
    }

    if (
        !validPositive(storageAllocation) ||
        storageAllocation > 100 ||
        !validPositive(targetUtilization) ||
        targetUtilization > 100
    ) {
        showWarning(
            "Storage allocation and target utilization must be greater than 0% and no more than 100%."
        );
        clearResults();
        return;
    }

    const warehouseSqm =
        areaUnit === "sqft"
            ? convertSqFtToSqM(areaInput)
            : areaInput;

    const lengthM =
        convertLengthToMeters(
            palletLength,
            dimensionUnit
        );

    const widthM =
        convertLengthToMeters(
            palletWidth,
            dimensionUnit
        );

    const palletArea =
        lengthM * widthM;

    const allocatedStorageArea =
        warehouseSqm *
        (storageAllocation / 100);

    const nonStorageArea =
        warehouseSqm -
        allocatedStorageArea;

    /*
      Whole ground positions only.
      Any remaining partial footprint is not counted
      as an additional pallet position.
    */
    const groundPositions =
        Math.floor(
            allocatedStorageArea /
            palletArea
        );

    const theoreticalCapacity =
        groundPositions *
        levels;

    /*
      Practical capacity applies the user's
      target utilization to theoretical positions.

      floor() prevents the calculator from claiming
      a fraction of a pallet position.
    */
    const practicalCapacity =
        Math.floor(
            theoreticalCapacity *
            (targetUtilization / 100)
        );

    $("mainResult").textContent =
        `${formatNumber(practicalCapacity, 0)} pallets`;

    $("groundPositions").textContent =
        formatNumber(groundPositions, 0);

    $("palletFootprint").textContent =
        formatArea(palletArea);

    $("totalCapacity").textContent =
        `${formatNumber(theoreticalCapacity, 0)} pallets`;

    $("metric1").textContent =
        formatArea(allocatedStorageArea);

    $("metric2").textContent =
        formatArea(nonStorageArea);

    $("metric3").textContent =
        `${formatNumber(targetUtilization, 1)}%`;

    /*
      Visual represents total warehouse floor allocation.

      The third section is zero because target utilization
      refers to pallet-position occupancy, not another
      warehouse floor-area category.
    */
    updateVisual(
        allocatedStorageArea,
        nonStorageArea,
        0
    );

    $("storagePercent").textContent =
        `${formatNumber(storageAllocation, 1)}%`;

    $("aislePercent").textContent =
        `${formatNumber(100 - storageAllocation, 1)}%`;

    $("supportPercent").textContent =
        "Position target: " +
        `${formatNumber(targetUtilization, 1)}%`;
}

function loadSample() {
    hideWarning();

    if (currentMode === "space") {

        $("totalPallets").value = 500;
        $("storageLevels").value = 4;

        $("palletLength").value = 120;
        $("palletWidth").value = 100;
        $("dimensionUnit").value = "cm";

        $("aisleAllowance").value = 40;
        $("supportAllowance").value = 15;

        calculateSpaceRequired();

    } else {

        $("warehouseArea").value = 2000;
        $("areaUnit").value = "sqm";

        $("capacityLevels").value = 4;

        $("capacityPalletLength").value = 120;
        $("capacityPalletWidth").value = 100;
        $("capacityDimensionUnit").value = "cm";

        $("storageAllocation").value = 60;
        $("targetUtilization").value = 85;

        calculateCapacity();
    }
}

function clearAll() {
    hideWarning();

    if (currentMode === "space") {

        [
            "totalPallets",
            "storageLevels",
            "palletLength",
            "palletWidth",
            "aisleAllowance",
            "supportAllowance"
        ].forEach(id => {
            $(id).value = "";
        });

        $("dimensionUnit").value = "cm";

    } else {

        [
            "warehouseArea",
            "capacityLevels",
            "capacityPalletLength",
            "capacityPalletWidth",
            "storageAllocation",
            "targetUtilization"
        ].forEach(id => {
            $(id).value = "";
        });

        $("areaUnit").value = "sqm";
        $("capacityDimensionUnit").value = "cm";
    }

    clearResults();
}

spaceTab.addEventListener("click", () => {
    switchMode("space");
});

capacityTab.addEventListener("click", () => {
    switchMode("capacity");
});

$("calculate").addEventListener("click", () => {

    if (currentMode === "space") {
        calculateSpaceRequired();
    } else {
        calculateCapacity();
    }

});

$("sample").addEventListener("click", loadSample);
$("clear").addEventListener("click", clearAll);

setSpaceLabels();
clearResults();