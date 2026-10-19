# DIXANI Website Audit — 2026-10-19

**Repository:** `C:\Users\DELL\Documents\Website\dixani.github.io`  
**Commit audited:** `682e48e` (`main`, aligned with `origin/main`)  
**Live site:** `https://dixani.com/` (verified reachable 2026-10-19, HTTP 200 — see `live-verification-and-p2-closure.md`)  
**Audit status:** Baseline, high-value analysis, and live technical-SEO verification complete. Indexing status, Core Web Vitals, and competitor inspection remain blocked.

## Executive Summary

DIXANI has a credible static foundation: 64 indexable pages, a 64-URL sitemap that matches the files on disk, unique titles and descriptions, valid JSON-LD, no broken internal links, 30 working downloadable artifacts, and 67 existing automated tests passing. The browser audit executed 68 interaction cases across the calculators and tools.

The most serious problems are in calculation safety, not presentation:

- **Critical:** Inventory Accuracy Analyzer silently converts invalid CSV numbers to zero. A row such as `BAD,not-a-number,not-a-number,not-a-number` imports as a perfect match and produces `100%` exact-match accuracy with zero exposure.
- **High:** Duplicate SKU-location rows are treated as separate records, distorting item accuracy and risk ranking.
- **High:** Compound Interest undercounts partial compounding periods. At 5% annual interest compounded monthly, `USD 10,000` for one month returns `USD 10,000.00` instead of approximately `USD 10,041.67`.
- **High:** Reorder Point and Safety Stock accept negative demand/deviation values and can display negative operational results.
- **High:** Working Hours leaves stale earnings and hours visible after a validation error.
- **High:** Volumetric Weight truncates fractional carton quantity (`2.9` becomes `2`) and retains stale results after invalid input.
- **High:** CBM Calculator overflows the mobile viewport at 390 px, with a document width of 610 px.

No application files, commits, branches, deployments, or Git history were changed. The only new repository content is this report directory and its evidence.

## Scope and Method

- Inspected all 64 `index.html` routes and matched them to `sitemap.xml`.
- Inspected 23 calculator/tool implementations, plus the AI Operations Assistant and Warehouse Shift Challenge.
- Recalculated formulas with independent expected values and edge cases.
- Ran a local static server and headless Chrome 155 for 68 scripted interactions, 64-page mobile checks, keyboard Tab tests, malformed-file tests, and PDF generation.
- Verified all 30 unique downloadable `.xlsx`/`.pdf` targets exist and have valid file signatures.
- Ran the existing 67-test Node suite successfully.
- Attempted live-site and competitor HTTP requests; network access failed before any response.

## Confirmed Priority Findings

| ID | Priority | Severity | Finding | Evidence |
|---|---|---|---|---|
| AUD-001 | P0 | Critical | Accuracy Analyzer coerces invalid numbers to zero and reports 100% accuracy. | `calculator-audit.md`, `bug-register.csv`, `evidence/calculator-checks-results.json`, `evidence/remaining-checks-results.json` |
| AUD-002 | P0 | High | Accuracy Analyzer accepts duplicate SKU-location rows. | `evidence/calculator-checks-results.json` |
| AUD-007 | P0 | High | Compound Interest omits a partial monthly compounding period. | `evidence/compound-interest-repro.mjs` |
| AUD-008 | P0 | High | Reorder Point accepts negative average demand. | `evidence/calculator-checks-results.json` |
| AUD-009 | P0 | High | Safety Stock accepts negative standard deviation. | `evidence/calculator-checks-results.json` |
| AUD-010 | P1 | High | Volumetric Weight truncates fractional quantity. | `evidence/remaining-checks-results.json` |
| AUD-012 | P1 | High | Working Hours retains stale results after invalid break input. | `evidence/remaining-checks-results.json` |
| AUD-016 | P1 | High | CBM mobile layout creates page-level horizontal overflow. | `evidence/cbm-mobile.png`, `evidence/cbm-table.png` |
| AUD-011, AUD-013 | P1 | Medium | Several calculators retain prior results after an error. | `evidence/remaining-checks-results.json` |
| AUD-019 | P1 | Medium | No skip link on any of 64 pages. | `evidence/dixani-page-audit.json` |

## Verified Strengths

- Reorder Point, Safety Stock (valid inputs), Inventory Turnover, DIO, EOQ, Profit Margin, Markup, Working Hours (valid inputs), Break-Even, Discount, VAT, Loan, Simple Interest, CBM, Pallet, Container, Warehouse Space, Volumetric Weight (valid inputs), and Unit Converter produced correct expected results.
- Pallet and container limits are documented honestly; neither claims advanced bin-packing optimization.
- Template downloads are present and valid; 62 references resolve to 30 unique files.
- Every page has one H1, one canonical, a robots directive, a complete social card, and no broken internal link.
- No unnamed visible controls, duplicate IDs, multiple H1s, or local JavaScript exceptions were found across the 64-page mobile scan.
- Actual keyboard Tab testing produced visible focus outlines on primary buttons and navigation links.

## Limitations

- `https://dixani.com/`, `sitemap.xml`, and all three named competitor sites were unreachable from the sandbox. Live status codes, redirects, indexing, deployed HTML, analytics, AdSense behavior, and Core Web Vitals were not verified.
- Browser checks ran against a local static server, not the production deployment.
- Responsive checks used headless Chrome emulation; no physical iOS or Android device was available.
- AdSense readiness is an evidence review, not a prediction or guarantee of approval.
- Competitor features, rankings, traffic, keyword volume, CPC, and difficulty were not invented. See `competitor-analysis.md`.
- Print/PDF output was generated successfully, but page-by-page visual print layout was not manually reviewed.

## Deliverables

- `README.md` — this report
- `site-inventory.md` — all routes, tools, files, and audit status
- `calculator-audit.md` — per-tool formula analysis and verified defects
- `bug-register.csv` — structured defect register
- `competitor-analysis.md` — access-blocked comparison framework and verified differentiation analysis
- `seo-audit.md` — technical SEO, content, performance, AdSense-readiness evidence
- `ux-accessibility-audit.md` — mobile, keyboard, focus, controls, and print findings
- `new-tool-opportunities.md` — prioritized tool, guide, and template opportunities
- `implementation-roadmap.md` — P0–P3 plan with files, effort, risk, and verification
- `test-results.md` — baseline, executed checks, failures, and blocked checks
- `evidence/` — scripts, JSON, screenshots, PDFs, and test output

## Recommended Next Actions

1. Fix the Inventory Accuracy import contract first: reject non-numeric cells, reject blank required quantities, detect duplicate SKU-location keys, and reject malformed/unclosed CSV records.
2. Replace the compound-interest daily approximation with exact compound-period and fractional-period math, with monthly, quarterly, annual, and contribution cases tested independently.
3. Add shared non-negative validation to Reorder Point, Safety Stock, Pallet, Container, Volumetric Weight, and all finance tools, and clear stale result regions on every error path.
4. Fix the CBM mobile table CSS and recheck at 320, 360, 390, and 430 px.
5. Add a skip link and verify contrast for the flagged small-label/coming-soon text before treating it as a WCAG failure.
6. Complete live-site, Search Console, and manual competitor checks before making deployment or ranking claims.

## Reproduction

Run from the repository root:

```powershell
node --test tests/pallet-calculator.test.mjs tests/cache-version.test.mjs tests/schema.test.mjs tests/site-integrity.test.mjs tests/site-search.test.mjs
node reports/audit-2026-10-19/evidence/site-survey.mjs
node reports/audit-2026-10-19/evidence/calculator-checks.mjs
node reports/audit-2026-10-19/evidence/browser-interaction-audit.cjs
node reports/audit-2026-10-19/evidence/remaining-checks.cjs
```

The browser scripts start their own local server and headless Chrome instance. They do not contact the production site.
