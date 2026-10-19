# DIXANI Calculator and Tool Audit — 2026-10-19

## Scope and Method

Twenty-three calculators were inspected in source and exercised through a DOM harness and/or headless Chrome. The important distinction in this report is:

- **Source behavior** — directly visible in the implementation.
- **Executed evidence** — reproduced in a browser or formula harness.
- **Unverified hypothesis** — plausible but not confirmed in this environment.

Independent examples were calculated from standard definitions, not by calling the same calculator function. Where industry conventions differ, the convention used by DIXANI is stated.

Severity:

- **Critical** — a normal workflow can produce a materially false financial or inventory result.
- **High** — incorrect edge-case result, misleading operational output, or major mobile/accessibility failure.
- **Medium** — limited-scope incorrect behavior, stale state, or a workflow that needs extra caution.
- **Low** — cosmetic, recovery, or low-impact usability issue.

## Summary

| Tool | Formula result | Edge-case state | Verdict |
|---|---|---|---|
| Reorder Point | Correct | Negative demand accepted | **High** |
| Safety Stock | Correct under documented assumptions | Negative deviation accepted; fixed-lead-time assumption not explicit | **High** |
| Inventory Turnover | Correct | Zero average inventory rejected | Pass |
| DIO | Correct | Negative target rejected | Pass |
| EOQ | Correct | Invalid inputs rejected | Pass, with model limitations |
| Inventory Accuracy Analyzer | Correct arithmetic on clean data | Invalid numbers and duplicates distort results | **Critical** |
| Inventory Variance Report | Correct | Invalid numbers and zero denominator rejected | Pass |
| Cycle Count Planner | Scheduling samples correct | Malformed backup exposes parser error | **Low/Medium** |
| CBM | Correct | Fractional quantity rejected | Pass; **High mobile overflow** |
| Pallet | Correct sample | Fractional total cartons accepted | **Medium** |
| Container Loading | Correct sample | Fractional total cartons accepted | **Medium** |
| Warehouse Space | Correct samples | Inputs validated | Pass |
| Volumetric Weight | Correct sample | Fractional quantity truncated; stale results | **High** |
| Unit Converter | Correct sampled conversions | Invalid input handling exercised | Pass |
| Profit Margin | Correct | Negative cost rejected | Pass |
| Markup | Correct | Uses markup, not margin | Pass |
| Working Hours | Correct valid shifts | Stale result remains after error | **High** |
| Break-Even | Correct | Stale result remains after error | **Medium** |
| Compound Interest | Correct whole years; wrong partial periods | Partial monthly periods undercount | **High** |
| Discount | Correct including stacked discounts | Over-100% discount rejected | Pass |
| VAT | Correct add/remove | Negative amount rejected | Pass |
| Loan Payment | Correct amortizing and zero-interest cases | Negative principal rejected | Pass |
| Simple Interest | Correct | Zero principal handled | Pass |

---

## Inventory Tools

### 1. Reorder Point Calculator

**Route:** `/inventory/reorder-point/`  
**Source:** `assets/js/reorder.js:2`  
**Formula used:**

`Reorder Point = Average Daily Demand × Lead Time + Safety Stock`

`Available Stock = Current Stock + Incoming Stock`

The planned order quantity is correctly excluded from the reorder point and used only for post-order coverage.

**Independent checks:**

| Input | Expected | Actual | Result |
|---|---|---|---|
| 10/day, 5-day lead, 20 safety, current 40, incoming 10 | Reorder point 70; available 50; reorder now | 70.00; 50.00; `REORDER NOW` | Pass |
| Average demand `-10`, lead 5, safety 20, current 100 | Reject negative demand | Reorder point `-30.00`; status `STOCK OK` | **Fail** |

**Defect:** Negative demand is coerced/parsed and accepted. A negative threshold makes almost any stock appear adequate. The HTML `min="0"` attribute is not a validation boundary because users can still enter a negative value and the calculation does not check it.

**Recommended fix:** Require `avgUsage >= 0`, `leadTime >= 0`, `safetyStock >= 0`, `currentStock >= 0`, `incomingStock >= 0`, and `orderQty >= 0`; reject non-finite values. Clear or mark results invalid when rejection occurs.

**Regression test:** `negative average demand is rejected and no stale reorder status is shown`.

### 2. Safety Stock Calculator

**Route:** `/inventory/safety-stock/`  
**Source:** `assets/js/safety-stock.js:4`, `:18-45`

**Simple method:** `max(0, Max Daily Usage × Max Lead Time − Avg Daily Usage × Avg Lead Time)`  
**Advanced method:** `Z × Demand Standard Deviation × √Lead Time`

The advanced formula is the fixed-lead-time demand-variability model. It is valid only when lead time is treated as fixed. DIXANI does not request lead-time standard deviation or state that limitation next to the formula. If lead time is variable, the variance should include the lead-time term, for example `√(L × σ_d² + d² × σ_L²)` for independent demand and lead-time variability.

**Independent checks:**

| Input | Expected | Actual | Result |
|---|---|---|---|
| Simple: max 25 × 10; average 15 × 7 | 145 | 145.00; 9.67 days coverage | Pass |
| Advanced: Z 1.96, σd 6, lead 7 | 31.11 | 31.11; 2.07 days | Pass |
| Advanced: Z 1.96, σd `-6`, lead 7 | Reject negative σ | `-31.11`; `-2.07 days` | **Fail** |

**Defect:** Negative standard deviation is accepted. Standard deviation cannot be negative, and the resulting negative safety stock is operationally meaningless. All four simple-method fields also lack a non-negative validation guard.

**Recommended fix:** Validate non-negative finite inputs, make the fixed-lead-time assumption explicit, and add a separate lead-time-variability mode or state that the tool does not model it.

**Regression test:** `negative standard deviation, negative lead time and negative demand are rejected`.

### 3. Inventory Turnover Calculator

**Route:** `/inventory/inventory-turnover/`  
**Source:** `assets/js/inventory-turnover.js:2-4`

`Average Inventory = (Beginning Inventory + Ending Inventory) / 2`  
`Inventory Turnover = COGS / Average Inventory`  
`Inventory Days = Period Days / Inventory Turnover`

**Independent check:** COGS 500,000; beginning 100,000; ending 150,000; 365 days → 4.00×, average 125,000, 91.25 days. Pass.

Zero average inventory is rejected. Negative COGS and negative inventory are rejected. The page describes industry variation rather than presenting one universal benchmark. No confirmed defect.

### 4. Days Inventory Outstanding (DIO)

**Route:** `/inventory/dio-calculator/`  
**Source:** `assets/js/dio-calculator.js:2`

`DIO = Average Inventory / COGS × Period Days`  
`Target Inventory = COGS / Period Days × Target DIO`

**Independent check:** COGS 500,000; average inventory 125,000; 365 days; target 75 → DIO 91.25 days; target inventory 102,739.73; difference 22,260.27. Pass.

COGS ≤ 0 and negative target DIO are rejected. The interpretation of higher/lower DIO is directionally correct. No confirmed defect.

### 5. Economic Order Quantity (EOQ)

**Route:** `/inventory/eoq-calculator/`  
**Source:** `assets/js/eoq-calculator.js:95`

`EOQ = √(2 × Annual Demand × Ordering Cost / Annual Holding Cost per Unit)`

`Orders per Year = Annual Demand / EOQ`  
`Average Cycle Inventory = EOQ / 2`  
`Total Relevant Cost = Annual Ordering Cost + Annual Holding Cost`

**Independent check:** demand 10,000; ordering cost 50; holding cost 0.25/unit/year → EOQ 2,000 units; 5 orders; relevant cost USD 1,000/year. Current-order comparison at 2,500 units → relevant cost USD 4,062.50. Pass.

The model correctly rejects zero/negative demand, ordering cost, holding cost, working days, and current quantity. It does not claim to handle quantity discounts, supplier minimums, pack sizes, or storage constraints. Those limitations should remain explicit; they are not calculation defects.

### 6. Inventory Accuracy Analyzer

**Route:** `/inventory/inventory-accuracy-analyzer/`  
**Source:** `assets/js/inventory-accuracy-analyzer.js:26-48`, `:67-80`

**Core formulas:**

`Variance = Physical Qty − System Qty`  
`Variance Value = Variance × Unit Cost`  
`Absolute Exposure = |Variance Value|`  
`Annual Value = Annual Usage × Unit Cost`  
`Exact-Match Accuracy = Items with zero variance / Items analyzed`

The KPI is correctly named **Exact-match accuracy** and the page explains that quantity and value tolerance methods differ. Risk score weights are exposure 30, velocity 20, unit value 20, age 15, variance history 10, criticality 5; percentile normalization is used.

#### Defect A — Invalid numeric cells become zero (Critical)

Reproduction, pasted as CSV:

```csv
SKU,System Qty,Physical Qty,Unit Cost
BAD,not-a-number,not-a-number,not-a-number
```

Observed: “1 inventory items imported successfully”, `100%` exact-match accuracy, `US$0.00` exposure, `0` variance units.

Expected: reject the row or report a field-level import error; never report a perfect match from invalid data.

Cause: `num()` returns `0` for every non-finite value at `assets/js/inventory-accuracy-analyzer.js:28`, and `importText()` stores that result at `:47`.

#### Defect B — Duplicate SKU-location rows accepted (High)

Reproduction:

```csv
SKU,Location,System Qty,Physical Qty,Unit Cost
DUP,A-01,10,9,5
DUP,A-01,20,20,5
```

Observed: two records, `2 of 2 items`, `50%` accuracy. The duplicate identity is not detected.

Expected: reject duplicates, aggregate them with an explicit rule, or flag them for review. Analyze should not treat duplicate observations as independent items.

#### Defect C — Non-numeric import contract is too permissive (High)

- **Blank required fields:** `BLANK,A-01,,,10` imports successfully and reports `100%` because both quantities become zero.
- **Negative values:** `NEG,A-01,-5,-10,5` imports and produces a five-unit variance and `US$25.00` exposure without a validation warning.
- **Unclosed quoted field:** a malformed record beginning `"BROKEN,Unclosed...` is silently folded into one cell and imported as a row with zero quantities.
- **Future count date:** `2099-01-01` is accepted. It is treated as age zero, reducing risk versus a missing date, which is treated as 365 days old.

Expected: reject unclosed quotes, blank required quantities, negative physical quantities (unless an explicit returns mode exists), and future count dates. Display field/row errors without mutating the dataset.

#### Additional checks

- All valid zero annual usage produces ABC class C for every item. This is defensible but should be explained as “no annual consumption value.”
- Exact-match, quantity, and value accuracy are separated in the page content. No naming defect found.
- CSV export and template download exist; export values are quoted. Full Excel/clipboard interoperability was not verified.

**Regression tests:** invalid numeric field; duplicate SKU-location; blank required field; negative quantity; unclosed quote; future count date; zero annual value; CSV import atomicity; export header/row counts.

### 7. Inventory Variance Report Generator

**Route:** `/inventory/variance-report/`  
**Source:** `inventory/variance-report/index.html`, `assets/js/inventory.js`

The report compares system and physical quantities, calculates quantity and value variance, classifies shortage/excess, and suppresses percentages when the denominator is zero.

Executed checks confirmed rejection of invalid quantities and unit costs and prevention of division-by-zero percentages. No confirmed defect in the exercised paths. CSV field-mapping permutations, print pagination, and PDF layout were not exhaustively tested.

### 8. Cycle Count Planner

**Route:** `/inventory/cycle-count-planner/`  
**Source:** `assets/js/cycle-count-planner.js:355`, `:714-757`, `:880-900`

**Schedule behavior verified:**

- Initial counts with no history are scheduled immediately.
- Excluded dates are respected.
- Daily capacity carry-forward works.
- Overdue work is delayed to the next available working day.
- Completion history is not double-counted after regeneration.
- Invalid completion dates and duplicate SKU-location imports are rejected.
- Unclosed CSV quotes are rejected.
- CSV exports guard against spreadsheet formula injection.

**Defect — malformed backup/local storage exposes parser text (Low/Medium):**

Uploading a file containing `{not valid json` displays:

`Expected property name or '}' in JSON at position 1 (line 1 column 2)`

Expected: a friendly recovery message such as “This backup is not valid JSON. Your current workspace was not changed.”

The same root cause exists in the local restore path at `:888`; `JSON.parse` is outside the friendly `restore()` validation and is only caught by the generic message handler.

**Regression test:** malformed JSON file, valid JSON with wrong schema, duplicate completion records, future completion dates, and unchanged workspace after each failure.

**Remaining untested:** multi-location duplicate combinations across re-imports, browser storage quota failure, and real-device daylight-saving transitions.

---

## Warehouse, Logistics and Converters

### 9. CBM Calculator

**Route:** `/logistics/cbm-calculator/`  
**Source:** `assets/js/cbm-calculator.js:56`, `assets/css/cbm-calculator.css:1`

`Carton CBM = Length × Width × Height` (converted to metres)  
`Line CBM = Carton CBM × Quantity`  
`Total Weight = Gross Weight per Carton × Quantity` (when supplied)

**Independent check:** 60 × 40 × 35 cm, quantity 20, 12 kg each → 1.6800 m³ and 240 kg. Fractional carton quantity is correctly rejected.

**Defect — mobile page overflow (High):** at a 390 px viewport, the document and body measured 610 px wide. The table wrapper was 320 px wide with a 538 px scroll width and `overflow-x: visible`. The mobile breakpoint explicitly sets `.table-wrap{overflow:visible}`. Evidence: `evidence/cbm-mobile.png`, `evidence/cbm-table.png`.

**Recommended fix:** keep horizontal scrolling inside a bounded wrapper, set `min-width:0`, and transform or stack the table without letting its intrinsic width expand the page. Verify at 320, 360, 390 and 430 px.

### 10. Pallet Calculator

**Route:** `/logistics/pallet-calculator/`  
**Source:** `assets/js/pallet-calculator.js:4-7`

The algorithm calculates a **single rectangular grid** in either normal or 90° orientation, chooses the orientation with more cartons per layer, floors layers to fit usable height, and excludes overhang. It does not claim mixed-orientation or bin-packing optimality; the page states this limitation and the weight-limit limitation.

**Independent check:** 200 cartons, 40 × 30 × 25 cm, 120 × 100 × 150 cm pallet, 15 cm pallet height → 9 per layer, 5 layers, 45 per pallet, 5 pallets, last 20, 1.68 m³, 90% footprint utilization. Pass.

**Defect — fractional total cartons accepted (Medium):** input `200.5` produces a final pallet quantity of `21` after display rounding. A carton count must be a non-negative integer.

**Recommended fix:** validate integer total cartons and integer quantities for physical units; reject rather than round silently.

**Regression test:** fractional total; zero total; carton taller than usable height; carton footprint larger than pallet.

### 11. Container Loading Calculator

**Route:** `/logistics/container-loading-calculator/`  
**Source:** `assets/js/container-loading-calculator.js:5-10`

The algorithm tests the six axis-aligned carton orientations and chooses the single orientation with the highest `floor(L/l) × floor(W/w) × floor(H/h)` capacity. It uses internal container dimensions and does not model door openings, payload, axle limits, dunnage, stacking strength, or mixed orientations. Those limits are documented on the page.

**Independent check:** 1,000 cartons of 50 × 40 × 30 cm in a 20 ft container → capacity 392; 3 containers; last 216; 70.85% volume utilization. Pass.

**Defect — fractional total cartons accepted (Medium):** `1000.5` produces a final container quantity of `216.5`.

**Recommended fix:** require an integer total carton count.

### 12. Warehouse Space and Storage Capacity

**Route:** `/logistics/warehouse-space-calculator/`  
**Source:** `assets/js/warehouse-space-calculator.js:161-255`, `:267-410`

**Space-required mode:** `Ground Positions = ceil(Pallets / Levels)`; `Net Pallet Area = Ground Positions × Pallet Footprint`; aisle and support allowances are percentages of net pallet area.

**Capacity mode:** `Allocated Storage Area = Warehouse Area × Storage Allocation`; `Ground Positions = floor(Allocated Area / Pallet Footprint)`; `Theoretical Capacity = Ground Positions × Levels`; `Practical Capacity = floor(Theoretical Capacity × Target Utilization)`.

**Independent checks:** 500 pallets, 4 levels, 1.2 × 1.0 m pallet, 40% aisle and 15% support → 232.50 m². Capacity sample → 3,400 practical / 4,000 theoretical pallets. Pass.

The tool does not treat the whole warehouse floor as storage area; it explicitly separates storage allocation and practical utilization. Structural, fire, safety, and handling constraints are described as outside the estimate.

### 13. Volumetric Weight Calculator

**Route:** `/categories/converters/volumetric-weight-calculator/`  
**Source:** `assets/js/volumetric-weight-calculator.js:44-48`, `:52-67`

`Volumetric Weight = Length × Width × Height × Quantity / Divisor` after conversion to centimetres. `Chargeable Weight = max(Actual Weight, Volumetric Weight)`.

**Independent checks:** 50 × 40 × 30 cm, quantity 2, 18 kg actual, divisor 5000 → 24 kg volumetric, 24 kg chargeable. Inches/pounds conversion also produced the expected equivalent.

**Defect A — quantity truncation (High):** `2.9` is parsed with `parseInt`, displayed as `2`, and computed as two cartons. It should be rejected as a non-integer carton count or explicitly rounded with a visible rule. Silent truncation understates shipment volume and chargeable weight.

**Defect B — stale results after invalid input (Medium/High):** entering `-1` quantity or weight shows a validation message but leaves prior valid results (`24.00 kg`, `12.00 kg`, etc.) visible. A user can read stale values as if they applied to the invalid shipment.

**Recommended fix:** use `Number` plus integer validation; clear all result regions before returning on error; keep the divisor configurable and avoid presenting any divisor as universal. The page currently labels divisors as common options and warns users to confirm carrier rules, which is appropriate.

### 14. Unit Converter

**Route:** `/categories/converters/unit-converter/`  
**Source:** `assets/js/unit-converter.js`

Supported categories: length, weight, volume and area. No temperature conversion was found.

**Executed checks:** `1 m = 3.28 ft`; `1 kg = 2.20 lb`; `1,000 L = 1 m³`; `1 m² = 10.76 ft²`; reverse and same-unit conversions were correct. Invalid text did not produce a numeric conversion. No confirmed defect in the tested categories.

---

## Business Operations

### 15. Profit Margin Calculator

**Route:** `/categories/business/profit-margin-calculator/`  
**Source:** `categories/business/profit-margin-calculator/profit-margin.js`

`Margin = (Selling Price − Cost) / Selling Price`  
`Markup = (Selling Price − Cost) / Cost`

The margin and markup outputs are separately labeled and the target-price calculation uses margin, not markup. Sample calculations passed. Negative cost was rejected. No confirmed defect.

### 16. Markup Calculator

**Route:** `/categories/business/markup-calculator/`  
**Source:** `categories/business/markup-calculator/markup-calculator.js`

Cost 75 with a 50% markup produced selling price `USD 112.50` and equivalent margin `33.33%`. The tool correctly distinguishes markup from margin. No confirmed defect.

### 17. Working Hours Calculator

**Route:** `/categories/business/working-hours-calculator/`  
**Source:** `categories/business/working-hours-calculator/working-hours.js:137-250`

The calculator supports same-day and overnight shifts, decimal hours, unpaid breaks, and optional earnings. A same start/end time is explicitly rejected rather than assumed to be 24 hours.

**Executed checks:** 08:00–17:00 with a 60-minute break → 8h 00m and `USD 160.00` at `USD 20/hour`; overnight shift calculation correct; same-time validation correct.

**Defect — stale result after validation error (High/Medium):** after the valid result above, changing the break to `600` shows “Unpaid break must be shorter than the total shift duration” but leaves `8h 00m` and `USD 160.00` visible.

**Recommended fix:** clear/disable the result region at the start of every calculation attempt, or mark it explicitly invalid/outdated. Do not leave old earnings visible next to an error.

**Regression test:** invalid break, invalid rate, invalid time and overnight shift must all clear prior results before showing the error.

---

## Finance

### 18. Break-Even Calculator

**Route:** `/categories/finance/break-even-calculator/`  
**Source:** `categories/finance/break-even-calculator/break-even.js:109-170`

`Break-Even Units = Fixed Costs / (Selling Price − Variable Cost per Unit)`  
`Contribution Margin = (Price − Variable Cost) / Price`

**Independent check:** fixed 10,000; price 100; variable 60; expected 400 units → 250 units, revenue 25,000, contribution 40, margin 40%, estimated profit 6,000. Pass.

**Defect — stale results after errors (Medium):** invalid fixed costs or price ≤ variable cost shows an error while the prior `250` break-even result remains visible.

**Recommended fix:** shared `clearResults()` on every validation failure.

### 19. Compound Interest Calculator

**Route:** `/categories/finance/compound-interest-calculator/`  
**Source:** `assets/js/compound-interest-calculator.js:124`, `:197-280`

The implementation simulates calendar days with `totalDays = round(years × 365)` and compounds when the loop day reaches `365 / compoundsPerYear`. This works for whole annual cycles but omits a final partial compounding interval.

**Defect — partial-period undercount (High):**

| Input | Standard expected | DIXANI actual | Difference |
|---|---|---|---|
| 10,000; 5%; 1 month; monthly compounding | USD 10,041.67 | USD 10,000.00 | USD 41.67 |
| 10,000; 5%; 3 months; monthly compounding | USD 10,125.52 | USD 10,083.51 | USD 42.01 |
| 10,000; 5%; 1 year; monthly compounding | Correct whole-year result | Correct | None observed |

Cause: one month rounds to 30 days, but the first monthly compounding point is day 30.4167; the loop never reaches it. For three months, only two of the three monthly intervals are applied.

**Recommended fix:** use exact financial mathematics. For a fractional number of compounding periods, calculate `P × (1 + r/n)^(n×t)` or explicitly apply a final pro-rata period according to the stated convention. Handle contributions with an annuity formula or a period-end contribution schedule. Document whether contributions occur at period start or end. Add tests for 1, 3, 7, 11 and 12 months, and for annual, quarterly, monthly and daily compounding.

### 20. Discount Calculator

**Route:** `/categories/finance/discount-calculator/`  
**Source:** `categories/finance/discount-calculator/discount.js`

Executed checks: 100 with 20% discount and quantity 2 → 80 each / 160 total. Stacked 20% then 10% → 72 and effective 28% saving. A discount over 100% is rejected. No confirmed defect.

### 21. VAT Calculator

**Route:** `/categories/finance/vat-calculator/`  
**Source:** `categories/finance/vat-calculator/vat.js`

Add-VAT and remove-VAT calculations produced the expected results. Negative amount is rejected. No confirmed defect.

### 22. Loan Payment Calculator

**Route:** `/categories/finance/loan-payment-calculator/`  
**Source:** `assets/js/loan-payment-calculator.js`

**Independent check:** 100,000 principal, 5% annual rate, 5 years, monthly payment → `USD 1,887.12`; total interest `USD 13,227.40`. Zero-interest loan and negative-principal validation behaved correctly. No confirmed defect.

### 23. Simple Interest Calculator

**Route:** `/categories/finance/simple-interest-calculator/`  
**Source:** `assets/js/simple-interest-calculator.js`

**Independent check:** 10,000 principal, 5% annual rate, 3 years → USD 1,500 interest. Zero principal handled correctly. No confirmed defect.

---

## Cross-Tool Defects and Improvements

### Stale-result state

Confirmed in Working Hours, Volumetric Weight, and Break-Even. The same pattern should be audited across all calculators. Recommended shared behavior:

1. Clear result values and copy at the start of every calculation.
2. Hide or mark result cards invalid on validation failure.
3. Keep the user's input values intact.
4. Announce the error through a live region if it is not already announced.

### Input contract

Several tools rely on HTML `min`/`step` attributes without programmatic validation. Those attributes affect browser UI hints but do not guarantee a valid value. Recommend a shared validator supporting required, finite, non-negative, positive, integer, and maximum constraints.

### Print and export

Chrome generated a 188,976-byte PDF for the Accuracy Analyzer and a 626,383-byte PDF for Reorder Point. The files are valid and non-empty, but visual page breaks, headers, table clipping, and color reproduction were not manually reviewed.

## Evidence

- `evidence/calculator-checks-results.json`
- `evidence/remaining-checks-results.json`
- `evidence/compound-interest-repro.mjs`
- `evidence/browser-interaction-results.json`
- `evidence/accuracy-mobile.png`
- `evidence/accuracy-table.png`
- `evidence/cbm-mobile.png`
- `evidence/cbm-table.png`
- `evidence/accuracy-analyzer-print.pdf`
- `evidence/reorder-point-print.pdf`
