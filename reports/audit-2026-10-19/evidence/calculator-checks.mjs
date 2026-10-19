import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createDom, runCalculatorScript } from "./dom-harness.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..", "..");
const js = (name) => join(root, "assets", "js", name);

const results = [];
const record = (tool, testCase, expected, actual, note = "") => {
  results.push({ tool, testCase, expected, actual, note });
};

function load(script, ids, options, initial = {}) {
  const dom = createDom(ids, options);
  for (const [id, value] of Object.entries(initial)) {
    if (id.endsWith(".checked")) dom.get(id.slice(0, -8)).checked = Boolean(value);
    else dom.get(id).value = String(value);
  }
  runCalculatorScript(script, dom);
  return dom.get;
}

function setValues(get, values) {
  for (const [id, value] of Object.entries(values)) get(id).value = String(value);
}

{
  const ids = ["avgUsage", "leadTime", "safetyStock", "currentStock", "incomingStock", "orderQty", "decimals", "calculateButton", "loadExample", "clearButton", "itemName", "reorderPoint", "availableStock", "leadDemand", "coverageDays", "stockGap", "daysToReorder", "postOrderCoverage", "reorderStatus", "recommendationCard", "recommendationTitle", "recommendationText"];
  const get = load(js("reorder.js"), ids);
  setValues(get, { avgUsage: 10, leadTime: 5, safetyStock: 20, currentStock: 40, incomingStock: 10, orderQty: 100, decimals: 2 });
  get("calculateButton").click();
  record("Reorder Point", "10/day, 5-day lead, 20 safety stock", { reorderPoint: "70.00", available: "50.00", coverageDays: "5.00 days", status: "REORDER NOW" }, { reorderPoint: get("reorderPoint").textContent, available: get("availableStock").textContent, coverageDays: get("coverageDays").textContent, status: get("reorderStatus").textContent });
  setValues(get, { avgUsage: -10, leadTime: 5, safetyStock: 20, currentStock: 100, incomingStock: 0, orderQty: 0 });
  get("calculateButton").click();
  record("Reorder Point", "Negative average demand", "Reject negative usage", { reorderPoint: get("reorderPoint").textContent, status: get("reorderStatus").textContent }, "Current UI accepts the value and reports a negative reorder point.");
}

{
  const ids = ["simple", "advanced", "simpleTab", "advancedTab", "mode", "maxDaily", "maxLead", "avgDaily", "avgLead", "service", "std", "advLead", "advAvg", "result", "coverage", "m1", "m2", "m1label", "m2label", "noteTitle", "noteText", "calculate", "clear", "example"];
  const get = load(js("safety-stock.js"), ids);
  setValues(get, { maxDaily: 25, maxLead: 10, avgDaily: 15, avgLead: 7 });
  get("calculate").click();
  record("Safety Stock", "Simple method sample", "145.00", { result: get("result").textContent, coverage: get("coverage").textContent });
  get("advancedTab").click();
  setValues(get, { service: 1.96, std: 6, advLead: 7, advAvg: 15 });
  get("calculate").click();
  record("Safety Stock", "1.96 x 6 x sqrt(7)", "31.11", { result: get("result").textContent, coverage: get("coverage").textContent });
  setValues(get, { service: 1.96, std: -6, advLead: 7, advAvg: 15 });
  get("calculate").click();
  record("Safety Stock", "Negative demand standard deviation", "Reject negative deviation", { result: get("result").textContent }, "Current UI accepts it and returns negative safety stock.");
}

{
  const ids = ["cogs", "beginning", "ending", "average", "period", "currency", "decimals", "turnover", "avgResult", "daysResult", "cogsResult", "warning", "noteTitle", "noteText", "beTab", "avgTab", "bGroup", "eGroup", "aGroup", "mode", "formula", "calculate", "clear", "example"];
  const get = load(js("inventory-turnover.js"), ids);
  setValues(get, { cogs: 500000, beginning: 100000, ending: 150000, period: 365, currency: "USD", decimals: 2 });
  get("calculate").click();
  record("Inventory Turnover", "COGS 500k, average inventory 125k, 365 days", { turnover: "4.00×", avg: "USD 125,000.00", days: "91.25 days" }, { turnover: get("turnover").textContent, avg: get("avgResult").textContent, days: get("daysResult").textContent });
  setValues(get, { cogs: 500000, beginning: 0, ending: 0 });
  get("calculate").click();
  record("Inventory Turnover", "Zero average inventory", "Reject division by zero", { turnover: get("turnover").textContent, warning: get("warning").textContent }, "Results are cleared; validation is only surfaced after an explicit Calculate click.");
}

{
  const ids = ["cogs", "beginning", "ending", "average", "target", "period", "currency", "dio", "avgResult", "turnover", "daily", "targetInv", "difference", "dioDiff", "diffLabel", "currentLabel", "targetLabel", "currentBar", "targetBar", "warning", "noteTitle", "beTab", "avgTab", "bGroup", "eGroup", "aGroup", "mode", "formula", "calculate", "clear", "example"];
  const get = load(js("dio-calculator.js"), ids);
  setValues(get, { cogs: 500000, beginning: 100000, ending: 150000, target: 75, period: 365, currency: "USD" });
  get("calculate").click();
  record("DIO", "COGS 500k, average inventory 125k, target 75 days", { dio: "91.25 days", turnover: "4.00×", targetInventory: "USD 102,739.73", difference: "USD 22,260.27" }, { dio: get("dio").textContent, turnover: get("turnover").textContent, targetInventory: get("targetInv").textContent, difference: get("difference").textContent });
}

{
  const ids = ["annualDemand", "orderingCost", "holdingCost", "unitCost", "holdingRate", "workingDays", "currentOrderQty", "currency", "decimalPlaces", "directTab", "rateTab", "holdingCostGroup", "unitCostGroup", "holdingRateGroup", "modePill", "formulaBox", "eoqResult", "ordersPerYear", "averageInventory", "timeBetweenOrders", "annualOrderingCost", "annualHoldingCost", "totalRelevantCost", "currentQtyResult", "currentRelevantCost", "eoqRelevantCost", "costDifference", "costDifferenceLabel", "validationMessage", "calculateButton", "clearButton", "loadExample"];
  const get = load(js("eoq-calculator.js"), ids);
  setValues(get, { annualDemand: 10000, orderingCost: 100, holdingCost: 0.5, workingDays: 365, currentOrderQty: 1000, currency: "USD", decimalPlaces: 2 });
  get("calculateButton").click();
  record("EOQ", "Demand 10,000; order cost 100; holding 0.50", { eoq: "2,000.00 units", orders: "5.00", averageInventory: "1,000.00 units", totalCost: "USD 1,000.00/year", currentCost: "USD 1,250.00", difference: "USD 250.00" }, { eoq: get("eoqResult").textContent, orders: get("ordersPerYear").textContent, averageInventory: get("averageInventory").textContent, totalCost: get("totalRelevantCost").textContent, currentCost: get("currentRelevantCost").textContent, difference: get("costDifference").textContent });
  setValues(get, { annualDemand: -1 });
  get("calculateButton").click();
  record("EOQ", "Negative demand", "Reject with validation message", { message: get("validationMessage").textContent, eoq: get("eoqResult").textContent });
}

{
  const ids = ["dimensionUnit", "length", "width", "height", "quantity", "weightUnit", "actualWeight", "divisor", "calculateButton", "sampleButton", "clearButton", "chargeableWeight", "actualWeightResult", "volumetricWeightResult", "cartonVolumeResult", "totalVolumeResult", "quantityResult", "resultSummary"];
  const get = load(js("volumetric-weight-calculator.js"), ids);
  setValues(get, { dimensionUnit: "cm", length: 50, width: 40, height: 30, quantity: 2, weightUnit: "kg", actualWeight: 18, divisor: 5000 });
  get("calculateButton").click();
  record("Volumetric Weight", "50x40x30 cm, 2 cartons, 18 kg, divisor 5000", { chargeable: "24.00 kg", volumetric: "24.00 kg", totalVolume: "0.120 m³" }, { chargeable: get("chargeableWeight").textContent, volumetric: get("volumetricWeightResult").textContent, totalVolume: get("totalVolumeResult").textContent });
  setValues(get, { quantity: 2.9 });
  get("calculateButton").click();
  record("Volumetric Weight", "Fractional carton quantity 2.9", "Reject non-whole quantity", { shownQuantity: get("quantityResult").textContent, chargeable: get("chargeableWeight").textContent }, "parseInt silently truncates 2.9 to 2.");
}

{
  const ids = ["startTime", "endTime", "breakMinutes", "hourlyRate", "currency", "calculateButton", "exampleButton", "clearButton", "calculatorError", "workedTime", "workedTimeNote", "shiftDuration", "breakResult", "decimalHours", "paidMinutes", "estimatedEarnings", "calculationBreakdown"];
  const get = load("categories/business/working-hours-calculator/working-hours.js", ids);
  setValues(get, { startTime: "22:00", endTime: "06:00", breakMinutes: 30, hourlyRate: 20, currency: "USD" });
  get("calculateButton").click();
  record("Working Hours", "22:00 to 06:00, 30-minute break, USD 20/hour", { shift: "8h 00m", worked: "7h 30m", decimal: "7.50", earnings: "USD 150.00", overnight: true }, { shift: get("shiftDuration").textContent, worked: get("workedTime").textContent, decimal: get("decimalHours").textContent, earnings: get("estimatedEarnings").textContent, note: get("workedTimeNote").textContent });
  setValues(get, { startTime: "08:00", endTime: "08:00", breakMinutes: 0 });
  get("calculateButton").click();
  record("Working Hours", "Same start and end", "Explicit ambiguity error", { error: get("calculatorError").textContent });
}

{
  const ids = ["costPrice", "sellingPrice", "targetMargin", "markupPercentInput", "quantity", "discountPercent", "currency", "calculateButton", "clearButton", "exampleButton", "calculatorError", "copyBreakdown", "copyFallback", "copyStatus", "primaryResult", "primaryResultNote", "resultCostPrice", "resultSellingPrice", "afterDiscount", "profitPerUnit", "markupPercent", "resultMarkup", "resultMargin", "achievedMargin", "totalRevenue", "totalCost", "totalProfit", "inputHeading", "inputDescription", "primaryResultLabel", "formulaBox", "sellingPriceGroup", "targetMarginGroup"];
  const get = load("categories/business/profit-margin-calculator/profit-margin.js", ids);
  setValues(get, { costPrice: 75, sellingPrice: 100, quantity: 10, discountPercent: 10, currency: "USD" });
  get("calculateButton").click();
  record("Profit Margin", "Cost 75, price 100, 10% discount", { margin: "16.67%", profitPerUnit: "USD 15.00", afterDiscount: "USD 90.00" }, { margin: get("primaryResult").textContent, profitPerUnit: get("profitPerUnit").textContent, afterDiscount: get("afterDiscount").textContent });
}

{
  const ids = ["costPrice", "sellingPrice", "markupPercentInput", "quantity", "discountPercent", "currency", "calculateButton", "clearButton", "exampleButton", "calculatorError", "copyBreakdown", "copyFallback", "copyStatus", "primaryResult", "primaryResultNote", "resultCostPrice", "resultSellingPrice", "afterDiscount", "profitPerUnit", "resultMarkup", "resultMargin", "totalRevenue", "totalCost", "totalProfit", "inputHeading", "inputDescription", "primaryResultLabel", "formulaBox", "sellingPriceGroup", "markupInputGroup"];
  const get = load("categories/business/markup-calculator/markup-calculator.js", ids, { autoCreate: false });
  setValues(get, { costPrice: 75, markupPercentInput: 50, quantity: 1, discountPercent: 0, currency: "USD" });
  get("calculateButton").click();
  record("Markup", "Cost 75, 50% markup", { sellingPrice: "USD 112.50", markup: "50.00%" }, { sellingPrice: get("primaryResult").textContent, markup: get("resultMarkup").textContent });
}

{
  const ids = ["total", "cl", "cw", "ch", "pl", "pw", "mh", "ph", "unit", "dp", "rotate", "perLayer", "layers", "perPallet", "pallets", "full", "last", "height", "util", "cbm", "orientation", "topView", "sideView", "formation", "layerCount", "stackCount", "heightLabel", "warn", "calc", "sample", "clear"];
  const get = load(js("pallet-calculator.js"), ids);
  get("rotate").checked = true;
  setValues(get, { total: 200, cl: 40, cw: 30, ch: 25, pl: 120, pw: 100, mh: 150, ph: 15, unit: "cm", dp: 2 });
  get("calc").click();
  record("Pallet", "Sample 200 cartons, 120x100x150 cm pallet", { perLayer: "12", layers: "5", perPallet: "60", pallets: "4", full: "3", last: "20", cbm: "1.68 m³" }, { perLayer: get("perLayer").textContent, layers: get("layers").textContent, perPallet: get("perPallet").textContent, pallets: get("pallets").textContent, full: get("full").textContent, last: get("last").textContent, cbm: get("cbm").textContent });
  setValues(get, { total: 200.5 });
  get("calc").click();
  record("Pallet", "Fractional total cartons", "Reject non-whole carton count", { perPallet: get("perPallet").textContent, pallets: get("pallets").textContent, last: get("last").textContent }, "The input is accepted, so the last-pallet quantity can be fractional.");
}

{
  const ids = ["ctype", "unit", "total", "cl", "cw", "ch", "il", "iw", "ih", "rotate", "calc", "sample", "clear", "cols", "rows", "layers", "capacity", "containers", "last", "containerCbm", "cargoCbm", "util", "orientation", "topView", "sideView", "formation", "perLayer", "stack", "usedHeight", "warn"];
  const get = load(js("container-loading-calculator.js"), ids, undefined, { ctype: "20", unit: "cm", "rotate.checked": true });
  get("rotate").checked = true;
  setValues(get, { ctype: "20", unit: "cm", total: 1000, cl: 50, cw: 40, ch: 30 });
  get("calc").click();
  record("Container Loading", "1,000 cartons, 20ft standard, six uniform orientations", { capacity: "392", containers: "3", last: "216", perLayer: "56" }, { capacity: get("capacity").textContent, containers: get("containers").textContent, last: get("last").textContent, perLayer: get("perLayer").textContent, utilisation: get("util").textContent });
  setValues(get, { total: 1000.5 });
  get("calc").click();
  record("Container Loading", "Fractional total cartons", "Reject non-whole carton count", { containers: get("containers").textContent, last: get("last").textContent }, "The input is accepted, so the last-container quantity can be fractional.");
}

{
  const ids = ["inputBody", "searchRows", "rowCount", "message", "currency", "results", "accuracyKpi", "exposureKpi", "shortageKpi", "priorityKpi", "unitsKpi", "analysisSummary", "riskChart", "exposureChart", "managementSignals", "resultsBody", "noResults", "riskFilter", "abcFilter", "analyzeButton", "pasteData", "importPaste", "csvFile", "dropZone", "downloadTemplate", "exportCsv", "printReport", "loadSample", "clearData", "addRow", "resultsHeading", "applyResultsHeading", "dataHeading"];
  const get = load(js("inventory-accuracy-analyzer.js"), ids);
  get("pasteData").value = "SKU,System Qty,Physical Qty,Unit Cost\nBAD,not-a-number,not-a-number,not-a-number";
  get("importPaste").click();
  get("analyzeButton").click();
  record("Inventory Accuracy Analyzer", "Invalid numeric cells imported from CSV", "Reject invalid quantities/cost", { message: get("message").textContent, accuracy: get("accuracyKpi").textContent, exposure: get("exposureKpi").textContent, units: get("unitsKpi").textContent }, "Invalid values are coerced to zero and reported as a perfect match.");
  get("pasteData").value = "SKU,Location,System Qty,Physical Qty,Unit Cost\nDUP,A-01,10,9,5\nDUP,A-01,20,20,5";
  get("importPaste").click();
  get("analyzeButton").click();
  record("Inventory Accuracy Analyzer", "Duplicate SKU-location rows", "Reject or flag duplicate", { rowCount: get("rowCount").textContent, accuracy: get("accuracyKpi").textContent, units: get("unitsKpi").textContent }, "Both duplicate records are accepted and analyzed independently.");
}

console.log(JSON.stringify(results, null, 2));
