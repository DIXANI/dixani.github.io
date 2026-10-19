# DIXANI P2 — Search Console Analysis & Optimization Plan

**Site:** https://dixani.com/
**Repository:** DIXANI/dixani.github.io
**Hosting:** GitHub Pages
**Data source:** Google Search Console export `dixani.com-Performance-on-Search-2026-10-16.zip`
**Export date:** 16 October 2026
**Status:** **ANALYSIS ONLY — no changes implemented. Awaiting approval.**

---

## 0. Scope, Method and Data Integrity

### Files read from the export

| File | Rows (excl. header) | Purpose |
|---|---|---|
| `Chart.csv` | 42 daily rows | Date range, trend shape |
| `Pages.csv` | 36 | Page-level aggregation |
| `Queries.csv` | 453 | Query-level aggregation |
| `Countries.csv` | 139 | Country-level aggregation |
| `Devices.csv` | 3 | Desktop / Mobile / Tablet |
| `Search appearance.csv` | 0 | Empty — no rich-result data attributed |
| `Filters.csv` | 2 | `Search type: Web (text-based)`, `Date: Last 3 months` |

### Reconciliation — the totals do **not** all match, and that is expected

| Aggregation | Clicks | Impressions |
|---|---|---|
| Chart (daily) | 21 | 4,632 |
| Countries | 21 | 4,632 |
| Devices | 21 | 4,632 |
| Pages | 22 | 4,779 |
| Queries | *not summable (see below)* | — |

Chart, Countries and Devices reconcile **exactly** to 21 clicks / 4,632 impressions — these are the authoritative sitewide totals and match the figures supplied in the brief.

Pages (22 / 4,779) and Queries are **different aggregations and must never be added to each other or to the sitewide totals.** Google Search Console applies independent anonymisation thresholds per dimension: a query seen by very few users may appear in the Pages report but be withheld from the Queries report, and vice versa. The Pages total exceeding the sitewide total by 1 click / 147 impressions is the normal signature of this, not a data error.

`Queries.csv` cannot be summed by naive CSV splitting: at least one query contains a comma inside a quoted field (row 22, `"+days inventory outstanding formula average inventory cost of goods sold 365 authoritative"`). Treat query rows as individual observations, never as an additive total.

### Rules applied throughout this document

- **No invented data.** Every figure is quoted from the export. Where the export is silent (CPC, keyword difficulty, competitor traffic, conversion rate), this document says so rather than estimating.
- **Page and query metrics kept separate.** They are never combined.
- Query impressions are GSC-reported impressions **at DIXANI's average position**, not total market demand.

### Caveats about the dataset

1. **The site is young in this window.** First impression appears 2026-09-05; almost no history before 3 September 2026.
2. **Positions are volatile.** The daily average position swings between 12.8 and 44.5. A page-level position is a 42-day average, not a stable rank.
3. **Average position ≈ 20–60 almost everywhere** — the dominant pattern (section 2).
4. **`Search appearance.csv` is empty** — the site earned **zero** rich results in this window. That is the single most important structural finding for Phase D.

---

## 1. Performance Baseline

### 1.1 Sitewide totals (Chart / Countries / Devices — reconciled)

| Metric | Value |
|---|---|
| Period | 2026-09-03 → 2026-10-14 (42 days) |
| Clicks | 21 |
| Impressions | 4,632 |
| CTR | ≈0.45% |
| Average position | ≈41 (Desktop), ≈16 (Mobile) |

**CTR of 0.45% is very low for the position band the site occupies.** It is the clearest single indicator that titles/descriptions are not converting impressions into clicks — impressions are earned and then lost at the SERP.

### 1.2 Trend shape — impressions growing, clicks flat

| Phase | Dates | Pattern |
|---|---|---|
| Emergence | 09-03 → 09-15 | 0 → ~104 impr/day, average position 42–70 |
| Negative inflection | 09-16 → 09-19 | Impressions steady ~90–107, but position **collapses** 47.8 → 24.4 |
| Recovery | 09-20 → 09-30 | Impressions rise to ~170/day, position improves to ~21 |
| Best window | 09-28 | 4 clicks / 170 impr (2.35% CTR) — best day in the dataset |
| Second decline | 10-02 → 10-14 | Impressions drop to ~110/day, position worsens to 34–45 |

Position **improved** through late September while impressions **rose** — the site was building relevance. From 2 October both degrade together.

### 1.3 Device split — a decisive asymmetry

| Device | Clicks | Impressions | CTR | Position |
|---|---|---|---|---|
| Desktop | 18 | 3,744 | 0.48% | **41.04** |
| Mobile | 3 | 874 | 0.34% | **16.27** |
| Tablet | 0 | 14 | 0% | 11.93 |

**Mobile ranks at position 16.27; desktop at 41.04.** Mobile holds the strongest positions, yet 81% of impressions sit on desktop where ranking is far worse. This inversion almost certainly reflects query intent: the site competes for desktop "calculator / spreadsheet / template" research queries for which it is not yet authoritative, while ranking well for shorter informational mobile queries.

Actionable consequence: desktop is where 3,744 impressions are lost at position 41. Lifting desktop ranking is the largest single lever.

### 1.4 Geography — concentrated demand, unranked markets

| Country | Clicks | Impressions | Position | Note |
|---|---|---|---|---|
| United States | 0 | **1,435** | 43.05 | 31% of all impressions, **zero clicks** |
| United Kingdom | 2 | 308 | 59.24 | |
| India | 4 | 274 | 20.89 | Best performing meaningful market |
| Australia | 0 | 216 | 61.90 | |
| Netherlands | 1 | 112 | 53.52 | |
| Germany | 0 | 126 | 58.35 | |
| Philippines | 0 | 134 | **8.33** | Ranks well, converts nothing |

**The United States alone is 1,435 impressions with zero clicks at position 43.** The site is not yet competitive in its highest-volume market; clicks cluster in lower-volume markets (India, Malaysia, Qatar, Kenya, Sri Lanka, Mexico).

This is structural: DIXANI ranks acceptably in several export/warehouse-heavy markets but not in US/UK/AU, where positions (43.05, 59.24, 61.90) indicate weak topical authority against established calculator domains.

### 1.5 Query concentration — long-tail and fragmented

Of 453 query rows, the overwhelming majority are **1-impression queries at positions 60–100**. The largest single query by impressions is only 95 impressions (`warehouse space utilization`). There is no head term.

Consequence: **there is no single page to fix.** Gains must come from thematic consolidation and lifting many pages out of the 20–60 band, not from optimising one hero page.

---

## 2. Top 10 Optimization Candidates

Ranked by a combination of **impression volume** and **realistic position gain**, not by impressions alone. "Position" is GSC average over the window.

| # | URL | Clicks | Impr | CTR | Pos | Primary intent | Core problem |
|---|---|---|---|---|---|---|---|
| 1 | `/logistics/container-loading-calculator/` | 0 | **745** | 0% | **58.62** | *Transactional* — "how many cartons fit in a container" | Largest impression pool on the site, worst position. Zero clicks from 745 impressions. |
| 2 | `/logistics/warehouse-space-calculator/` | 0 | **644** | 0% | **49.73** | *Computational* — "how much warehouse space do I need" | High volume, no converting snippet, no schema, thin contextual linking. |
| 3 | `/logistics/pallet-calculator/` | 6 | 554 | 1.08% | **46.68** | *Computational* — pallet configuration, cartons per pallet | The site's **best click earner** but ranks 46.68. Highest ROI page: already converts 1.08% at a poor position. |
| 4 | `/guides/warehouse-space-utilization/` | 0 | **478** | 0% | **26.46** | *Informational* — "warehouse space utilization formula" | Closest to page 2 despite 478 impressions. 1,940 words, no FAQ schema. |
| 5 | `/logistics/cbm-calculator/` | 1 | 390 | 0.26% | 28.45 | *Computational* — CBM, carton volume | 390 impressions, 0.26% CTR — a conversion problem more than a ranking problem. |
| 6 | `/guides/investigate-inventory-variances/` | 1 | 276 | 0.36% | **10.13** | *Informational* — investigate a stock variance | **Position 10.13 with 276 impressions but 0.36% CTR.** Rank already good; the SERP snippet is failing. |
| 7 | `/guides/abc-inventory-analysis/` | 2 | 246 | 0.81% | **10.79** | *Informational* — ABC analysis formula/example | Same signature as #6: page-1 rank, poor CTR. |
| 8 | `/templates/inventory/stock-count-sheet/` | 4 | 234 | 1.71% | **11.79** | *Transactional* — download a count sheet | Best CTR of any content page (1.71%) at position 11.79. Push to top 5. |
| 9 | `/inventory/variance-report/` | 1 | 156 | 0.64% | **19.58** | *Transactional* — generate a variance report | Page 2. 1,203 words. Already the most internally linked inventory tool (7 links). |
| 10 | `/inventory/dio-calculator/` | 0 | 144 | 0% | 35.81 | *Computational* — DIO formula/calculation | 144 impressions, zero clicks; competing with definitional intent it does not serve. |

Near-miss worth attention (not top 10): `/categories/business/working-hours-calculator/` — 201 impressions, position 28.83, **zero clicks**, and only 2 inbound links.

### 2.1 The two distinct failure modes — the central insight

The candidates split into two clean groups that **require opposite treatments**:

**Failure mode A — Ranking problem (position 45–60, impressions high, CTR ≈0%):**
`container-loading-calculator` (58.62), `warehouse-space-calculator` (49.73), `pallet-calculator` (46.68), `warehouse-space-utilization` (26.46).
Need **relevance and authority work**: intent alignment, internal links, schema, content depth.

**Failure mode B — Click problem (position 5–20, impressions high, CTR <1%):**
`investigate-inventory-variances` (10.13, 0.36%), `abc-inventory-analysis` (10.79, 0.81%), `stock-count-sheet` (11.79, 1.71%), `variance-report` (19.58, 0.64%).
Already rank on page 1–2. They do **not** need ranking help; they need **title and description work** so the impression converts.

Conflating these groups is the most likely way to waste effort. Rewriting content on a page at position 10 will not fix a 0.36% CTR, and rewriting a title on a page at position 58 will not move it up.

### 2.2 Supporting query evidence (query level — kept separate from page level)

| Query | Impr | CTR | Pos | Maps to |
|---|---|---|---|---|
| warehouse space utilization | 95 | 0% | 19.83 | `guides/warehouse-space-utilization` |
| how to calculate warehouse space | 89 | 0% | 80.79 | `warehouse-space-calculator` |
| warehouse space calculation | 88 | 0% | 79.49 | `warehouse-space-calculator` |
| container loading | 70 | 0% | 91.27 | `container-loading-calculator` |
| warehouse space utilization analysis | 60 | 0% | 37.82 | `guides/warehouse-space-utilization` |
| safety stock calculator | 54 | 0% | 76.41 | `inventory/safety-stock` |
| warehouse utilization formula | 52 | 0% | 22.08 | `guides/warehouse-space-utilization` |
| container loading calculator | 52 | 0% | 75.00 | `container-loading-calculator` |
| space utilization formula | 47 | 0% | 29.53 | `guides/warehouse-space-utilization` |
| pallet calculator | 41 | 0% | 60.29 | `logistics/pallet-calculator` |
| stock count sheet | 31 | 3.23% | 12.39 | `templates/inventory/stock-count-sheet` |
| warehouse storage cost calculator | 17 | 0% | 80.18 | **no matching page** (gap) |
| warehouse racking calculator | 9 | 0% | 81.11 | **no matching page** (gap) |
| warehouse square footage calculator | 9 | 0% | 82.89 | `warehouse-space-calculator` (partial) |

---

## 3. Keyword-to-Page Mapping

### 3.1 Well-matched page/query pairs (protect these)

| Query | Landing page | Verdict |
|---|---|---|
| stock count sheet | `/templates/inventory/stock-count-sheet/` | **Strong match.** 3.23% CTR is the best of any high-impression query. |
| inventory variance report | `/inventory/variance-report/` | **Strong match.** 14.29% CTR on the query. |
| inventory adjustment form / template | `/templates/inventory/inventory-adjustment-form/` | Exact match. |
| inventory variance | `/guides/investigate-inventory-variances/` | Good match. |
| pallet configuration calculator | `/logistics/pallet-calculator/` | Good match — the page title even says "with Visual Layout". |
| cbm calculation / calculate cbm | `/logistics/cbm-calculator/` | Good match. |

### 3.2 Mismatches where a page exists but intent is underserved

| Query cluster | Impr (cluster) | Landing page | The mismatch |
|---|---|---|---|
| how to calculate warehouse space, warehouse space calculation, warehouse capacity calculation, how to calculate storage capacity of warehouse | ~200 | `/logistics/warehouse-space-calculator/` | Query is **instructional** ("how to calculate") but the page is a **tool**. No step-by-step section, no worked example. |
| container loading, container stuffing calculator, container loading plan, container calculation, container load calculator, cargo stuffing calculator | ~180 | `/logistics/container-loading-calculator/` | Query spans **two intents**: "how many fit" (calculator) and "container stuffing / load plan" (planning guidance). The page serves only the calculator. |
| pallet calculator, palletizing calculator, pallets calculator, pallet layout calculator, ti hi calculator, pallet stack calculator | ~150 | `/logistics/pallet-calculator/` | Strong match, but misses **"TI-HI"** (pallet TI/HI convention) — a distinct, repeatedly-observed query (`pallet ti hi calculator`, `tihi calculator`, `calculate ti hi`, `tihi pallet`). |
| warehouse space utilization, warehouse utilization formula, space utilization formula, cube utilization formula | ~230 | `/guides/warehouse-space-utilization/` | Good topical match. The problem is position (26.46) and zero rich results, not relevance. |

### 3.3 Queries with **no** matching page (content gaps)

Earned impressions with no dedicated target — uncovered demand:

| Query | Impr | Pos | Gap |
|---|---|---|---|
| warehouse storage cost calculator | 17 | 80.18 | No storage-cost tool. Finance calculators exist but none is warehouse-specific. |
| warehouse racking calculator | 9 | 81.11 | No racking / rack-bay calculator. |
| warehouse square footage calculator | 9 | 82.89 | Partially served by warehouse-space-calculator. |
| warehouse dimensions | 6 | 83.67 | No dimensions reference page. |
| how to calculate warehouse capacity | 8 | 76.75 | Instructional; no guide. |
| warehouse capacity calculator | 10 | 67.60 | Partially served. |
| count sheet template, stock count template, counting template, inventory count sheet | ~20 | 10–29 | Served by stock-count-sheet, but query vocabulary ("count sheet") differs from page vocabulary ("Stock Count Sheet"). |
| check digit calculator container | 13 | 36.15 | **No page.** Container check-digit (ISO 6346) is a distinct tool opportunity. |
| inventory forecasting calculator | 4 | 89 | No page. |
| min max inventory calculator | 1 | 91 | No page (overlaps reorder-point). |

### 3.4 Ambiguous / irrelevant queries — **do not chase these**

These match DIXANI by accident and must **not** drive content decisions:

| Query | Impr | Why irrelevant |
|---|---|---|
| `ani dix` | 4 | Brand-name collision (another entity). Not DIXANI demand. |
| `yes`, `yes please`, `نعم` (Arabic "yes") | 4 | Navigational noise / mis-parse. Zero commercial value. |
| `270gsm` | 1 | Paper-weight spec query; unrelated to DIXANI. |
| `perel` | 1 | Unrelated brand. |
| `crane truck container loading` | 13 | Heavy-machinery query; DIXANI's calculator is carton-based, not crane operations. |
| `toll cubic calculator`, `cbm meaning`, `cbm unit`, `1 cbm to kg` | ~10 | Definitional/conversion trivia; weak commercial intent, dominated by dictionary sites. |
| `equipment for conversions` | 1 | Not a DIXANI topic. |
| `restaurant employee hours calculator`, `undertime calculator`, `half day calculator`, `part time hours calculator` | ~6 | Adjacent to working-hours-calculator but HR/roster intent — a different domain. |

### 3.5 Multi-language demand observed but not targeted

Non-English queries appear repeatedly: `cyclisch tellen` (NL), `kalkulator powierzchni magazynowej` (PL), `palettenrechner` (DE), `calculateur palette` (FR), `schema pallettizzazione` (IT), `calcolo piano di carico container` (IT), `dio berechnung` (DE), `konteyner hesaplama` (TR), `pladsberegner lager` (DK), `beregn kubikk for transport` (NO), `eoq 計算` (JA).

**Recommendation: do NOT create translated pages.** Each has 1–8 impressions — far below any threshold that justifies translation and indexation risk. Note it, monitor it, revisit only if any reaches ~50+ impressions.

---

## 4. Content Gaps

### 4.1 Structural gap: rich results are entirely absent

`Search appearance.csv` contains **zero rows**. Across 4,632 impressions the site earned **no** FAQ, breadcrumb, sitelink or app rich results.

Verified in source across all 64 pages:

| Schema type | Pages having it |
|---|---|
| `Article` | 5 |
| `BreadcrumbList` | **8 / 64** |
| `Organization` | 8 |
| `Person` | 5 |
| `WebPage` | 3 |
| `WebSite` | 2 |
| `CollectionPage` | 1 |
| `ImageObject` | 6 |
| **`FAQPage`** | **0 / 64** |
| **`WebApplication` / `SoftwareApplication`** | **0 / 64** |

Two facts make this the highest-value Phase D finding:

1. **53 of 64 pages contain FAQ content** (a "Frequently Asked Questions" heading with question/answer pairs), yet **zero** carry `FAQPage` markup. The content exists and is valid; only the markup is missing.
2. **All calculator/tool pages have no structured data whatsoever.** Verified individually on `pallet-calculator`, `container-loading-calculator`, `warehouse-space-calculator`, `cbm-calculator`, `eoq-calculator`, `dio-calculator`, `safety-stock`, `variance-report`, `cycle-count-planner` — each contains **0** `application/ld+json` blocks.

### 4.2 Content depth vs. intent

| Page | Words | H2s | Assessment |
|---|---|---|---|
| `guides/abc-inventory-analysis` | 2,065 | 15 | Strong. Formula, example, Excel, class ranges, cycle counting, mistakes, review cadence, FAQ. |
| `guides/warehouse-space-utilization` | 1,940 | 15 | Strong. Formula, usable capacity, worked example, why 100% is bad, benchmark, measurement, improvement, FAQ. |
| `guides/investigate-inventory-variances` | 1,751 | 14 | Strong. Causes, worked example, investigation record, adjustment timing, prevention, FAQ. |
| `logistics/container-loading-calculator` | 1,248 | 10 | Good breadth but **no container stuffing / load-plan guidance** and no terminology alignment with observed queries. |
| `logistics/pallet-calculator` | 1,247 | 9 | Good. Example + mistakes + practical considerations. Missing TI-HI terminology. |
| `logistics/warehouse-space-calculator` | 1,234 | 8 | **Weakest relative to demand.** No "how to calculate" step-by-step despite ~200 impressions on exactly that intent. |
| `logistics/cbm-calculator` | 1,052 | 11 | Adequate. Strong container-reference table. |
| `inventory/variance-report` | 1,203 | 8 | Adequate, well-linked, but position 19.58. |
| `templates/inventory/stock-count-sheet` | 1,125 | 8 | Adequate; ranks 11.79 at 1.71% CTR. Deliberately omits system quantity (documented on the page — correct design). |

**The three guides are genuinely well-developed.** They are not thin content. Their problem is SERP presentation (CTR) and technical markup (schema), not substance. This materially reduces risk: they should be **left alone content-wise** and improved only at the metadata/markup layer.

### 4.3 The `<h1>` / title / description situation — verified

An initial automated scan using a single-line regex suggested 48 pages were missing `<h1>`. **That was a tooling error, and the correction matters:**

- All 64 pages **do** contain exactly one `<h1>`.
- All 64 pages **do** have a `<meta name="description">`.
- All 64 pages **do** have `<link rel="canonical">`.

The false positive arose because this site writes meta tags in **attribute-swapped order** (`<meta content="..." name="description">`) and places some `<h1>` tags across multiple lines. Regexes anchored on `name="description"` first, or that cannot span lines, fail on this markup. Recorded here so the trap is not repeated — any future audit must be multiline-aware and attribute-order-agnostic.

Correctly measured per-page state:

| Attribute | Count | Notes |
|---|---|---|
| Has `<h1>` | 64/64 | One per page |
| Has meta description | 64/64 | 140–155 chars typical |
| Has canonical | 64/64 | Self-referencing |
| Has JSON-LD of any kind | 9/64 | 55 pages have none |
| Has `FAQPage` | 0/64 | 53 pages have FAQ *content* |
| Has `WebApplication` | 0/64 | All calculator pages have none |
| Has `BreadcrumbList` | 8/64 | 56 pages have none |

The metadata **exists** — the question is whether titles/descriptions are *aligned to observed query intent*, which is where failure mode B lives.

### 4.4 Gaps **not** present (good news)

- No pagination/parameter index bloat.
- 64 pages, all substantive — no thin doorway pages.
- No inaccessible pages; the single orphan is still reachable via category listing and sitemap.

---

## 5. Internal Linking Opportunities

### 5.1 Link graph — verified inbound counts

Full graph built by resolving every `href="/..."` across all 64 pages against the known route set.

**Orphan (0 inbound contextual links):**

| Page | Impr | Pos | Note |
|---|---|---|---|
| `/categories/finance/simple-interest-calculator/` | 0 in export | — | The **only** orphan. Exists and is in the sitemap, but no other page links to it contextually. |

**Weakly connected (1–2 inbound links):**

| Page | Inbound | Impr | Pos |
|---|---|---|---|
| `/ai-operations-assistant/` | 1 | 3 | 12.00 |
| `/templates/warehouse/packing-list/` | 1 | 0 | — |
| `/simulators/warehouse-shift-challenge/` | 1 | 5 | 15.00 |
| `/categories/finance/compound-interest-calculator/` | 2 | 0 | — |
| `/templates/inventory/reorder-level-tracker/` | 2 | 0 | — |
| `/categories/converters/volumetric-weight-calculator/` | 2 | 0 | — |
| `/templates/purchasing/supplier-evaluation/` | 2 | 0 | — |
| `/categories/business/working-hours-calculator/` | 2 | **201** | **28.83** |
| `/templates/warehouse/picking-list/` | 2 | 42 | 34.64 |

`working-hours-calculator` is the standout: **201 impressions at position 28.83 with only 2 inbound links.** It is earning demand nothing on the site reinforces.

### 5.2 The core structural gap: calculators do not link to guides

Verified body-level (non-nav, non-footer) contextual links per calculator:

| Page | Distinct internal links | Links to a *guide*? |
|---|---|---|
| `pallet-calculator` | 3 | **No** |
| `container-loading-calculator` | 2 | **No** |
| `cbm-calculator` | 2 | **No** |
| `eoq-calculator` | 3 | **No** |
| `dio-calculator` | 3 | **No** |
| `safety-stock` | 3 | **No** |
| `reorder-point` | 3 | **No** |
| `inventory-turnover` | 3 | **No** |
| `warehouse-space-calculator` | 4 | **Yes** (1: warehouse-space-utilization) |
| `variance-report` | 7 | **Yes** (1: investigate-inventory-variances) |
| `cycle-count-planner` | 4 | **Yes** (1: warehouse-cycle-count-checklist) |
| `inventory-accuracy-analyzer` | 4 | **Yes** (3 guides) |

**The linking is one-directional.** Guides link *out* to tools — correctly, and already done well (`warehouse-space-utilization` links to the warehouse space calculator, pallet calculator and cycle-count guide). But 8 of 12 calculators link to **no guide at all**.

This is the highest-value, lowest-risk structural fix available:
- It is **editorially natural** — a pallet calculator genuinely should reference the guide explaining warehouse capacity planning.
- It creates **no new pages**, changes **no URLs**, touches **no formulas**.
- It gives the three strong guides (already ranking 10–26) more internal authority, and gives tools a path to informational support.

Existing anchor-text quality is already good — descriptive, not exact-match spam, e.g. *"Open Warehouse Space Calculator"*, *"Open Pallet Calculator"*, *"Read Cycle Count Guide"*, and related-card `<strong>` + `<small>` pairs such as *"CBM Calculator — Calculate carton and shipment volume."*

**Preserve this pattern**; it is exactly right.

### 5.3 Recommended new internal links

All anchors below are descriptive and natural. **No exact-match repetition, no sitewide insertion, no link added solely to move a metric.** Each is placed where the topic is genuinely discussed.

| From (source) | To (target) | Suggested placement | Rationale |
|---|---|---|---|
| `logistics/pallet-calculator` | `guides/warehouse-space-utilization` | "warehouse space utilization" — in Pallet Planning Considerations | Pallet count directly drives floor space. Natural adjacency. |
| `logistics/container-loading-calculator` | `templates/warehouse/packing-list` | "packing list" — in the pre-loading checks section | A packing list records the CBM this tool estimates. Genuine workflow link to a 1-inbound page. |
| `logistics/cbm-calculator` | `templates/warehouse/packing-list` | "packing list" — in the shipping-workflow section | Same workflow rationale. |
| `logistics/cbm-calculator` | `guides/warehouse-space-utilization` | "warehouse space planning" — in the load-planning section | Ties volume calculation to space planning. |
| `inventory/eoq-calculator` | `templates/purchasing/purchase-order` | "purchase order" — in the ordering section | EOQ output becomes a PO. Strong, natural sequence. |
| `inventory/eoq-calculator` | `guides/abc-inventory-analysis` | "ABC inventory analysis" — in the ordering-cost section | Ordering policy varies by ABC class. |
| `inventory/reorder-point` | `templates/inventory/reorder-level-tracker` | "reorder level tracker" — in the interpretation section | A 2-inbound page that is the direct operational companion. |
| `inventory/safety-stock` | `guides/abc-inventory-analysis` | "ABC inventory analysis" — in the method-selection section | Safety stock policy varies by ABC class. |
| `categories/business/working-hours-calculator` | `simulators/warehouse-shift-challenge` | "warehouse shift challenge" — in the shift-planning section | Only 2 and 1 inbound respectively; naturally related (shift hours). |
| `categories/finance/break-even-calculator` | `categories/business/profit-margin-calculator` | "profit margin" — in the related-metrics section | Both are business-metrics tools; reinforces the finance/business cluster. |
| `categories/finance/compound-interest-calculator` | `categories/finance/simple-interest-calculator` | "simple interest" — in the comparison section | **Resolves the single orphan.** These two are the obvious pair. |

**Verified as already present and to be preserved:** `warehouse-space-calculator` → `guides/warehouse-space-utilization`; `variance-report` → `guides/investigate-inventory-variances`; `cycle-count-planner` → `guides/warehouse-cycle-count-checklist`; `dio-calculator` → `inventory/inventory-turnover`.

**Deliberately excluded:** linking privacy/terms/contact from content; adding links from the homepage to everything; repeating `/logistics/pallet-calculator/` as an exact-match anchor across many pages.

### 5.4 Pages that should NOT receive more links

`index.html` (already the hub), `privacy`, `terms`, `contact`, and the `categories/*` index pages beyond their existing role — adding contextual links here is either irrelevant or creates sitewide-repetition patterns.

---

## 6. Structured Data Recommendations

### 6.1 Guiding principle

Only markup **claims that are visible on the page and verifiable**. No reviews, no ratings, no invented authors, no fabricated dates, no aggregateRating on tools that have no rated reviews.

### 6.2 Recommended additions, by type and confidence

**Tier 1 — `BreadcrumbList` (56 pages missing it). Highest confidence, lowest risk.**

The site already demonstrates the correct pattern on 8 pages (e.g. `inventory/inventory-accuracy-analyzer`, `inventory-control-toolkit`). Extending it to all remaining pages:
- Is purely navigational markup, **not a ranking claim**.
- Reflects a hierarchy that **genuinely exists** in the URL structure (`/templates/inventory/stock-count-sheet/` → Templates → Inventory → Stock Count Sheet).
- Carries **no risk of a false claim** — there is nothing to fabricate.
- The existing 8 schemas prove the pattern is already accepted by the codebase.

Recommended for: all 56 pages lacking it, generated from the existing route/folder structure already used by `build-search-index.mjs`'s `classify()` function.

**Tier 2 — `WebApplication` for the calculator/tool pages. High confidence, low risk.**

These pages *are* web applications — interactive calculators. Recommended properties, all directly supportable:

```
@type: WebApplication
name: <the page's actual H1/title>
url: <the page's canonical URL>
applicationCategory: BusinessApplication   (or UtilitiesApplication for converters)
operatingSystem: "Any (web browser)"       (truthful — it is a web page)
isAccessibleForFree: true
offers:
  @type: Offer
  price: "0"
  priceCurrency: "USD"                      (truthful — the tools are free and the page says so)
description: <the page's own meta description>
```

**Explicitly excluded — do NOT add:**
- `aggregateRating` / `review` — there are no reviews. Adding these would be fabrication.
- `softwareVersion`, `datePublished`, `dateModified` — no reliable values exist in-page.
- `author` / `creator` on tools unless the visible page names one. (The three guides **do** visibly name "Dinesh Madushanka", which is why the existing `Person`/`Article` markup on those guides is legitimate — **leave it exactly as is**.)
- `offers.availability` or `priceValidUntil` — not applicable to permanently free web tools.

Recommended for: `pallet-calculator`, `container-loading-calculator`, `warehouse-space-calculator`, `cbm-calculator`, `eoq-calculator`, `dio-calculator`, `safety-stock`, `reorder-point`, `inventory-turnover`, `cycle-count-planner`, `inventory-accuracy-analyzer`, `variance-report`, `unit-converter`, `volumetric-weight-calculator`, `markup-calculator`, `profit-margin-calculator`, `working-hours-calculator`, `break-even-calculator`, `compound-interest-calculator`, `discount-calculator`, `loan-payment-calculator`, `simple-interest-calculator`, `vat-calculator`.

**Tier 3 — `FAQPage` on pages that actually show FAQ content. Requires review — see caveat.**

**Caveat that must not be glossed over:** Google restricted FAQ rich results in 2023 to a narrow set of authoritative government and health sites. For DIXANI, `FAQPage` markup will **very likely produce no visible rich result**, and `Search appearance.csv` being empty is consistent with that.

Therefore the honest justification for adding it is **semantic clarity and machine-readability, not rich-result acquisition**. It should be treated as P2-B (review), not P2-A, and must **never** be added speculatively:
- Only on pages where the FAQ questions and answers are **already visible** (53 pages qualify).
- Markup must **exactly mirror** the visible text — no paraphrasing to fit.
- **Do not** add FAQPage markup to pages with no FAQ section (e.g. `privacy`, `terms`, `contact`, `about`, `index.html`, and the category/template index pages).

**Tier 4 — NOT recommended at this time**

- `HowTo` — Google also deprecated HowTo rich results. The guides are instructional, but adding HowTo yields no benefit and risks markup/content drift. **Skip.**
- `Product` — templates are free downloads, not products with price/shipping. **Skip.**
- `Course` / `Event` / `JobPosting` — no such content exists. **Skip.**
- `Organization` on the homepage already exists (with `ImageObject`, `WebSite`) — **leave as is**.

### 6.3 Duplication and conflict check

Verified: no page currently contains two conflicting definitions of the same entity. The 9 pages with existing JSON-LD use distinct top-level objects.

Two specific risks to manage when adding schema:
1. **Homepage already has `Organization` + `WebSite` + `ImageObject`.** Do not add a second `Organization` block. Any new homepage schema must merge into the existing graph. (**Recommendation: skip the homepage entirely.**)
2. **The 5 guide pages already have `Article` + `BreadcrumbList` + `Person`.** Adding BreadcrumbList again would duplicate an existing type. Those 5 must be **excluded** from the Tier 1 bulk breadcrumb work.

So the Tier 1 target is **exactly 56 pages** — the 64 total, minus the 5 guides that already have breadcrumbs, minus the 3 other pages that also already carry it (`inventory/inventory-accuracy-analyzer`, `inventory-control-toolkit`, `simulators/warehouse-shift-challenge`), minus the homepage.

### 6.4 Validation requirements

Every added block must be:
- Valid JSON (parse-checked in CI, not by eye).
- Validated against schema.org vocabulary and Google's Rich Results Test before commit.
- Free of `address`, `telephone`, `email` or `price` claims not visible on the page.
- Checked for balance — one JSON-LD `<script>` per logical entity, correct escaping of `&`, `<`, `>` in text values.

---

## 7. Prioritized Implementation Stages

### 7.1 P2-A — High-confidence, low-risk

| # | Change | Affected URL(s) | Supporting GSC evidence | Intent | Expected qualitative impact | Difficulty | SEO risk |
|---|---|---|---|---|---|---|---|
| A1 | Add `BreadcrumbList` JSON-LD to 56 pages without it | 56 pages (excl. 5 guides + 3 others + homepage) | `Search appearance.csv` empty; only 8/64 currently marked up | Navigational clarity | Improved machine understanding of hierarchy; eligibility for breadcrumb display | Low–Med | **Very low** — reflects real structure, no claims |
| A2 | Add `WebApplication` JSON-LD to calculator pages | 23 tool/calculator URLs | 0/64 pages have any tool schema | Tool identity | Clearer entity classification for tools | Low | **Very low** — `price: 0` is true and visible |
| A3 | Strengthen internal links from 8 calculators to relevant guides | ~11 link insertions across 11 files | Calculators rank 46–58; guides rank 10–26 with no reciprocal support | Topical reinforcement | Better crawl paths, stronger guide authority | Low | **Very low** — natural editorial links, no URL change |
| A4 | Resolve orphan `simple-interest-calculator` | `/categories/finance/compound-interest-calculator/` + 1 link | Only orphan in the graph | Discovery | Page becomes contextually reachable | Low | **Very low** |
| A5 | Strengthen `working-hours-calculator` linkage | 2–3 links from shift/simulator pages | 201 impr, pos 28.83, 0 clicks, only 2 inbound | Relevance for a high-demand page | More internal authority to a page already earning demand | Low | **Very low** |
| A6 | Align titles/descriptions on the 4 "failure mode B" pages (pos 5–20, CTR <1%) | `investigate-inventory-variances`, `abc-inventory-analysis`, `stock-count-sheet`, `variance-report` | 276/246/234/156 impr at pos 10.13/10.79/11.79/19.58 with 0.36%/0.81%/1.71%/0.64% CTR | Match SERP snippet to query phrasing already demonstrated | **Highest expected click gain.** Rank is already achieved; only the snippet fails | Low | **Low–Med** — titles rank, so changes must be surgical and reversible. See §7.4 |

### 7.2 P2-B — Content changes requiring review

| # | Change | Affected URL(s) | Evidence | Intent | Expected impact | Difficulty | Risk |
|---|---|---|---|---|---|---|---|
| B1 | Add a step-by-step "How to calculate warehouse space" section + worked example | `/logistics/warehouse-space-calculator/` | ~200 cluster impr on "how to calculate warehouse space" at pos 76–85; 644 impr, 0 clicks | Instructional, currently unserved | Closes the clearest intent mismatch on the highest-volume cluster | Med | **Med** — 1,234-word page; must add, not replace |
| B2 | Add container-stuffing / load-planning guidance + terminology | `/logistics/container-loading-calculator/` | "container stuffing calculator", "container loading plan", "cargo stuffing calculator" ≈ 73 cluster impr | Planning guidance | Aligns page to observed vocabulary without keyword stuffing | Med | **Med** — 1,248 words, 745 impr; additive only |
| B3 | Add TI-HI (pallet TI/HI) explanation to pallet calculator | `/logistics/pallet-calculator/` | `ti hi calculator`, `pallet ti hi calculator`, `tihi calculator`, `calculate ti hi` ≈ 14 impr | Terminology gap | Captures a distinct convention the page does not mention | Low–Med | **Low** — additive |
| B4 | Add `FAQPage` JSON-LD mirroring visible FAQ text | Up to 53 pages (see §6.3) | 53/64 pages show FAQ content; 0 marked up | Semantic clarity | **Not expected to yield rich results** (Google restriction). Machine-readable Q&A | Med | **Med** — must mirror text exactly; drift = invalid markup |
| B5 | Add "count sheet" / "inventory count sheet" phrasing to the stock count page | `/templates/inventory/stock-count-sheet/` | `count sheet template`, `inventory count sheet`, `stock counting sheet`, `physical inventory count sheet` ≈ 20 impr | Vocabulary alignment | Small, targeted relevance gain | Low | **Low** — do not disturb the 1.71% CTR title |

### 7.3 P2-C — Longer-term / new tools

Presented as **ideas with evidence**, not commitments. Each needs a separate cost/benefit review.

| # | Idea | Evidence (impressions with no page) | Notes |
|---|---|---|---|
| C1 | Warehouse storage cost calculator | `warehouse storage cost calculator` 17 @ 80.18; `how to calculate warehouse storage costs` 1 | No warehouse-specific cost tool exists; finance calculators are generic |
| C2 | Warehouse racking / rack-bay calculator | `warehouse racking calculator` 9 @ 81.11; `warehouse capacity calculator` 10 @ 67.60; `warehouse rack space calculator` 3 | Natural companion to warehouse-space-calculator |
| C3 | Container check-digit (ISO 6346) calculator | `check digit calculator container` 13 @ 36.15; `check digit container calculator` 13 @ 38.62 | Distinct, well-defined, low-competition utility |
| C4 | Storage/space utilization analytics content | `warehouse space utilization analytics` 5; `factory space utilization monitoring` 4; `warehouse space utilization monitoring` 6 | Extends the warehouse-space-utilization guide; overlaps C2 |
| C5 | How-to-calculate-warehouse-capacity guide | `how to calculate warehouse capacity` 8 @ 76.75; `how to calculate storage space in warehouse` 3; `how to calculate warehouse capacity in mt` 1 | Could instead be a section (B1) — **prefer B1 first** |
| C6 | Multi-language versions | 1–8 impr per non-English query across ~10 languages | **Deferred.** Insufficient demand; indexation risk outweighs benefit |

### 7.4 Constraint on P2-A item A6 — protecting what already ranks

The four A6 pages **already rank at positions 10.13–19.58.** Rewriting their titles risks losing that rank. Therefore:

- Change **only** the wording; keep the `<title>` and intent topically identical to current.
- Change **one page at a time**, observe for no less than 14 days before altering the next.
- **Never** shorten purely to hit a character count. Several current titles are already 59–66 characters (e.g. `Free Stock Count Sheet Template – Excel & PDF | DIXANI` at 60) and they **work** — that page has the best content CTR on the site.
- The `stock-count-sheet` title specifically **should be left essentially untouched**. At 1.71% CTR it is the best-performing content page; the gain there is elsewhere.
- Priority for A6 is therefore: `investigate-inventory-variances` (0.36%) and `abc-inventory-analysis` (0.81%) first.

---

## 8. Exact Files Likely to Change

### 8.1 P2-A

**A1 — BreadcrumbList.** One JSON-LD insert per file. Target: the **56** `*/index.html` files that lack breadcrumbs. **Exclude** the 8 that already carry it (`guides/abc-inventory-analysis`, `guides/inventory-accuracy-percentage`, `guides/investigate-inventory-variances`, `guides/warehouse-cycle-count-checklist`, `guides/warehouse-space-utilization`, `inventory/inventory-accuracy-analyzer`, `inventory-control-toolkit`, `simulators/warehouse-shift-challenge`) and the homepage (breadcrumbs are meaningless there).

**A2 — WebApplication (23 files):**
```
categories/business/markup-calculator/index.html
categories/business/profit-margin-calculator/index.html
categories/business/working-hours-calculator/index.html
categories/converters/unit-converter/index.html
categories/converters/volumetric-weight-calculator/index.html
categories/finance/break-even-calculator/index.html
categories/finance/compound-interest-calculator/index.html
categories/finance/discount-calculator/index.html
categories/finance/loan-payment-calculator/index.html
categories/finance/simple-interest-calculator/index.html
categories/finance/vat-calculator/index.html
inventory/cycle-count-planner/index.html
inventory/dio-calculator/index.html
inventory/eoq-calculator/index.html
inventory/inventory-accuracy-analyzer/index.html
inventory/inventory-turnover/index.html
inventory/reorder-point/index.html
inventory/safety-stock/index.html
inventory/variance-report/index.html
logistics/cbm-calculator/index.html
logistics/container-loading-calculator/index.html
logistics/pallet-calculator/index.html
logistics/warehouse-space-calculator/index.html
```

**A3 / A4 / A5 — Internal links (11 source files):**
```
logistics/pallet-calculator/index.html
logistics/container-loading-calculator/index.html
logistics/cbm-calculator/index.html
inventory/eoq-calculator/index.html
inventory/reorder-point/index.html
inventory/safety-stock/index.html
categories/business/working-hours-calculator/index.html
categories/finance/break-even-calculator/index.html
categories/finance/compound-interest-calculator/index.html
simulators/warehouse-shift-challenge/index.html
logistics/warehouse-space-calculator/index.html      (verify existing guide link is preserved)
```
Targets only (no edits needed unless a reciprocal link is later added): `templates/warehouse/packing-list`, `templates/inventory/reorder-level-tracker`, `templates/purchasing/purchase-order`, `guides/abc-inventory-analysis`.

**A6 — Titles/descriptions (2 files initially):**
```
guides/investigate-inventory-variances/index.html
guides/abc-inventory-analysis/index.html
```

### 8.2 P2-B
```
logistics/warehouse-space-calculator/index.html     (B1)
logistics/container-loading-calculator/index.html   (B2)
logistics/pallet-calculator/index.html              (B3)
templates/inventory/stock-count-sheet/index.html    (B5)
+ up to 53 index.html files                            (B4, if approved)
```

### 8.3 Tooling files — **only if** a schema generator is built

```
tests/build-schema.mjs           (new — would mirror build-search-index.mjs conventions)
tests/schema.test.mjs            (new — JSON validity + claim-safety assertions)
```

**Recommendation:** generate schema from a single tested script rather than hand-editing 56–79 files. This mirrors the already-proven `build-search-index.mjs` approach, keeps it idempotent, and makes the work reviewable in one diff and reversible in one command.

### 8.4 Files that must **not** change

```
assets/js/*.js                  — no calculator formula may be altered
assets/css/*.css
sitemap.xml, robots.txt         — no URL changes
any analytics/gtag identifiers  — per the safety rules
any canonical URL
any existing H2 or paragraph on pages receiving B1–B3 additions
```

### 8.5 ⚠ Deployment-order dependency (unchanged and critical)

`assets/js/search-index.js` is **generated from each page's `<title>` and `<meta name="description">`**. Verified directly in `tests/build-search-index.mjs` lines 74–77: it reads `<title>` and `name="description"` from every page.

**Consequence:** any change to a title or description (i.e. **all of A6 and B5**) changes `search-index.js` bytes, which changes its cache-busting hash. The established order must be followed exactly:

```powershell
node tests/build-search-index.mjs
node tests/build-cache-versions.mjs
node tests/build-cache-versions.mjs --check
node --test tests/*.test.mjs
```

This confirms the P1 cache-versioning design remains correct: `build-cache-versions.mjs` is invoked *after* the index rebuild, so the emitted `?v=` hash always matches the final bytes.

---

## 9. Risks and Validation Checklist

### 9.1 Risks

| # | Risk | Severity | Mitigation |
|---|---|---|---|
| R1 | Title rewrite on a page at position 10 drops it out of page 1 | **High** | One page at a time; 14-day observation; change wording only, keep intent; leave `stock-count-sheet` title untouched |
| R2 | Schema markup claims something not visible on the page | **High** | Only `price: 0`, `isAccessibleForFree`, `applicationCategory`, `name`, `url`, `description` — all directly verifiable. No ratings, no reviews, no authors except where visibly named |
| R3 | FAQPage markup drifts from visible text after a content edit | Med | Generate markup from the rendered FAQ text; add a test asserting each Q/A pair appears verbatim in the HTML |
| R4 | Duplicate/conflicting schema added to the 9 already-marked pages | Med | Explicit exclusion list (§6.3); merge, never append to the homepage `Organization`/`WebSite` |
| R5 | Internal-link additions become sitewide repetition | Med | Each link placed once, in a section that genuinely discusses the target; no footer/nav additions |
| R6 | Adding content (B1–B3) dilutes an already-working page | Med | Add new sections only; preserve every existing H2 and all existing copy; never rewrite the three strong guides |
| R7 | Multi-language content triggers index bloat | Med | **Do not create translated pages.** Explicitly deferred |
| R8 | Title/description edits change `search-index.js`, breaking cache consistency | Med | Follow the mandatory rebuild order (§8.5) |
| R9 | P2 gain expected too quickly | Med | GSC data is a 42-day window with volatile positions (12.8–44.5 daily swing). Allow 4–6 weeks before judging |
| R10 | Chasing irrelevant queries inflates effort | Low–Med | §3.4 list is explicitly excluded from all recommendations |

### 9.2 Validation checklist (run before any commit)

**Repository safety**
- [ ] `git status` checked before starting; unrelated work preserved
- [ ] No file committed that isn't in the §8 change list
- [ ] `reports/` handled deliberately (currently untracked)

**URL and content integrity**
- [ ] No published URL changed (all 64 routes intact)
- [ ] No calculator formula edited — diff of `assets/js/*.js` shows only `search-index.js`
- [ ] No calculator, template or guide removed
- [ ] No analytics identifier modified
- [ ] Every existing H2 and paragraph on B1–B3 pages still present

**Structured data**
- [ ] Every JSON-LD block parses as valid JSON (`JSON.parse` in a test, not by eye)
- [ ] Zero `aggregateRating`, `review`, `ratingValue`, `reviewCount` anywhere
- [ ] Zero fabricated `datePublished` / `dateModified` / `author`
- [ ] Zero `FAQPage` on pages without a visible FAQ section
- [ ] No duplicate `Organization` / `WebSite` on the homepage
- [ ] No duplicate `BreadcrumbList` on the 8 pages that already have it
- [ ] Every FAQ Q/A pair in markup exists verbatim in the visible HTML
- [ ] Rich Results Test passes on a sample of 3 pages (1 guide, 1 calculator, 1 template)

**Internal links**
- [ ] Every new `href` resolves to an existing `index.html` (link validation script)
- [ ] `simple-interest-calculator` now has ≥1 inbound contextual link
- [ ] No anchor text repeated across more than 2–3 pages
- [ ] No link added to `privacy`, `terms` or `contact` from content

**Build order (mandatory)**
- [ ] `node tests/build-search-index.mjs`
- [ ] `node tests/build-cache-versions.mjs`
- [ ] `node tests/build-cache-versions.mjs --check` → exits 0
- [ ] `node --test tests/*.test.mjs` → all pass (49 currently, plus any new)
- [ ] existing audit / link-validation scripts (if present)
- [ ] `git diff --cached --check` → exit 0

**Post-deploy observation**
- [ ] Re-export GSC after 14 days; compare the same four pages page-by-page
- [ ] Check whether `Search appearance.csv` is still empty
- [ ] Confirm no page's position regressed by more than ~5 places
- [ ] Confirm sitewide impressions did not drop

### 9.3 What this plan deliberately does not do

- Does not invent traffic, CPC, keyword difficulty or ranking projections.
- Does not touch the three strong guides beyond metadata and schema — they are already 1,750–2,065 words and well structured.
- Does not create translated pages.
- Does not create mass-generated SEO content.
- Does not add links solely to move a metric.
- Does not add FAQPage markup purely to chase rich results, and states plainly that it likely won't produce any.
- Does not change any URL, formula, analytics identifier or working tool.

---

## 10. Summary of Findings

1. **The sitewide CTR of 0.45% is the headline problem**, not raw impressions. 4,632 impressions produced 21 clicks.
2. **Two distinct failure modes exist and need opposite fixes** (§2.1): four high-impression pages lose everything on *ranking* (positions 46–59); four page-1 pages lose everything on *snippet presentation* (CTR 0.36–1.71% at positions 10–20). Treating them alike wastes effort.
3. **`Search appearance.csv` is empty, and correctly so**: 0/64 pages have FAQPage markup, 0/64 calculator pages have any tool schema, and only 8/64 have BreadcrumbList. Meanwhile 53/64 pages already contain legitimate FAQ content. This is the single largest safe, evidence-backed gap.
4. **Mobile outranks desktop by 25 positions** (16.27 vs 41.04) and desktop holds 81% of impressions — an asymmetry worth understanding before any content spend.
5. **The United States is 1,435 impressions and zero clicks** at position 43.05. The site is not yet competitive in its largest market.
6. **Internal linking is one-directional**: guides link down to tools, but 8 of 12 calculators link to no guide at all. `simple-interest-calculator` is a true orphan; `working-hours-calculator` has 201 impressions and only 2 inbound links.
7. **A corrected audit note:** all 64 pages already have `<h1>`, meta description and canonical. An earlier single-line-regex scan produced false positives because this site uses attribute-swapped meta tags and multi-line H1s. Any future audit must be multiline-aware.
8. **The safest high-value work is markup, not prose** — schema and internal links change no copy, no URL and no formula, and carry very low risk, whereas rewriting keyword-bearing titles that already rank at position 10 carries real downside.

### Recommended first move

Approve **P2-A** only, starting with **A1 + A2** (schema generation, which touches no visible content and no ranking-bearing element), then **A3 + A4** (internal links), then **A6 on the two lowest-CTR pages** (`investigate-inventory-variances`, `abc-inventory-analysis`) one at a time with 14-day observation.

**P2-B and P2-C remain proposals pending a separate review.**

---

## 11. Data Provenance

| Item | Path / value |
|---|---|
| Source archive | `C:\Users\DELL\Downloads\dixani.com-Performance-on-Search-2026-10-16.zip` |
| Extracted to (temporary, outside the repo) | `_gsc_tmp/` — excluded from version control and deleted after analysis |
| Repository state inspected at | `HEAD 741004b` — "Add automated JavaScript cache versioning" |
| Working tree at analysis time | Clean, other than untracked `reports/` |

**END OF ANALYSIS — nothing implemented, committed, pushed or deployed.**
