document.addEventListener("DOMContentLoaded", () => {

  const dimensionUnit = document.getElementById("dimensionUnit");
  const lengthInput = document.getElementById("length");
  const widthInput = document.getElementById("width");
  const heightInput = document.getElementById("height");
  const quantityInput = document.getElementById("quantity");

  const weightUnit = document.getElementById("weightUnit");
  const actualWeightInput = document.getElementById("actualWeight");
  const divisorSelect = document.getElementById("divisor");

  const calculateButton = document.getElementById("calculateButton");
  const sampleButton = document.getElementById("sampleButton");
  const clearButton = document.getElementById("clearButton");

  const chargeableWeight = document.getElementById("chargeableWeight");
  const actualWeightResult = document.getElementById("actualWeightResult");
  const volumetricWeightResult = document.getElementById("volumetricWeightResult");
  const cartonVolumeResult = document.getElementById("cartonVolumeResult");
  const totalVolumeResult = document.getElementById("totalVolumeResult");
  const quantityResult = document.getElementById("quantityResult");
  const resultSummary = document.getElementById("resultSummary");


  /* -------------------------------------------------------
     NUMBER FORMATTER
  ------------------------------------------------------- */

  function formatNumber(value, decimals = 2) {
    return Number(value).toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }


  /* -------------------------------------------------------
     CALCULATE
  ------------------------------------------------------- */

  function calculateVolumetricWeight() {

    const length = parseFloat(lengthInput.value);
    const width = parseFloat(widthInput.value);
    const height = parseFloat(heightInput.value);
    const quantity = parseInt(quantityInput.value, 10);
    const actualWeightEntered = parseFloat(actualWeightInput.value);
    const divisor = parseFloat(divisorSelect.value);

    if (
      !Number.isFinite(length) ||
      !Number.isFinite(width) ||
      !Number.isFinite(height) ||
      !Number.isFinite(quantity) ||
      !Number.isFinite(actualWeightEntered) ||
      !Number.isFinite(divisor) ||
      length <= 0 ||
      width <= 0 ||
      height <= 0 ||
      quantity <= 0 ||
      actualWeightEntered < 0 ||
      divisor <= 0
    ) {
      resultSummary.textContent =
        "Please enter valid shipment dimensions, carton quantity and actual weight.";
      return;
    }


    /* -----------------------------------------------------
       CONVERT DIMENSIONS TO CENTIMETRES
    ----------------------------------------------------- */

    let lengthCm = length;
    let widthCm = width;
    let heightCm = height;

    if (dimensionUnit.value === "in") {
      lengthCm = length * 2.54;
      widthCm = width * 2.54;
      heightCm = height * 2.54;
    }


    /* -----------------------------------------------------
       CARTON VOLUME
    ----------------------------------------------------- */

    const cartonVolumeCm3 =
      lengthCm * widthCm * heightCm;

    const cartonVolumeM3 =
      cartonVolumeCm3 / 1000000;

    const totalVolumeM3 =
      cartonVolumeM3 * quantity;


    /* -----------------------------------------------------
       ACTUAL WEIGHT → KG
    ----------------------------------------------------- */

    let totalActualWeightKg = actualWeightEntered;

    if (weightUnit.value === "lb") {
      totalActualWeightKg =
        actualWeightEntered * 0.45359237;
    }


    /* -----------------------------------------------------
       VOLUMETRIC WEIGHT

       Formula:
       Length × Width × Height × Quantity ÷ Divisor

       Dimensions are normalized to cm first.
    ----------------------------------------------------- */

    const totalVolumetricWeightKg =
      (cartonVolumeCm3 * quantity) / divisor;


    /* -----------------------------------------------------
       CHARGEABLE WEIGHT
    ----------------------------------------------------- */

    const chargeableWeightKg =
      Math.max(
        totalActualWeightKg,
        totalVolumetricWeightKg
      );


    /* -----------------------------------------------------
       DISPLAY RESULTS
    ----------------------------------------------------- */

    chargeableWeight.textContent =
      `${formatNumber(chargeableWeightKg)} kg`;

    actualWeightResult.textContent =
      `${formatNumber(totalActualWeightKg)} kg`;

    volumetricWeightResult.textContent =
      `${formatNumber(totalVolumetricWeightKg)} kg`;

    cartonVolumeResult.textContent =
      `${formatNumber(cartonVolumeM3, 3)} m³`;

    totalVolumeResult.textContent =
      `${formatNumber(totalVolumeM3, 3)} m³`;

    quantityResult.textContent =
      quantity.toLocaleString("en-US");


    /* -----------------------------------------------------
       RESULT EXPLANATION
    ----------------------------------------------------- */

    if (totalVolumetricWeightKg > totalActualWeightKg) {

      resultSummary.textContent =
        `Volumetric weight is higher than the actual weight, so the estimated chargeable weight is ${formatNumber(chargeableWeightKg)} kg.`;

    } else if (totalActualWeightKg > totalVolumetricWeightKg) {

      resultSummary.textContent =
        `Actual weight is higher than the volumetric weight, so the estimated chargeable weight is ${formatNumber(chargeableWeightKg)} kg.`;

    } else {

      resultSummary.textContent =
        `Actual and volumetric weight are equal. The estimated chargeable weight is ${formatNumber(chargeableWeightKg)} kg.`;

    }

  }

function loadSample() {

  dimensionUnit.value = "cm";

  lengthInput.value = "50";
  widthInput.value = "40";
  heightInput.value = "30";

  quantityInput.value = "2";

  weightUnit.value = "kg";
  actualWeightInput.value = "18";

  divisorSelect.value = "5000";

  calculateVolumetricWeight();

}
  /* -------------------------------------------------------
     CLEAR
  ------------------------------------------------------- */

  function clearCalculator() {

    dimensionUnit.value = "cm";

    lengthInput.value = "";
    widthInput.value = "";
    heightInput.value = "";

    quantityInput.value = "1";

    weightUnit.value = "kg";
    actualWeightInput.value = "";

    divisorSelect.value = "5000";

    chargeableWeight.textContent = "0.00 kg";
    actualWeightResult.textContent = "0.00 kg";
    volumetricWeightResult.textContent = "0.00 kg";
    cartonVolumeResult.textContent = "0.000 m³";
    totalVolumeResult.textContent = "0.000 m³";
    quantityResult.textContent = "1";

    resultSummary.textContent =
      "Enter your shipment details to calculate volumetric and chargeable weight.";

    lengthInput.focus();
  }


  /* -------------------------------------------------------
     EVENTS
  ------------------------------------------------------- */

  calculateButton.addEventListener(
    "click",
    calculateVolumetricWeight
  );

  sampleButton.addEventListener(
  "click",
  loadSample
);

  clearButton.addEventListener(
    "click",
    clearCalculator
  );


  [
    lengthInput,
    widthInput,
    heightInput,
    quantityInput,
    actualWeightInput
  ].forEach(input => {

    input.addEventListener("keydown", event => {

      if (event.key === "Enter") {
        calculateVolumetricWeight();
      }

    });

  });

});