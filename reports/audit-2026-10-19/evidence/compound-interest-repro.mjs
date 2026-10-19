import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createDom, runCalculatorScript } from "./dom-harness.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..", "..");
const script = join(root, "assets", "js", "compound-interest-calculator.js");

const ids = [
  "principal", "interestRate", "investmentPeriod", "periodUnit",
  "compoundFrequency", "contribution", "contributionFrequency", "currency",
  "decimalPlaces", "currencyPrefix", "contributionCurrencyPrefix",
  "calculate", "clear", "loadExample", "warning", "futureValue",
  "totalContributions", "interestEarned", "growthPercent", "initialBreakdown",
  "contributionBreakdown", "interestBreakdown", "investmentSummary",
];

function runCase({ principal, rate, period, periodUnit, contribution = 0, contributionFrequency = 0 }) {
  const dom = createDom(ids);
  runCalculatorScript(script, dom);
  const get = dom.get;
  get("principal").value = String(principal);
  get("interestRate").value = String(rate);
  get("investmentPeriod").value = String(period);
  get("periodUnit").value = periodUnit;
  get("compoundFrequency").value = "12";
  get("contribution").value = String(contribution);
  get("contributionFrequency").value = String(contributionFrequency);
  get("currency").value = "USD";
  get("decimalPlaces").value = "2";
  get("calculate").click();
  return {
    futureValue: get("futureValue").textContent,
    totalContributions: get("totalContributions").textContent,
    interestEarned: get("interestEarned").textContent,
    warning: get("warning").textContent,
  };
}

function money(value) {
  return `USD ${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const cases = [
  {
    name: "Monthly compounding, one month, no contributions",
    input: { principal: 10000, rate: 5, period: 1, periodUnit: "months" },
    expectedFutureValue: money(10000 * (1 + 0.05 / 12)),
  },
  {
    name: "Monthly compounding, one year, no contributions",
    input: { principal: 10000, rate: 5, period: 1, periodUnit: "years" },
    expectedFutureValue: money(10000 * (1 + 0.05 / 12) ** 12),
  },
  {
    name: "Monthly compounding, three months, no contributions",
    input: { principal: 10000, rate: 5, period: 3, periodUnit: "months" },
    expectedFutureValue: money(10000 * (1 + 0.05 / 12) ** 3),
  },
  {
    name: "Monthly contributions, one year, zero starting balance",
    input: {
      principal: 0, rate: 5, period: 1, periodUnit: "years",
      contribution: 100, contributionFrequency: 12,
    },
    expectedTotalContributions: money(1200),
  },
];

for (const testCase of cases) {
  const actual = runCase(testCase.input);
  console.log(JSON.stringify({
    name: testCase.name,
    input: testCase.input,
    expectedFutureValue: testCase.expectedFutureValue ?? null,
    expectedTotalContributions: testCase.expectedTotalContributions ?? null,
    actual,
  }, null, 2));
}
