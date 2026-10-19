# DIXANI New Tool, Guide and Template Opportunities — 2026-10-19

## Evidence Standard

Opportunity labels:

- **Observed demand** — a query or query cluster appears in DIXANI’s historical Search Console export. Impressions are DIXANI’s own observed impressions, not total market volume.
- **Operational need** — a repeatable workflow gap evident from the tools, guides or templates.
- **Speculative** — plausible but supported by neither first-party query data nor live competitor research.

Competitor coverage is **unverified** because competitor sites were unreachable. No search-volume, CPC, difficulty, traffic or revenue estimates are provided.

## Priority Summary

| Priority | Opportunity | Evidence type | Effort estimate | Why now |
|---|---|---|---|---|
| P2 | Warehouse Storage Cost Calculator | Observed demand: 17 impressions, position 80.18, no matching page | 2–3 engineer-days | Clear query-to-page gap and natural finance/warehouse bridge |
| P2 | Container ISO 6346 Check Digit Validator | Observed demand: 13 impressions, position 36.15 | 1–2 days | Bounded, deterministic utility with a clear task |
| P2 | Rack Bay / Racking Capacity Calculator | Observed demand: 9 impressions, position 81.11 | 3–5 days | Extends warehouse capacity beyond floor-area estimates |
| P2 | TI-HI Pallet Mode | Observed terminology in pallet queries | 1–2 days | Low-effort extension to a page already targeting pallet layouts |
| P2 | Stock Coverage / Days of Inventory Calculator | Operational need | 1–2 days | Natural bridge from reorder point to stock planning |
| P2 | Inventory Aging and Slow-Moving Analyzer | Operational need | 3–5 days | Extends the Accuracy Analyzer workflow into excess and obsolescence |
| P2 | Supplier On-Time Delivery and Lead-Time Scorecard | Operational need | 3–4 days | Complements reorder/safety stock and purchasing templates |
| P3 | Warehouse capacity instructional guide | Observed demand: approximately 200 impressions across the cluster | 2–3 content days | Serves “how to calculate” intent alongside the calculator |
| P3 | Container stuffing / load-planning guide | Observed demand: approximately 180 impressions across the cluster | 2–3 content days | Separates “how many fit” from practical loading |
| P3 | Freight Cost per CBM / kg Calculator | Operational need | 1–2 days | Connects CBM and chargeable-weight tools to freight decisions |
| P3 | Picking Productivity Calculator | Operational need | 2–3 days | Adds warehouse labor measurement to the logistics category |
| P3 | Inventory reconciliation workbook | Operational need | 2–3 days | Pairs directly with count, variance and cycle-count tools |
| P3 | Cycle count schedule template | Observed query “cycle count template excel” | 1–2 days | Complements the planner with an offline artifact |
| P3 | Supplier performance scorecard template | Operational need | 1–2 days | Pairs with a future supplier OTD tool |

Effort estimates are planning estimates, not commitments.

## Detailed Opportunities

### 1. Warehouse Storage Cost Calculator (P2)

**User and intent:** warehouse manager, finance lead or small-business operator estimating monthly/annual cost per pallet position or per square metre.

**Observed evidence:** GSC query `warehouse storage cost calculator` earned 17 impressions at average position 80.18 with no matching page.

**Core workflow:** storage area or pallet positions → rent/overhead → utilization → cost per position and cost per occupied pallet; optionally cost per unit stored.

**Implementation:** client-side arithmetic; 1–2 inputs for area/positions, rent, period and utilization. Include currency and period controls.

**Differentiation:** connect the result to the existing Warehouse Space and Inventory Turnover tools; explain that storage cost is not the same as holding cost.

**Guide/template pairing:** “How to calculate warehouse storage cost”; storage-cost worksheet template.

**Internal links:** Warehouse Space Calculator, Inventory Turnover, ABC guide, warehouse templates.

**Risk:** users may confuse rent per square metre with fully loaded storage cost. State inclusions and exclusions clearly.

**Maintenance:** low.

### 2. Container ISO 6346 Check Digit Validator (P2)

**User and intent:** freight coordinator or documentation clerk validating an 11-character container number before booking, customs or carrier submission.

**Observed evidence:** GSC query `check digit calculator container` earned 13 impressions at average position 36.15 with no matching page.

**Core workflow:** enter owner code, equipment category, serial and check digit; validate length/format and compute the expected check digit; explain the result.

**Implementation:** pure client-side validation. Implement only after confirming the current ISO 6346 specification and test published examples.

**Differentiation:** pair the validator with the container-loading tool and a short “container number anatomy” explanation.

**Guide/template pairing:** “How to validate a container number”; shipping-document checklist.

**Internal links:** Container Loading Calculator, Packing List template, CBM Calculator.

**Risk:** stale or incorrect standard implementation would be worse than no tool. Include authoritative examples and a visible “documentation aid, not carrier approval” disclaimer.

**Maintenance:** low if the standard is stable, but requires periodic review.

### 3. Rack Bay / Racking Capacity Calculator (P2)

**User and intent:** warehouse planner estimating beams, levels, bays, ground positions and pallet positions from rack dimensions.

**Observed evidence:** GSC query `warehouse racking calculator` earned 9 impressions at average position 81.11.

**Core workflow:** aisle width, bay width, beam length, levels, flue space, clear height → bays per run, pallet positions, usable height, storage density.

**Implementation:** medium geometry; still client-side. Validate against a small hand-worked layout.

**Differentiation:** extend beyond `floor(area / pallet footprint)` by requiring rack geometry and aisle constraints. Link back to Warehouse Space and forward to capacity planning.

**Guide/template pairing:** rack-bay layout worksheet; “rack capacity vs floor capacity” guide.

**Internal links:** Warehouse Space Calculator, Pallet Calculator, Warehouse Space Utilization guide.

**Risk:** rack design is safety-critical. The tool must state that it is conceptual and does not replace structural engineering, fire review or manufacturer limits.

**Maintenance:** medium.

### 4. TI-HI Pallet Mode (P2)

**User and intent:** warehouse or logistics staff who describe pallet configuration as TI (cartons per tier) × HI (tiers high).

**Evidence:** historical GSC queries include `pallet ti hi calculator`, `tihi calculator`, `calculate ti hi`, and `tihi pallet`. The exact aggregate volume is not verified.

**Core workflow:** enter TI and HI, or derive them from carton/pallet dimensions; output cartons per pallet and pallets required.

**Implementation:** low; add a mode to the existing Pallet Calculator and a worked TI-HI example.

**Differentiation:** connects the industry term to the existing visual layout rather than creating a separate thin page.

**Guide/template pairing:** “TI-HI explained” section on the pallet page.

**Internal links:** Pallet Calculator, Warehouse Space Calculator, Packing List template.

**Risk:** terminology differs by region. Explain both terms visibly.

**Maintenance:** low.

### 5. Stock Coverage / Days of Inventory Calculator (P2)

**User and intent:** buyer or inventory controller asking “how many days will current stock last?”

**Evidence type:** operational need. It is the missing middle between Reorder Point and DIO.

**Core workflow:** available stock ÷ average daily demand; optional incoming stock and demand variability; display coverage days and a stockout-risk band.

**Implementation:** low; reuse reorder-point input conventions.

**Differentiation:** show both supplier lead time and stock coverage on one screen, then link to Safety Stock and EOQ.

**Guide/template pairing:** “Stock coverage vs DIO vs reorder point” explainer.

**Internal links:** Reorder Point, Safety Stock, DIO, Inventory Turnover.

**Risk:** average demand must match the selected period; make units explicit.

**Maintenance:** low.

### 6. Inventory Aging and Slow-Moving Analyzer (P2)

**User and intent:** identify stock that has not moved, is approaching expiry, or is consuming storage cost.

**Evidence type:** operational need; no direct query observed in the available data.

**Core workflow:** import SKU, quantity, unit cost, last movement date, optional expiry date; classify age buckets; calculate tied-up value and percentage of inventory.

**Implementation:** medium; reuse Accuracy Analyzer import/export patterns. Do not store data server-side.

**Differentiation:** connect aging to ABC classification and storage cost; produce a disposition action list.

**Guide/template pairing:** slow-moving inventory report; aging review checklist.

**Internal links:** ABC guide, Accuracy Analyzer, Cycle Count Planner, Warehouse Storage Cost.

**Risk:** “slow-moving” definitions vary. Make thresholds configurable and clearly labeled as user policy.

**Maintenance:** medium.

### 7. Supplier On-Time Delivery and Lead-Time Scorecard (P2)

**User and intent:** purchasing team measuring supplier reliability and feeding real lead-time variability into safety stock.

**Evidence type:** operational need; no aggregate query evidence verified.

**Core workflow:** PO due date, actual receipt date, ordered/received quantity; calculate on-time %, in-full %, lead-time mean and standard deviation; rank suppliers.

**Implementation:** medium; CSV import and local export. Avoid supplier names or confidential data leaving the browser.

**Differentiation:** hand off lead-time variability to Safety Stock, closing the loop between measurement and planning.

**Guide/template pairing:** supplier scorecard template; “using lead-time variability in safety stock” guide.

**Internal links:** Supplier Evaluation template, Safety Stock, Reorder Point, purchasing templates.

**Risk:** late/partial receipts need clear definitions; avoid presenting a score as a contractual judgment.

**Maintenance:** medium.

### 8. Warehouse Capacity Instructional Guide (P3)

**User and intent:** learners searching “how to calculate warehouse capacity,” “warehouse space calculation,” or “storage capacity of warehouse.”

**Observed evidence:** approximately 200 impressions across the warehouse-space query cluster in the historical GSC export, with weak average positions.

**Format:** step-by-step worked example connecting gross area, storage allocation, aisle allowance, pallet footprint, levels, utilization and practical capacity.

**Differentiation:** use the same numbers as the calculator sample so users can reproduce the result.

**Internal links:** Warehouse Space Calculator, Pallet Calculator, Racking Calculator (future).

**Risk:** duplicating existing guide content. Audit `guides/warehouse-space-utilization/` first and extend rather than create a near-duplicate.

**Maintenance:** low.

### 9. Container Stuffing / Load-Planning Guide (P3)

**User and intent:** freight planner moving from “how many cartons fit” to door clearance, weight distribution, stacking strength, dunnage and securing.

**Observed evidence:** approximately 180 impressions across the container-loading/stuffing cluster.

**Format:** pre-load checklist, worked example, clear distinction between geometric capacity and operational load plan.

**Internal links:** Container Loading Calculator, CBM Calculator, Packing List template.

**Risk:** safety guidance must be conservative and clearly non-authoritative.

**Maintenance:** low/medium.

### 10. Freight Cost per CBM / kg Calculator (P3)

**User and intent:** compare freight quotes on a common unit and understand chargeable-weight effects.

**Evidence type:** operational need.

**Core workflow:** freight charge, CBM, gross weight, chargeable weight, route/currency → cost per CBM, per kg, per chargeable kg; compare modes.

**Differentiation:** link directly from CBM and Volumetric Weight, then into a shipment cost comparison.

**Risk:** carrier surcharges and minimum charges make a simple unit cost incomplete. State exclusions.

**Maintenance:** low.

### 11. Picking Productivity Calculator (P3)

**User and intent:** warehouse supervisor measuring lines per hour, units per hour, orders per hour and labor cost per line.

**Evidence type:** operational need.

**Core workflow:** lines/units/orders, paid hours, staff count, errors → productivity and cost per unit; optional benchmark range.

**Risk:** comparing unlike operations is misleading. Avoid universal productivity targets; label any benchmark as context-specific.

**Maintenance:** low.

### 12. Templates and Workbooks (P3)

| Template | Pairing | Benefit | Effort |
|---|---|---|---|
| Inventory reconciliation workbook | Accuracy Analyzer, Variance Report | One offline artifact from count to adjustment | 2–3 days |
| Cycle count schedule template | Cycle Count Planner | Offline schedule for teams not using the browser app | 1–2 days |
| Slow-moving inventory report | Aging Analyzer (future) | Review and disposition evidence | 1–2 days |
| Supplier performance scorecard | Supplier OTD tool / evaluation page | Repeatable monthly review | 1–2 days |
| Warehouse capacity assessment checklist | Warehouse Space guide | Site-walk data collection | 1 day |

All templates should have Excel and, where useful, print-ready PDF versions. Do not add a format solely for keyword coverage.

## Workflow Opportunity

The strongest product-level opportunity is a connected inventory-control chain:

`count data → exact-match/variance analysis → ABC/risk ranking → cycle-count schedule → recount/variance investigation → adjustment/reconciliation → storage and supplier decisions`

DIXANI already has pieces of this chain. The main missing link is a deliberate, low-friction handoff with a consistent schema:

- SKU
- description
- location
- ABC class
- risk level
- system/physical quantity
- unit cost
- last count date
- next count date

A downloadable handoff file or local browser state can connect the tools without a server or account. This preserves the privacy-first model and creates a differentiating workflow that isolated calculator sites may not match. Competitor validation is still required before claiming uniqueness.

## Recommendation

Implement in this order after P0/P1 fixes:

1. Stock Coverage Calculator (low effort, high workflow value).
2. TI-HI mode and Warehouse Storage Cost Calculator.
3. ISO 6346 validator and Rack Bay Calculator.
4. Aging/Slow-Moving Analyzer and Supplier OTD scorecard.
5. Instructional guides that reuse existing calculator examples.
6. Templates only when they complete one of the workflows above.

## Evidence

- `reports/DIXANI-P2-GSC-ANALYSIS.md`
- `reports/audit-2026-10-19/site-inventory.md`
- `reports/audit-2026-10-19/calculator-audit.md`
