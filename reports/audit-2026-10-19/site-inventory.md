# DIXANI Site Inventory — 2026-10-19

## Method

The inventory was generated from every `index.html` file in the repository, excluding `reports/`, then reconciled with `sitemap.xml`. Result: **64 pages on disk and 64 sitemap URLs**, with no page missing from either side. Implementation files were identified from page source and script declarations.

Status meanings:

- **Tool audited:** formula reviewed, sample result independently checked, and relevant edge cases exercised.
- **Interactive audited:** browser workflow exercised, not a formula calculator.
- **Download audited:** page reviewed and every referenced artifact checked for existence and file signature.
- **Content/smoke:** route, metadata, links, and mobile rendering checked; no calculator logic.
- **Navigation audited:** route/links/metadata checked; workflow content reviewed at a high level.

Test-coverage shorthand:

- `Node suite` — covered by the existing 67-test suite (directly or by site-wide integrity checks).
- `68-case browser` — included in the scripted browser audit.
- `Formula harness` — independent DOM-harness check in `evidence/calculator-checks-results.json`.
- `Additional checks` — remaining-checks script, PDF checks, download checks, or site survey.
- `Static survey` — metadata, headings, links, schema, canonical, and mobile scan only.

## Master Route Inventory

| Route | Page / tool | Main purpose | Implementation files | Test coverage | Initial risk | Audit status |
|---|---|---|---|---|---|---|
| `/` | Homepage | Discover tools, categories, templates, search | `index.html`, `assets/js/main.js`, `assets/js/search-index.js` | Node suite; 64-page browser scan | Medium | Content/smoke |
| `/about/` | About | Trust and project context | `about/index.html` | Static survey | Low | Content/smoke |
| `/contact/` | Contact | Feedback and support | `contact/index.html` | Static survey | Low | Content/smoke |
| `/privacy/` | Privacy policy | Privacy, analytics, advertising disclosures | `privacy/index.html` | Static survey | Medium | Content/smoke |
| `/terms/` | Terms | Usage terms | `terms/index.html` | Static survey | Low | Content/smoke |
| `/ai-operations-assistant/` | AI Operations Assistant demo | Guided variance, huddle, daily-report, knowledge workflows | `ai-operations-assistant/index.html`, `assets/js/ai-operations-assistant.js` | 68-case browser | Medium | Interactive audited |
| `/simulators/warehouse-shift-challenge/` | Warehouse Shift Challenge | Five-scenario operations simulator | `simulators/warehouse-shift-challenge/index.html`, `assets/js/warehouse-shift-challenge.js` | 68-case browser | Low | Interactive audited |
| `/inventory-control-toolkit/` | Inventory Control Toolkit | Workflow hub for inventory tools, guides, templates | `inventory-control-toolkit/index.html` | Node suite; static survey | Medium | Navigation audited |
| `/categories/inventory/` | Inventory category | Inventory tool directory | `categories/inventory/index.html` | Node suite; static survey | Low | Content/smoke |
| `/categories/logistics/` | Logistics category | Warehouse/logistics tool directory | `categories/logistics/index.html` | Node suite; static survey | Low | Content/smoke |
| `/categories/business/` | Business category | Business tool directory | `categories/business/index.html` | Node suite; static survey | Low | Content/smoke |
| `/categories/converters/` | Converters category | Measurement tool directory | `categories/converters/index.html` | Node suite; static survey | Low | Content/smoke |
| `/categories/finance/` | Finance category | Finance tool directory | `categories/finance/index.html` | Node suite; static survey | Low | Content/smoke |
| `/inventory/reorder-point/` | Reorder Point Calculator | Reorder threshold, coverage, stock status | `inventory/reorder-point/index.html`, `assets/js/reorder.js` | 68-case browser; formula harness | High | Tool audited |
| `/inventory/safety-stock/` | Safety Stock Calculator | Simple and service-level buffer estimates | `inventory/safety-stock/index.html`, `assets/js/safety-stock.js` | 68-case browser; formula harness | High | Tool audited |
| `/inventory/inventory-turnover/` | Inventory Turnover Calculator | Turnover ratio and inventory days | `inventory/inventory-turnover/index.html`, `assets/js/inventory-turnover.js` | 68-case browser; formula harness | Medium | Tool audited |
| `/inventory/dio-calculator/` | DIO Calculator | Days Inventory Outstanding and target inventory | `inventory/dio-calculator/index.html`, `assets/js/dio-calculator.js` | 68-case browser; formula harness | Medium | Tool audited |
| `/inventory/eoq-calculator/` | EOQ Calculator | Economic order quantity and relevant costs | `inventory/eoq-calculator/index.html`, `assets/js/eoq-calculator.js` | 68-case browser; formula harness | Medium | Tool audited |
| `/inventory/inventory-accuracy-analyzer/` | Inventory Accuracy Analyzer | Import counts, accuracy KPIs, ABC classes, risk ranking, exports | `inventory/inventory-accuracy-analyzer/index.html`, `assets/js/inventory-accuracy-analyzer.js` | 68-case browser; formula harness; additional checks; PDF | Critical | Tool audited |
| `/inventory/variance-report/` | Inventory Variance Report | Compare system/physical stock and generate a report | `inventory/variance-report/index.html`, `assets/js/inventory.js` | 68-case browser | Medium | Tool audited |
| `/inventory/cycle-count-planner/` | Cycle Count Planner | Import inventory, schedule counts, record completions, backup/restore | `inventory/cycle-count-planner/index.html`, `assets/js/cycle-count-planner.js` | 68-case browser; additional checks | Medium | Tool audited |
| `/logistics/cbm-calculator/` | CBM Calculator | Multi-row carton volume, weight, unit conversion | `logistics/cbm-calculator/index.html`, `assets/js/cbm-calculator.js` | 68-case browser; additional mobile check | High | Tool audited |
| `/logistics/pallet-calculator/` | Pallet Calculator | Pallet layout, layers, pallet count, envelope CBM | `logistics/pallet-calculator/index.html`, `assets/js/pallet-calculator.js` | Node suite; 68-case browser | Medium | Tool audited |
| `/logistics/container-loading-calculator/` | Container Loading Calculator | Uniform-orientation container capacity and visual plan | `logistics/container-loading-calculator/index.html`, `assets/js/container-loading-calculator.js` | 68-case browser | Medium | Tool audited |
| `/logistics/warehouse-space-calculator/` | Warehouse Space & Capacity | Space required and practical pallet capacity | `logistics/warehouse-space-calculator/index.html`, `assets/js/warehouse-space-calculator.js` | 68-case browser | Medium | Tool audited |
| `/categories/converters/volumetric-weight-calculator/` | Volumetric Weight Calculator | Dimensional/chargeable weight | `categories/converters/volumetric-weight-calculator/index.html`, `assets/js/volumetric-weight-calculator.js` | 68-case browser; additional checks | High | Tool audited |
| `/categories/converters/unit-converter/` | Unit Converter | Length, weight, volume, area conversions | `categories/converters/unit-converter/index.html`, `assets/js/unit-converter.js` | 68-case browser | Low | Tool audited |
| `/categories/business/profit-margin-calculator/` | Profit Margin Calculator | Margin and selling price | `categories/business/profit-margin-calculator/index.html`, `categories/business/profit-margin-calculator/profit-margin.js` | 68-case browser; formula harness | Medium | Tool audited |
| `/categories/business/markup-calculator/` | Markup Calculator | Markup, selling price, equivalent margin | `categories/business/markup-calculator/index.html`, `categories/business/markup-calculator/markup-calculator.js` | 68-case browser; formula harness | Medium | Tool audited |
| `/categories/business/working-hours-calculator/` | Working Hours Calculator | Shift duration, breaks, optional earnings | `categories/business/working-hours-calculator/index.html`, `categories/business/working-hours-calculator/working-hours.js` | 68-case browser; additional stale-result check | High | Tool audited |
| `/categories/finance/break-even-calculator/` | Break-Even Calculator | Break-even units/revenue and profit estimate | `categories/finance/break-even-calculator/index.html`, `categories/finance/break-even-calculator/break-even.js` | 68-case browser; formula harness | Medium | Tool audited |
| `/categories/finance/compound-interest-calculator/` | Compound Interest Calculator | Future value, contributions, interest | `categories/finance/compound-interest-calculator/index.html`, `assets/js/compound-interest-calculator.js` | 68-case browser; dedicated repro | High | Tool audited |
| `/categories/finance/discount-calculator/` | Discount Calculator | Sale price, savings, stacked discounts | `categories/finance/discount-calculator/index.html`, `categories/finance/discount-calculator/discount.js` | 68-case browser; formula harness | Low | Tool audited |
| `/categories/finance/loan-payment-calculator/` | Loan Payment Calculator | Amortizing payment and interest | `categories/finance/loan-payment-calculator/index.html`, `assets/js/loan-payment-calculator.js` | 68-case browser | Medium | Tool audited |
| `/categories/finance/simple-interest-calculator/` | Simple Interest Calculator | Simple interest and total amount | `categories/finance/simple-interest-calculator/index.html`, `assets/js/simple-interest-calculator.js` | 68-case browser | Low | Tool audited |
| `/categories/finance/vat-calculator/` | VAT Calculator | Add/remove VAT | `categories/finance/vat-calculator/index.html`, `categories/finance/vat-calculator/vat.js` | 68-case browser; formula harness | Low | Tool audited |
| `/guides/` | Guides index | Guide directory | `guides/index.html` | Node suite; static survey | Low | Content/smoke |
| `/guides/abc-inventory-analysis/` | ABC analysis guide | Formula, example, classification guidance | `guides/abc-inventory-analysis/index.html` | Static survey | Low | Content/smoke |
| `/guides/inventory-accuracy-percentage/` | Accuracy percentage guide | Record, quantity, value accuracy methods | `guides/inventory-accuracy-percentage/index.html` | Static survey | Low | Content/smoke |
| `/guides/investigate-inventory-variances/` | Variance investigation guide | Root-cause workflow | `guides/investigate-inventory-variances/index.html` | Static survey | Low | Content/smoke |
| `/guides/warehouse-cycle-count-checklist/` | Cycle count checklist | Step-by-step count process | `guides/warehouse-cycle-count-checklist/index.html` | Static survey | Low | Content/smoke |
| `/guides/warehouse-space-utilization/` | Warehouse utilization guide | Formulas, examples, capacity risks | `guides/warehouse-space-utilization/index.html` | Static survey; GSC evidence | Medium | Content/smoke |
| `/templates/` | Templates index | Download directory | `templates/index.html` | Node suite; download audit | Low | Download audited |
| `/templates/inventory/` | Inventory templates | Inventory form directory | `templates/inventory/index.html` | Download audit pair | Low | Download audited |
| `/templates/inventory/inventory-adjustment-form/` | Inventory Adjustment Form | Excel/PDF inventory adjustment | `templates/inventory/inventory-adjustment-form/index.html`, `/downloads/inventory/dixani-inventory-adjustment-form.{xlsx,pdf}` | Download audit | Low | Download audited |
| `/templates/inventory/inventory-master-list/` | Inventory Master List | Excel SKU master | `templates/inventory/inventory-master-list/index.html`, `/downloads/inventory/dixani-inventory-master-list.xlsx` | Download audit | Low | Download audited |
| `/templates/inventory/reorder-level-tracker/` | Reorder Level Tracker | Excel reorder tracker | `templates/inventory/reorder-level-tracker/index.html`, `/downloads/inventory/dixani-reorder-level-tracker.xlsx` | Download audit | Low | Download audited |
| `/templates/inventory/stock-count-sheet/` | Stock Count Sheet | Excel/PDF count sheet | `templates/inventory/stock-count-sheet/index.html`, `/downloads/inventory/dixani-stock-count-sheet.{xlsx,pdf}` | Download audit; GSC evidence | Low | Download audited |
| `/templates/inventory/stock-movement-register/` | Stock Movement Register | Excel movement register | `templates/inventory/stock-movement-register/index.html`, `/downloads/inventory/dixani-stock-movement-register.xlsx` | Download audit | Low | Download audited |
| `/templates/inventory/stock-variance-report/` | Stock Variance Report | Excel variance report | `templates/inventory/stock-variance-report/index.html`, `/downloads/inventory/dixani-stock-variance-report.xlsx` | Download audit | Low | Download audited |
| `/templates/purchasing/` | Purchasing templates | Procurement form directory | `templates/purchasing/index.html` | Download audit pair | Low | Download audited |
| `/templates/purchasing/purchase-order/` | Purchase Order | Excel/PDF purchase order | `templates/purchasing/purchase-order/index.html`, `/downloads/purchasing/dixani-purchase-order-template.{xlsx,pdf}` | Download audit | Low | Download audited |
| `/templates/purchasing/purchase-requisition/` | Purchase Requisition | Excel/PDF requisition | `templates/purchasing/purchase-requisition/index.html`, `/downloads/purchasing/dixani-purchase-requisition-form.{xlsx,pdf}` | Download audit | Low | Download audited |
| `/templates/purchasing/purchase-tracker/` | Purchase Tracker | Excel purchase tracker | `templates/purchasing/purchase-tracker/index.html`, `/downloads/purchasing/dixani-purchase-tracker.xlsx` | Download audit | Low | Download audited |
| `/templates/purchasing/request-for-quotation/` | Request for Quotation | Excel/PDF RFQ | `templates/purchasing/request-for-quotation/index.html`, `/downloads/purchasing/dixani-request-for-quotation-rfq.{xlsx,pdf}` | Download audit | Low | Download audited |
| `/templates/purchasing/supplier-comparison/` | Supplier Comparison | Excel weighted comparison | `templates/purchasing/supplier-comparison/index.html`, `/downloads/purchasing/dixani-supplier-comparison-sheet.xlsx` | Download audit | Low | Download audited |
| `/templates/purchasing/supplier-evaluation/` | Supplier Evaluation | Excel/PDF supplier scorecard | `templates/purchasing/supplier-evaluation/index.html`, `/downloads/purchasing/dixani-supplier-evaluation-form.{xlsx,pdf}` | Download audit | Low | Download audited |
| `/templates/warehouse/` | Warehouse templates | Warehouse form directory | `templates/warehouse/index.html` | Download audit pair | Low | Download audited |
| `/templates/warehouse/damage-write-off-form/` | Damage & Write-Off Form | Excel/PDF write-off record | `templates/warehouse/damage-write-off-form/index.html`, `/downloads/warehouse/dixani-damage-write-off-form.{xlsx,pdf}` | Download audit | Low | Download audited |
| `/templates/warehouse/goods-issue-note/` | Goods Issue Note | Excel/PDF GIN | `templates/warehouse/goods-issue-note/index.html`, `/downloads/warehouse/dixani-goods-issue-note.{xlsx,pdf}` | Download audit | Low | Download audited |
| `/templates/warehouse/goods-received-note/` | Goods Received Note | Excel/PDF GRN | `templates/warehouse/goods-received-note/index.html`, `/downloads/warehouse/dixani-goods-received-note.{xlsx,pdf}` | Download audit | Low | Download audited |
| `/templates/warehouse/packing-list/` | Packing List | Excel/PDF packing list | `templates/warehouse/packing-list/index.html`, `/downloads/warehouse/dixani-warehouse-packing-list.{xlsx,pdf}` | Download audit | Low | Download audited |
| `/templates/warehouse/picking-list/` | Picking List | Excel/PDF picking list | `templates/warehouse/picking-list/index.html`, `/downloads/warehouse/dixani-warehouse-picking-list.{xlsx,pdf}` | Download audit | Low | Download audited |
| `/templates/warehouse/stock-transfer-form/` | Stock Transfer Form | Excel/PDF transfer form | `templates/warehouse/stock-transfer-form/index.html`, `/downloads/warehouse/dixani-stock-transfer-form.{xlsx,pdf}` | Download audit | Low | Download audited |

## Route and Asset Reconciliation

| Check | Result |
|---|---|
| `index.html` pages on disk | 64 |
| Sitemap URLs | 64 |
| Pages missing from sitemap | 0 |
| Sitemap URLs missing on disk | 0 |
| Pages with one H1 | 64 |
| Pages with one canonical | 64 |
| Canonical URLs matching route | 64 |
| Pages with `index, follow` | 64 |
| Broken internal links | 0 |
| Duplicate titles | 0 |
| Duplicate meta descriptions | 0 |
| Missing image `alt` | 0 |
| Invalid JSON-LD blocks | 0 |
| Unique download targets | 30 |
| Missing download targets | 0 |

## Notes on Coverage

- The 68 browser cases all executed without harness exceptions. `ok: true` in that artifact means the interaction ran, not that every observed product behavior was correct.
- The Node suite has 67 tests and no failures. Some tests are site-wide integrity checks rather than calculator-specific tests; see `test-results.md`.
- `warehouse-space-calculator` has two modes, space required and capacity from area; both were exercised.
- The AI assistant is a rule-based demo, not a generative or networked AI service in the inspected source.
- No legacy redirect files or orphan routes were found in the repository.
