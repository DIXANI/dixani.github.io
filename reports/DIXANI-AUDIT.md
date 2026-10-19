# DIXANI Website — Technical SEO, Performance, Calculator & Content Audit

- **Site:** https://dixani.com/ (GitHub Pages)
- **Repo:** `dixani.github.io`
- **Date:** 2026-10-16
- **Mode:** READ-ONLY audit (no production files modified)
- **Auditor artifact:** `audit-check.mjs` (temporary helper script, untracked — exclude from commit)

---

## 1. Executive Summary

DIXANI is a **64-page static HTML site** hosted on GitHub Pages, focused on inventory, logistics, warehousing and small-business calculators/templates. The technical foundation is **strong**: every page has a correct canonical, every page resolves internally, the sitemap URL set matches the file inventory exactly (64/64), GA4 + Cloudflare analytics are present site-wide, and there are **zero duplicate titles, descriptions or H1s**.

However, the audit surfaced **one critical content defect**, **one confirmed calculator accuracy bug**, and a set of **high-impact SEO gaps** (structured data missing on 55/64 pages, FAQ schema absent entirely, social images missing on ~40 pages, meta descriptions over the SERP truncation limit on 21 pages).

| Severity | Count | Headline |
|---|---|---|
| 🔴 Critical | 2 | (1) `inventory-master-list` has **no `<title>`** and **two descriptions**; (2) **Pallet Calculator "Loaded Pallet CBM" is wrong** |
| 🟠 High | 4 | Missing og:image on ~40 pages; structured data only on 9/64; 0 FAQ schema; 21 over-long meta descriptions |
| 🟡 Medium | 5 | Long titles (7 pages); missing `robots` meta on 1 page; stale root `main.js`; limited internal search; missing `lastmod` on 59 sitemap URLs |
| 🟢 Low | 3 | 3 raw `&rarr;` entities rendered visibly; 1 short title/description pair; no breadcrumb markup on 56 pages |

**Overall verdict:** The site is technically clean and crawlable, but is under-optimized for rich results and social sharing, and it ships one **materially incorrect calculator output** that undermines user trust. Fixing the two critical items is low-effort and high-value.

---

## 2. Page & Tool Inventory

- **Total pages:** 64 (`index.html` per folder)
- **Sitemap URLs:** 64 — **exact match** to file inventory (no orphans, no missing pages)
- **Analytics coverage:** 64/64 (GA4 `G-LQEH9L9TZ4` + Cloudflare beacon)
- **Canonical tags:** 64/64 correct and absolute
- **Duplicate titles/descriptions/H1s:** **none detected**
- **Broken internal links:** **0**

### Site structure
| Section | Pages | Notes |
|---|---|---|
| Root / marketing | 7 | `/`, `/about/`, `/contact/`, `/privacy/`, `/terms/`, `/ai-operations-assistant/`, `/inventory-control-toolkit/` |
| Category hubs | 5 | `categories/{inventory,logistics,business,finance,converters}/` |
| Calculators | 20 | inventory (7), logistics (4), finance (7), business (3), converters (2) |
| Guides | 6 | `guides/*` |
| Templates | 25+ | `templates/{inventory,purchasing,warehouse}/*` |
| Simulators | 1 | `simulators/warehouse-shift-challenge/` |

### Calculator inventory (JS logic reviewed)
| Tool | JS file | Verdict |
|---|---|---|
| EOQ Calculator | `eoq-calculator.js` | ✅ Logic sound |
| Safety Stock | `safety-stock.js` | ✅ Logic sound |
| Reorder Point | `reorder.js` | ✅ Logic sound |
| Inventory Turnover | `inventory-turnover.js` | ✅ Logic sound |
| DIO Calculator | `dio-calculator.js` | ✅ Logic sound |
| Pallet Calculator | `pallet-calculator.js` | ❌ **CBM output incorrect** (see §6.1) |
| CBM Calculator | `cbm-calculator.js` | ✅ Correct + strong validation |
| Container Loading | `container-loading-calculator.js` | ✅ Correct (6 orientations, cargo volume) |
| Warehouse Space | `warehouse-space-calculator.js` | Not fully reviewed (lower risk) |

---

## 3. Critical Issues (Fix First)

### 🔴 C1 — `templates/inventory/inventory-master-list/` is broken for SEO
**Evidence:** `node audit-check.mjs` →
```
templates/inventory/inventory-master-list/index.html: <title> count = 0
templates/inventory/inventory-master-list/index.html: description count = 2
templates/inventory/inventory-master-list/index.html: missing og:image
```
- **No `<title>` element at all** → Google synthesizes a title; SERP CTR and ranking signal both suffer.
- **Two `<meta name="description">` tags** → only the first is used by most engines; the second is dead weight and a duplication signal. The first description is **362 characters** (more than double the ~160 truncation limit).
- **Impact:** This is the only page in the entire site with these defects, making it an outlier that looks like a copy-paste failure.

### 🔴 C2 — Pallet Calculator reports a mathematically incorrect "Loaded Pallet CBM"
**Evidence —** `assets/js/pallet-calculator.js` line 7:
```js
let loaded = a.ph + layers * a.ch,
    util   = per * L * W / (a.pl * a.pw) * 100,
    f      = factor[$("unit").value],
    cbm    = a.pl * f * a.pw * f * loaded * f;   // ⚠ BUG
```
- `cbm` = **pallet footprint area × total loaded height**, where `loaded` **includes the empty pallet height (`a.ph`)**.
- This computes the **bounding-box volume of the whole stack** — i.e. pallet volume + every air gap + the wooden pallet itself. It is **not** the cargo volume a freight forwarder/container calculator would use.
- **Correct formula:** `cbm = (per * layers) × (cl * cw * ch) × f³` (cartons per pallet × carton volume).
- **Worked example (site's own sample: carton 40×30×25 cm, pallet 120×100, mh 150, ph 15, 9/layer × 5 layers):**
  - Reported: `1.20 × 1.00 × (0.15 + 1.25) = 1.68 m³`
  - True cargo: `45 × 0.40 × 0.30 × 0.25 = 1.35 m³` → **overstated by ~0.33 m³ (~24 %)**
- **Impact:** Users comparing this against the site's own CBM/container tools get contradictory numbers. It is also labelled "Loaded Pallet CBM", which reads as cargo volume. This is the highest trust-risk defect on the site.

---

## 4. On-Page SEO Findings

### 4.1 Meta titles
- ✅ All unique; 55 of 64 within the 30–60 char sweet spot.
- 🔴 **1 page missing entirely:** `templates/inventory/inventory-master-list/`
- 🟠 **7+ titles over 60 chars** (risk truncation):
  `inventory-control-toolkit` (70), `templates/purchasing/` (70), `request-for-quotation` (68), `damage-write-off-form` (68), `inventory-accuracy-analyzer` (67), `inventory-adjustment-form` (66), `working-hours-calculator` (65), `loan-payment-calculator` (65), `categories/inventory/` (64), `guides/warehouse-space-utilization` (64), `categories/finance/` (63), `categories/business/` (61)
- 🟡 **2 titles under 30 chars:** `contact/` (14), `privacy/` (23)

### 4.2 Meta descriptions
- ✅ All unique.
- 🔴 **1 page with 2 descriptions + 362 chars:** `inventory-master-list`
- 🟠 **21 descriptions over 160 chars** (truncated in SERPs, lowering CTR). Worst offenders: `inventory-control-toolkit` (191), `break-even-calculator` (178), `stock-count-sheet` (178), `purchase-requisition` (173), `request-for-quotation` (172), `about/` (170)
- 🟡 **1 under 70 chars:** `contact/` (46)

### 4.3 Headings
- ✅ Exactly **one H1 per page** across all 64 pages.
- ✅ Strong H2 usage on content pages (8–15 per page).
- 🟢 `templates/*` pages sit at 4–11 H2/H3 — acceptable but thinner than guides.

### 4.4 Canonicals, robots, indexing
- ✅ Canonicals correct and absolute on 64/64.
- 🟠 **`categories/converters/unit-converter/` has no `robots` meta** (all other pages declare `index, follow`). Low risk (default indexable) but inconsistent.
- ✅ `robots.txt`, `ads.txt`, and the Google verification file `google657459984a174e04.html` are all present.

### 4.5 Structured data (Schema.org)
| Metric | Count | Coverage |
|---|---|---|
| Pages with any `ld+json` | **9 / 64** | 14 % |
| Pages with `BreadcrumbList` | 8 | 12.5 % |
| Pages with `FAQPage` | **0** | 0 % |
| Homepage | has `ld+json` ✅ | — |

- 🟠 **55 pages have zero structured data** — no `WebApplication`, `SoftwareApplication`, `HowTo`, `Article` or `ItemList` markup.
- 🟠 **No FAQPage schema anywhere**, despite many pages (homepage, guides, tool pages) containing genuine FAQ blocks. This forfeits rich-result eligibility.
- 🟢 Breadcrumb markup exists on only 8 pages, but breadcrumb *links* appear visually on far more — marking them up is cheap.

### 4.6 Social / Open Graph
- 🟠 **~40 pages missing `og:image`** (all `templates/*`, all `inventory/*` tools, most `categories/*`, `finance/*`, `logistics/*`, `about/`, `contact/`, `privacy/`, `terms/`). Shared links render without a preview card.
- Where present, OG tags appear correctly formed.

### 4.7 Content quality
- 🟢 Guides are substantive; tool pages include explanatory sections, examples and disclaimers (good for E-E-A-T).
- 🟡 Template pages (`templates/*`) are largely structural — watch for **thin-content** classification; the 4–5 H2 hubs are the weakest.
- 🔴 `inventory-master-list` has duplicated meta content.

---

## 5. Performance Findings

- 🟡 **Render-blocking JavaScript:** flagged on 41 pages (1–2 per page). In practice these are: (a) the inline `gtag.js` config snippet, and (b) page-specific calculator JS **placed at the end of `<body>`** — acceptable placement, but it is **not `defer`red**, so it still counts as render-blocking and can delay interactivity. Recommend `defer` on local scripts.
- ✅ GA4 is loaded `async` (correct).
- ✅ Cloudflare beacon is `async` (correct).
- ✅ **No content images** on most pages (`img=0`), so LCP is driven by CSS/text — inherently fast. Only 2 pages include an image (`inventory-adjustment-form`, `stock-count-sheet`), both with dimensions specified — ✅ no CLS from images.
- ✅ CSS is small and split (`site-consistency.css` + per-tool CSS).
- 🟡 No `preconnect`/`preload` hints for analytics/tooling origins observed.
- 🟢 No heavy frameworks (no React/jQuery/bundler) — very lightweight footprint.

**Net:** Performance is good by construction (static, minimal assets). The only actionable wins are `defer` on local JS and resource hints.

---

## 6. Calculator Issues

### 6.1 🔴 Pallet Calculator — incorrect CBM (repeat of C2)
See §3 C2. Affects the `#cbm` "Loaded Pallet CBM" output on `/logistics/pallet-calculator/`. Fix formula to `per × layers × cl × cw × ch`.

### 6.2 ✅ Container Loading Calculator — correct, minor polish
- Correctly evaluates 6 carton orientations, uses true cargo volume for utilization (`o.cap × carton_volume / container_volume`). ✅
- Minor: stray double semicolon (`util = (cargo / v) * 100;;`) — cosmetic only.
- Minor: container dims auto-preset and lock correctly when a standard type is chosen.

### 6.3 ✅ CBM Calculator — correct and robust
- `cbm = (l·f)(w·f)(h·f)`, `total = cbm × qty`; container fill bars for 20/40/40HC. ✅
- **Strong validation:** guards for non-positive dims, non-integer qty, bad/negative weight, non-finite overflow, and `Number.isSafeInteger` totals; flags bad inputs with `aria-invalid`. ✅ Best-practice among the tools.
- Minor UX: when weight is omitted, total weight shows "—" with an explanatory note (good), but there is no per-row indicator of which row lacks weight.

### 6.4 ✅ EOQ / Safety Stock / Reorder / Turnover / DIO
- Formulas verified sound (√ EOQ, Z-score safety stock, ROP = demand×lead + SS, COGS/avg-inventory, 365/turnover).
- Consistent pattern: `get()` validation → `blank()` on invalid → `calc()`; inline warn banners; sample/clear buttons; live recalculation on `input`. ✅

### 6.5 Cross-tool consistency
- ⚠️ **Inconsistent CBM semantics:** CBM Calculator and Container Loading use true cargo volume; Pallet Calculator uses bounding-box volume. This is the root cause of contradictory numbers between linked tools — fix all to true cargo volume and label consistently.
- ✅ Consistent UI idioms (`.actions`, `.warn`, sample/clear) across tools.

### 6.6 Validation & edge-case observations
- Pallet: guards `ph >= mh`, `per < 1`, `layers < 1` — good.
- 🟡 Pallet: `total` must be an integer but lacks the `Number.isSafeInteger` overflow guard used in CBM Calculator.
- 🟡 No print/export buttons found on tools — users cannot export results (feature gap, not a bug).

---

## 7. Analytics Status

| Item | Status |
|---|---|
| GA4 (`G-LQEH9L9TZ4`) | ✅ All 64 pages, `async` |
| Cloudflare Web Analytics beacon | ✅ All 64 pages, `async` |
| Search-console verification | ✅ `google657459984a174e04.html` present |
| `ads.txt` | ✅ Present |
| Structured-data rich results | ❌ No schema → no rich results to measure |
| Calculator event tracking | ❓ None observed — consider GA4 events on Calculate/Export clicks |

---

## 8. Prioritized Recommendations

### P0 — Critical (do first)
1. **Fix `templates/inventory/inventory-master-list/index.html`:** add a single `<title>`, remove the duplicate `<meta name="description">`, shorten the description to ≤160 chars, add `og:image`.
2. **Fix the Pallet Calculator CBM formula** to true cargo volume: `cbm = per * layers * (cl * cw * ch) * f³`, and keep the label precise (e.g. "Loaded Carton CBM"). Verify against the documented sample (expect **1.35 m³**, not 1.68 m³).

### P1 — High
3. Add `og:image` to the ~40 pages missing it (a single branded 1200×630 image is fine to start).
4. Add JSON-LD: `BreadcrumbList` site-wide; `FAQPage` on pages with visible FAQs; `SoftwareApplication`/`WebApplication` on tool pages.
5. Rewrite the **21 over-long meta descriptions** to ≤160 chars; expand `contact/` (46 chars) and lengthen `privacy/` title (23 chars).

### P2 — Medium
6. Trim the **7+ titles over 60 chars**.
7. Add the missing `robots` meta to `unit-converter`.
8. **Delete or fix the stale root `/main.js`** (it redirects inventory searches to `/inventory/`, which no longer matches the live `assets/js/main.js` target `/inventory/variance-report/`). Removing the dead file eliminates confusion.
9. Improve on-site search to cover *all* tools, not just `inventory|variance|stock` keywords.
10. Add `<lastmod>` to the **59 sitemap URLs** currently missing it (aids recrawl).

### P3 — Low
11. Replace the 3 raw `&rarr;` literals (homepage, `categories/inventory/`, `inventory/cycle-count-planner/`) with `→`.
12. `defer` local calculator scripts; add `preconnect` hints.
13. Add `HowTo`/`Article` schema to guides; add print/export to tools.

---

## 9. Files to Modify (for the fix phase)

| Priority | File(s) |
|---|---|
| P0 | `templates/inventory/inventory-master-list/index.html`; `assets/js/pallet-calculator.js` |
| P1 | ~40 × `index.html` (og:image); 64 × `index.html` (JSON-LD); 21 × `index.html` (descriptions) |
| P2 | 7+ × `index.html` (titles); `categories/converters/unit-converter/index.html`; `main.js` (delete); `assets/js/main.js` (search); `sitemap.xml` |
| P3 | `index.html`, `categories/inventory/index.html`, `inventory/cycle-count-planner/index.html`; `assets/js/*.js` (defer); guide pages (schema) |

---

## 10. Staged Fix Plan (proposed — awaiting approval)

- **Stage 1 (P0, ~30 min):** Fix `inventory-master-list` metadata + Pallet CBM formula. Verify with `node audit-check.mjs` and a manual sample calc (expect 1.35 m³).
- **Stage 2 (P1, ~2–3 h):** og:image rollout + JSON-LD (Breadcrumb/FAQ/App) + meta-description rewrites.
- **Stage 3 (P2, ~1–2 h):** title trims, robots meta, delete stale `main.js`, improve search, sitemap `lastmod`.
- **Stage 4 (P3, ~1 h):** entity fixes, `defer`, guide schema, print/export.
- **Validation each stage:** re-run `audit-check.mjs`, spot-check affected pages on a local static server, confirm no regressions in link resolution / duplicate detection.

---

## Appendix A — Audit Method

Read-only Node script `audit-check.mjs` (temporary, untracked) walks all 64 `index.html` files, extracting `<title>`, meta description, canonical, robots, OG tags, H1/H2 counts, `ld+json` (Breadcrumb/FAQ detection), `<img>` dimension presence, script counts/blocking flags, raw HTML entities, and resolves all internal links against the file inventory. PowerShell console encoding produced false-positive "mojibake" readings on `☰`; files are valid UTF-8 — Node-based validation is authoritative.

## Appendix B — Raw Counts

```
Pages: 64 | Sitemap URLs: 64 | Canonicals: 64 | Analytics: 64
Duplicate titles/descs/H1s: 0 | Broken internal links: 0
Missing <title>: 1 | Duplicate descriptions: 1 | Descriptions >160: 21
Titles >60: 7+ | Titles <30: 2 | Descriptions <70: 1
Pages with ld+json: 9 | BreadcrumbList: 8 | FAQPage: 0
Pages missing og:image: ~40 | Missing robots meta: 1
Sitemap URLs missing lastmod: 59 | Raw &rarr; entities: 3
```
