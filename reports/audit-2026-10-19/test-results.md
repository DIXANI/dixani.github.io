# DIXANI Test Results — 2026-10-19

## Environment

| Item | Value |
|---|---|
| Repository | `C:\Users\DELL\Documents\Website\dixani.github.io` |
| Commit | `682e48e` |
| Branch | `main`, aligned with `origin/main` |
| Node | v24.21.0 |
| Chrome | 155.0.8059.80 |
| Shell | PowerShell |
| Server | Local static server, not production |
| Date/time | 2026-10-19, Asia/Qatar |

## Baseline Test Suite

Command:

```powershell
node --test tests/pallet-calculator.test.mjs tests/cache-version.test.mjs tests/schema.test.mjs tests/site-integrity.test.mjs tests/site-search.test.mjs
```

Result:

| Tests | Pass | Fail | Skipped | Cancelled | Duration |
|---|---:|---:|---:|---:|---:|
| 67 | 67 | 0 | 0 | 0 | 1,387.9 ms |

Saved output: `evidence/node-test-run-2026-10-19.txt`.

The earlier baseline capture is `reports/AUDIT-BASELINE-2026-10-19.txt`. Do **not** run `node --test tests/` on this Node version; it fails to discover the suite correctly. Use explicit files.

## Executed Audit Harnesses

| Harness | Cases / scope | Result | Artifact |
|---|---|---|---|
| Site survey | 64 pages, sitemap, links, metadata, schema, forms | Completed | `evidence/site-survey.json` |
| DOM formula harness | 23 calculator families, normal and edge cases | Completed with observed defects | `evidence/calculator-checks-results.json` |
| Browser interaction audit | 68 scripted cases | 68 executed, 0 harness failures | `evidence/browser-interaction-results.json` |
| Mobile 64-page scan | 64 pages at 390 × 844 | Completed; no local JS exceptions | `evidence/dixani-page-audit.json` |
| Remaining checks | Accuracy edge cases, keyboard, checkbox, backup, PDF | Completed | `evidence/remaining-checks-results.json` |
| Download audit | 62 references, 30 unique files | 30/30 exist; valid signatures | PowerShell output summarized below |
| Compound repro | Partial-period compounding | Reproduced defect | `evidence/compound-interest-repro.mjs` |

Important: `ok: true` in the browser interaction artifact means the scripted case ran successfully. It does **not** mean the product behavior was correct. Product judgments are in the expected/actual tables below.

## Verified Correct Behavior

### Inventory

- Reorder Point 10/day × 5-day lead + 20 safety = 70; available 50; `REORDER NOW`.
- Safety Stock simple 25 × 10 − 15 × 7 = 145.
- Safety Stock advanced 1.96 × 6 × √7 = 31.11.
- Inventory Turnover 500,000 / 125,000 = 4.00×; 91.25 inventory days.
- DIO = 91.25 days; target inventory 102,739.73; difference 22,260.27.
- EOQ = 2,000 units; 5 orders; USD 1,000/year; current-order relevant cost 4,062.50.
- Variance Report rejects invalid quantities/costs and avoids zero-denominator percentages.
- Cycle Count Planner initial counts, excluded dates, capacity carry-forward, overdue delay, completion-history regeneration, duplicate/location validation and CSV formula-injection guard behaved as documented.

### Warehouse and logistics

- CBM 60 × 40 × 35 cm × 20 = 1.6800 m³, 240 kg; fractional quantity rejected.
- Pallet 200 cartons: 9/layer, 5 layers, 45/pallet, 5 pallets, last 20, 1.68 m³, 90%.
- Container 1,000 cartons: capacity 392, 3 containers, last 216, 70.85% utilization.
- Warehouse space 500 pallets at 4 levels, 1.2 × 1.0 m, 40% aisle, 15% support = 232.50 m².
- Warehouse capacity sample = 3,400 practical / 4,000 theoretical pallets.
- Unit converter: 1 m = 3.28 ft; 1 kg = 2.20 lb; 1,000 L = 1 m³; 1 m² = 10.76 ft²; reverse and same-unit conversions correct.

### Business and finance

- Profit margin and markup formulas distinguish margin from markup.
- Working Hours 08:00–17:00 with 60-minute break = 8h; USD 160 at USD 20/hour.
- Working Hours overnight and same-time validation correct.
- Break-Even 10k / 100 / 60 / 400 = 250 units, 25,000 revenue, 40% margin, 6,000 profit.
- Discount 100, 20%, quantity 2 = USD 80 each / USD 160; stacked 20% + 10% = USD 72 / 28% effective.
- VAT add/remove correct.
- Loan 100,000 at 5% for 5 years = USD 1,887.12 monthly and USD 13,227.40 total interest; zero-interest case correct.
- Simple interest 10,000 at 5% for 3 years = USD 1,500.

### Interactive tools

- Warehouse Shift Challenge completed all five scenarios and the result screen.
- AI Assistant variance, huddle, daily-report and knowledge flows executed.
- Focused Reorder Point calculate button and header links displayed a visible focus outline after real Tab key events.
- Weekday checkbox visual measured 18 × 18 px; wrapped label measured approximately 67–81 × 44 px; programmatic label activation toggled the checkbox.

### Downloads and print

- 62 download references resolve to 30 unique `.xlsx`/`.pdf` targets.
- All `.xlsx` files begin with ZIP signature `PK`; all `.pdf` files begin with `%PDF`; none are zero bytes.
- Accuracy Analyzer PDF generated: 188,976 bytes.
- Reorder Point PDF generated: 626,383 bytes.
- Visual print pagination was not manually reviewed.

## Executed Product Failures

| Case | Input | Expected | Actual | Status |
|---|---|---|---|---|
| Accuracy invalid numbers | `BAD,not-a-number,not-a-number,not-a-number` | Reject or field errors | Imports; 100% accuracy; zero exposure | **Fail** |
| Accuracy duplicate rows | `DUP,A-01,10,9,5` and `DUP,A-01,20,20,5` | Reject/flag duplicate | 2 of 2 items; 50% accuracy | **Fail** |
| Accuracy blank quantities | `BLANK,A-01,,,10` | Reject blank required fields | 100% accuracy | **Fail** |
| Accuracy negative quantities | `NEG,A-01,-5,-10,5` | Reject without returns mode | 5-unit variance; USD 25 exposure | **Fail** |
| Accuracy unclosed quote | Row starting `"BROKEN,Unclosed...` | Parse error | Merged row imported | **Fail** |
| Accuracy future count date | `2099-01-01` | Reject | Accepted as age zero | **Fail** |
| Compound, 1 month | 10,000; 5%; monthly | USD 10,041.67 | USD 10,000.00 | **Fail** |
| Compound, 3 months | 10,000; 5%; monthly | USD 10,125.52 | USD 10,083.51 | **Fail** |
| Reorder negative demand | −10/day; lead 5; safety 20; stock 100 | Reject | −30.00; `STOCK OK` | **Fail** |
| Safety negative deviation | Z 1.96; deviation −6; lead 7 | Reject | −31.11; −2.07 days | **Fail** |
| Volumetric fractional quantity | 2.9 cartons | Reject | Displays 2; computes two cartons | **Fail** |
| Volumetric stale result | Negative quantity after valid result | Clear result | Prior weights remain | **Fail** |
| Working Hours stale result | Break 600 after valid shift | Clear result | 8h and USD 160 remain | **Fail** |
| Break-Even stale result | Negative fixed cost after valid result | Clear result | 250 units remain | **Fail** |
| Pallet fractional total | 200.5 cartons | Reject | Last pallet 21 | **Fail** |
| Container fractional total | 1,000.5 cartons | Reject | Last container 216.5 | **Fail** |
| CBM mobile width | 390 px viewport | No page overflow | Document 610 px; wrapper overflow visible | **Fail** |
| Accuracy mobile width | 390 px viewport | Bounded table scroll | Document 1,330 px; wrapper 328 / scroll 1,336 | **Fail; device confirmation pending** |
| Cycle backup malformed | `{not valid json` | Friendly recovery | Raw parser message | **Fail** |
| Skip link | Any page from top | Visible-on-focus skip link | None on 64 pages | **Fail** |

## Blocked or Not Executed

| Check | Reason | Status |
|---|---|---|
| Live HTTPS/status/redirects | Network unreachable | Blocked |
| Live canonical/sitemap response | Network unreachable | Blocked |
| Indexing and rich-result eligibility | Requires live Search Console/URL inspection | Blocked |
| Core Web Vitals | No live page or CrUX access | Blocked |
| Competitor page inspection | All reference domains unreachable | Blocked |
| Physical iOS/Android layout | No device available | Not executed |
| NVDA/VoiceOver/TalkBack | No assistive technology available | Not executed |
| 200–400% zoom/reflow | Not executed | Not executed |
| Print preview pagination | PDFs generated, visual layout not reviewed | Partially tested |
| Real Excel/clipboard paste from desktop apps | Browser field values simulated | Partially tested |
| Browser storage quota failure | Not forced | Not executed |
| Daylight-saving transition | Date logic inspected, not executed across DST | Partially tested |

No browser-test pass is claimed for production. Browser checks were against the local repository.

## New Regression Tests Recommended

These were not added to `tests/` because application changes were not approved. Proposed files:

- `tests/inventory-accuracy-input.test.mjs`
- `tests/compound-interest.test.mjs`
- `tests/reorder-safety-stock-input.test.mjs`
- `tests/carton-integer-validation.test.mjs`
- `tests/cycle-count-backup.test.mjs`
- `tests/calculator-result-state.test.mjs`
- `tests/a11y-navigation.test.mjs` (browser-dependent, keep separate)

Minimum cases:

1. Non-finite, blank, negative, fractional and very large values.
2. Duplicate SKU-location and duplicate completions.
3. Unclosed quotes and malformed delimited files.
4. Zero denominator and zero COGS/inventory.
5. 1, 3, 7, 11 and 12 compounding months; annual, quarterly, monthly, daily; contributions at the stated timing.
6. Integer carton validation for CBM, pallet, container and volumetric weight.
7. Result clearing after every validation failure.
8. Future/invalid dates and leap-day boundaries.
9. CSV export escaping and formula injection.
10. Skip link and keyboard focus order.

## Reproduction

```powershell
node --test tests/pallet-calculator.test.mjs tests/cache-version.test.mjs tests/schema.test.mjs tests/site-integrity.test.mjs tests/site-search.test.mjs
node reports/audit-2026-10-19/evidence/site-survey.mjs
node reports/audit-2026-10-19/evidence/calculator-checks.mjs
node reports/audit-2026-10-19/evidence/browser-interaction-audit.cjs
node reports/audit-2026-10-19/evidence/remaining-checks.cjs
```

The browser harnesses start Chrome with host resolution restricted to `127.0.0.1`; they cannot reach external sites.

## Evidence Index

- `evidence/site-survey.json`
- `evidence/dixani-page-audit.json`
- `evidence/calculator-checks-results.json`
- `evidence/browser-interaction-results.json`
- `evidence/remaining-checks-results.json`
- `evidence/compound-interest-repro.mjs`
- `evidence/node-test-run-2026-10-19.txt`
- `evidence/*.png`
- `evidence/*.pdf`
