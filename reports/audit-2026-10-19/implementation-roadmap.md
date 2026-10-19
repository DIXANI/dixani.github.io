# DIXANI Implementation Roadmap — 2026-10-19

## Principles

1. Fix incorrect decisions before adding features.
2. Add a regression test with every calculation fix.
3. Preserve URLs, canonical URLs, schema and existing design tokens unless a documented reason requires change.
4. Keep inventory processing browser-side.
5. Do not add a framework, server, database or external service for formula fixes.
6. Complete live competitor and production measurements before competitive or ranking claims.

Effort is expressed in engineer-days and is an estimate.

## P0 — Critical

| ID | Task | Files | Dependencies | Benefit | Effort | Risk | Verification |
|---|---|---|---|---|---|---|---|
| P0-1 | Harden Accuracy Analyzer import: reject non-finite numbers, blanks, negatives and future dates; make import atomic | `assets/js/inventory-accuracy-analyzer.js` | Shared validation helper if available | Prevents false 100% accuracy and false zero exposure | 1.5–2 days | Low/Medium: stricter imports may reject previously accepted messy files; provide row-level errors | New tests for invalid numbers, blanks, negatives, future dates; existing sample import still passes |
| P0-2 | Detect duplicate SKU-location rows | `assets/js/inventory-accuracy-analyzer.js` | P0-1 | Prevents double counting and distorted risk ranking | 0.5–1 day | Low | Duplicate fixture rejected or flagged; unique rows still work |
| P0-3 | Replace compound-interest daily approximation with exact period/fractional-period math | `assets/js/compound-interest-calculator.js` | Define contribution timing convention | Correct financial result for partial periods | 1.5–2.5 days | Medium: contribution timing and rounding must be agreed | Independent tests for 1, 3, 7, 11, 12 months and multiple frequencies |
| P0-4 | Add non-negative finite validation to Reorder Point and Safety Stock | `assets/js/reorder.js`, `assets/js/safety-stock.js` | None | Prevents negative thresholds and negative buffer stock | 0.5–1 day | Low | Negative-demand, negative-deviation and zero-input tests |
| P0-5 | Clarify fixed-lead-time assumption in Safety Stock; consider future lead-time-variability mode | `inventory/safety-stock/index.html`, `assets/js/safety-stock.js` | Product decision | Prevents misuse of demand-variability formula when supplier lead time varies | 0.5 day for copy; 2–3 days for new mode | Medium if a new statistical mode is added | Formula text and FAQ reviewed by operations specialist; new-mode tests if implemented |

**Exit criteria:** invalid import cannot produce a KPI; duplicate row cannot silently affect accuracy; one-month monthly compounding equals the independent formula; negative operational inputs are rejected with no stale output.

## P1 — High

| ID | Task | Files | Dependencies | Benefit | Effort | Risk | Verification |
|---|---|---|---|---|---|---|---|
| P1-1 | Reject unclosed CSV quotes and malformed records with row-specific errors | `assets/js/inventory-accuracy-analyzer.js`, `assets/js/cycle-count-planner.js` | P0-1 | Prevents silent data corruption | 1 day | Low | Malformed fixtures rejected without replacing current dataset |
| P1-2 | Require integer carton totals in Pallet, Container and Volumetric Weight | `assets/js/pallet-calculator.js`, `assets/js/container-loading-calculator.js`, `assets/js/volumetric-weight-calculator.js` | Shared validator | Eliminates fractional cartons and silent truncation | 0.5–1 day | Low | `200.5`, `1000.5`, `2.9` rejected; whole values unchanged |
| P1-3 | Clear results on every validation failure in Working Hours, Volumetric Weight and Break-Even; audit all calculators for the same pattern | Relevant page-local JS and `assets/js/*` | Shared result-state helper | Prevents copying stale results | 1–2 days | Low | Every invalid case shows no prior result values |
| P1-4 | Fix CBM mobile overflow | `assets/css/cbm-calculator.css`, `logistics/cbm-calculator/index.html` | None | Removes page-level sideways scrolling | 0.5–1 day | Low | Document width equals viewport at 320/360/390/430 px |
| P1-5 | Investigate and fix Accuracy Analyzer root-width overflow; improve table affordance | `assets/css/inventory-accuracy-analyzer.css`, page markup | P1-4 pattern | Better mobile editing and result reading | 1–2 days | Low/Medium | Real-device check; no root overflow; table scroll contained |
| P1-6 | Add skip-to-content link sitewide | Shared header markup or generator, shared CSS | Confirm canonical page template | WCAG bypass-blocks improvement | 0.5–1 day | Low | First Tab reaches skip link; Enter moves focus to main |
| P1-7 | Friendly malformed-backup recovery in Cycle Count Planner | `assets/js/cycle-count-planner.js` | None | Better trust and recovery | 0.25–0.5 day | Low | Malformed JSON and wrong schema preserve workspace |
| P1-8 | Manually verify contrast for coming-soon, optional and helper text | Shared CSS | Design review | Determine whether real WCAG issues exist | 0.5–1 day | Low | Recorded contrast evidence; only confirmed failures changed |
| P1-9 | Harden all calculator error semantics (`aria-invalid`, `aria-describedby`, live region/focus) | Shared validator/template | UX review | Better screen-reader and keyboard feedback | 2–3 days | Medium: template-wide change | Manual NVDA/VoiceOver spot checks; no duplicate announcements |

**Exit criteria:** no fractional carton results; no stale result after error; CBM and Accuracy pages do not overflow on supported mobile widths; skip link works; backup errors are friendly.

## P2 — Growth

| ID | Task | Files | Dependencies | Benefit | Effort | Risk | Verification |
|---|---|---|---|---|---|---|---|
| P2-1 | Add explicit workflow handoff from Accuracy Analyzer to Cycle Count Planner | Both page JS and CSV schema | P0/P1 data contract | Reduces repeat entry and makes the workflow defensible | 2–3 days | Medium: schema compatibility | End-to-end test: import → analyze → export → plan |
| P2-2 | Add workflow links between Accuracy, ABC guide, Cycle Count, Variance and Toolkit | Page content and shared link patterns | None | Better discovery and topical depth | 0.5–1 day | Low | Link tests; browser click-through |
| P2-3 | Add “How this calculation works” block and worked example to high-value tool pages | Reorder, Safety Stock, CBM, Container, Warehouse Space, Pallet | Content review | Better instructional intent and trust | 2–3 days | Low | Content checklist; internal-link tests |
| P2-4 | Measure production LCP/INP/CLS; optimize only measured bottlenecks | Shared scripts/CSS | Live access | Evidence-based performance improvement | 0.5 day measure + 1–3 days optimize | Low/Medium | Before/after field/lab data |
| P2-5 | Stock Coverage Calculator | New page + JS + schema + search index | P1 validation pattern | Connects reorder and DIO | 1–2 days | Low | Independent formula and edge-case tests |
| P2-6 | TI-HI mode in Pallet Calculator | Pallet page and JS | P1-2 | Satisfies known terminology demand | 1–2 days | Low | TI × HI fixture; visual consistency |
| P2-7 | Warehouse Storage Cost Calculator | New page + JS + schema + search index | P2-4 content pattern | Serves observed no-page query | 2–3 days | Low | Independent cost examples; currency/period tests |
| P2-8 | Container ISO 6346 check-digit validator | New page + JS + schema | Verify current standard and test vectors | Useful bounded shipping utility | 1–2 days | Medium: correctness-critical | Published example vectors; invalid-format tests |
| P2-9 | Rack Bay / Racking Capacity Calculator | New page + JS + guide | Warehouse-space content review | Extends capacity planning | 3–5 days | Medium/High: safety assumptions | Hand-worked layouts; prominent safety disclaimer |
| P2-10 | Inventory Aging / Slow-Moving Analyzer | New page + JS + template | P0/P1 import contract | Extends operational workflow | 3–5 days | Medium | Age-bucket boundary tests; CSV privacy check |
| P2-11 | Supplier OTD / Lead-Time Scorecard | New page + JS + template | Safety-stock data contract | Closes procurement-to-planning loop | 3–4 days | Medium | On-time/in-full boundary tests; malformed import tests |

**Exit criteria:** the count-to-cycle-count handoff works with one consistent schema; new tools meet the same validation and result-clearing standard as fixed tools; performance changes are measurement-driven.

## P3 — Later

| ID | Task | Files | Dependencies | Benefit | Effort | Risk | Verification |
|---|---|---|---|---|---|---|---|
| P3-1 | Warehouse capacity guide expansion | `guides/warehouse-space-utilization/` or new guide | Content audit to avoid duplication | Instructional intent | 2–3 days | Low | Worked example reproduces calculator output |
| P3-2 | Container stuffing / load-planning guide | Container page or guide | Operations review | Separates geometric estimate from safe loading | 2–3 days | Medium: safety claims | Reviewed checklist and disclaimers |
| P3-3 | Freight Cost per CBM / kg Calculator | New page + JS | CBM/volumetric schemas | Connects volume to freight economics | 1–2 days | Low | Cost-per-unit examples; currency tests |
| P3-4 | Picking Productivity Calculator | New page + JS | None | Adds labor measurement | 2–3 days | Low | Productivity boundary tests; no universal benchmark claims |
| P3-5 | Inventory reconciliation workbook | `downloads/inventory/`, template page | P2-1 schema | Offline workflow artifact | 2–3 days | Low | File opens; formulas checked with sample data |
| P3-6 | Cycle count schedule template | `downloads/inventory/`, template page | Planner schema | Offline schedule artifact | 1–2 days | Low | Excel/PDF open; columns match planner |
| P3-7 | Supplier performance scorecard template | `downloads/purchasing/`, template page | P2-11 schema | Reusable procurement review | 1–2 days | Low | Weighted-score formula checked |
| P3-8 | Review eight long titles and one long description | Route metadata | SEO review | Better snippet presentation | 0.5–1 day | Low | Unique titles retained; SERP-preview review |
| P3-9 | Manual competitor capture and comparison | New dated report | Human browser access | Evidence-based positioning | 1–2 days | Low | URLs, screenshots and access dates recorded |

## Phase Plan

### Phase A — Verified Critical Fixes

1. Accuracy Analyzer input contract and duplicate detection.
2. Compound-interest partial-period correction.
3. Reorder Point and Safety Stock validation.
4. Clear stale results in the three confirmed tools.

**Dependency:** approve the calculation conventions before editing, especially contribution timing and duplicate handling.
**Expected benefit:** removes the highest risk of false inventory and financial decisions.

### Phase B — Formula and Regression Coverage

1. Add independent tests for all P0 defects.
2. Add validation tests for zero, negative, fractional, blank, very large and malformed data.
3. Add duplicate-key and date-boundary tests.
4. Keep site-integrity, schema, search and cache tests green.

**Verification:** `node --test` with explicit test files; add the new test file(s) to the documented command. Do not rely on `node --test tests/` on this Node version.

### Phase C — High-Impact UX and Accessibility

1. CBM and Accuracy mobile fixes.
2. Skip link and error/result-state standard.
3. Manual contrast verification.
4. Keyboard and screen-reader spot checks.
5. Print preview review.

**Expected benefit:** removes obvious mobile friction and makes error states trustworthy.

### Phase D — Technical SEO and Content

1. Production status/redirect/canonical verification.
2. Instructional blocks and worked examples.
3. Internal workflow links.
4. Performance measurement and targeted optimization.
5. Title/description review.

**Dependency:** live deployment access.

### Phase E — Competitive Feature Upgrades

1. Complete manual competitor capture.
2. Compare only observed pages.
3. Prioritize features where DIXANI has a workflow advantage, not merely a keyword.
4. Upgrade pallet/container planning only if evidence shows user demand and safety requirements can be met.

### Phase F — New Tools, Guides and Templates

1. Stock Coverage Calculator.
2. TI-HI mode.
3. Warehouse Storage Cost Calculator.
4. ISO 6346 validator.
5. Racking calculator after safety review.
6. Aging and supplier-performance workflows.
7. Templates paired with the above.

## Acceptance Criteria

- No invalid numeric CSV import produces a KPI.
- Duplicate SKU-location records cannot silently affect accuracy.
- One-month monthly compounding equals the independent result.
- Negative demand/deviation/carton quantities are rejected.
- No calculator leaves a prior result visible beside a validation error.
- CBM and Accuracy pages have no unintended page-level horizontal overflow on supported mobile widths.
- A skip link is available on every page.
- New tests fail before fixes and pass afterward.
- Existing 67 tests remain green.
- No URL, canonical, sitemap, privacy, analytics or download regression is introduced.

## Suggested Verification Commands

```powershell
node --test tests/pallet-calculator.test.mjs tests/cache-version.test.mjs tests/schema.test.mjs tests/site-integrity.test.mjs tests/site-search.test.mjs
node reports/audit-2026-10-19/evidence/calculator-checks.mjs
node reports/audit-2026-10-19/evidence/browser-interaction-audit.cjs
node reports/audit-2026-10-19/evidence/remaining-checks.cjs
```

New regression tests should be added to the explicit Node command once approved. Browser tests should remain separate from the static Node suite because they require Chrome and a local server.

## Approval Gate

No application fix has been applied in this audit. The next step is approval of P0 scope and the related calculation conventions. Estimated total for Phase A plus the first regression tests: **4–7 engineer-days**, excluding review and deployment.
