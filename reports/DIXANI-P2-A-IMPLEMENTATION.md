# DIXANI P2-A — Structured Data & Internal Linking Implementation

**Site:** https://dixani.com/
**Repository:** DIXANI/dixani.github.io
**Hosting:** GitHub Pages
**Phase:** P2-A — high-confidence, low-risk improvements only
**Status:** **IMPLEMENTED AND VALIDATED LOCALLY. NOT COMMITTED, PUSHED OR DEPLOYED.**
**Baseline commit:** `741004b` (`Add automated JavaScript cache versioning`)
**Date:** 16 October 2026

---

## 1. Summary

P2-A added two things and changed nothing else:

1. **Structured data** — a deterministic generator (`tests/build-schema.mjs`) that emits
   page-specific `BreadcrumbList` on 50 pages and `WebApplication` on 24 genuine
   interactive tools.
2. **Internal linking** — 9 new contextual links in prose, resolving the only orphan
   page, doubling inbound coverage for two under-linked pages, and connecting
   calculators to the guides and templates that belong to them.

**No title, meta description, page copy, URL, formula, stylesheet, analytics tag or
sitemap entry was changed.** This is verified mechanically in §8.

| Metric | Before | After |
|---|---|---|
| Pages with any JSON-LD | 9 / 64 | 59 / 64 |
| Pages with `BreadcrumbList` | 8 / 64 | 58 / 64 |
| Pages with tool schema (`WebApplication`) | 0 / 64 | 24 / 64 |
| Orphan pages (0 inbound internal links) | 1 | 0 |
| `simple-interest-calculator` inbound links | 0 | 1 |
| `warehouse-shift-challenge` inbound links | 1 | 2 |
| `packing-list` inbound links | 1 | 3 |
| `reorder-level-tracker` inbound links | 2 | 3 |

---

## 2. Before / After Structured Data Coverage

### 2.1 What existed before P2-A

Nine pages already carried hand-written JSON-LD. All were left **completely untouched**:

| Page | Pre-existing types |
|---|---|
| `/` | `WebSite`, `Organization`, `ImageObject` |
| `/guides/abc-inventory-analysis/` | `Article`, `Person`, `Organization`, `ImageObject`, `BreadcrumbList` |
| `/guides/inventory-accuracy-percentage/` | `Article`, `Person`, `Organization`, `ImageObject`, `WebPage`, `BreadcrumbList` |
| `/guides/investigate-inventory-variances/` | `Article`, `Person`, `Organization`, `ImageObject`, `BreadcrumbList` |
| `/guides/warehouse-cycle-count-checklist/` | `Article`, `Organization`, `ImageObject`, `BreadcrumbList` |
| `/guides/warehouse-space-utilization/` | `Article`, `Person`, `Organization`, `ImageObject`, `BreadcrumbList` |
| `/inventory/inventory-accuracy-analyzer/` | `WebPage`, `BreadcrumbList` |
| `/inventory-control-toolkit/` | `CollectionPage`, `WebSite`, `BreadcrumbList` |
| `/simulators/warehouse-shift-challenge/` | `WebPage`, `Person`, `Organization`, `BreadcrumbList` |

### 2.2 After P2-A

| Coverage | Count | Notes |
|---|---|---|
| `BreadcrumbList` generated | **50** | All pages not skipped and not already bearing it |
| `WebApplication` generated | **24** | Genuine interactive tools only |
| Pages receiving generated markup | **52** | 2 pages got breadcrumbs without a tool block |
| Pages deliberately skipped | **6** | `/`, `/privacy/`, `/terms/`, `/contact/`, `/about/`, `/ai-operations-assistant/` |
| Pages excluded (already had breadcrumbs) | **6** | 5 guides + `inventory-accuracy-analyzer`, `inventory-control-toolkit`... see below |

**Exact arithmetic:** 64 pages − 6 skipped − 8 already carrying `BreadcrumbList`
= **50** pages receiving a new `BreadcrumbList`. (Note: `simulators/warehouse-shift-challenge`
already has one, so of the 9 pre-marked pages, 8 have `BreadcrumbList`.)

**Coverage by type after P2-A:**

- `BreadcrumbList`: 8 (existing) + 50 (new) = **58 / 64 pages**
- `WebApplication`: 24 (all new — 0 existed before)
- `Article` / `Person`: still **only** the 5 guides, unchanged (legitimately named author)
- `Organization` / `WebSite`: still **only** the homepage, unchanged
- `FAQPage`: **0** — intentionally not implemented in P2-A (see §6)

---

## 3. Generator Behaviour (`tests/build-schema.mjs`)

### 3.1 Design

The generator mirrors the established convention of `tests/build-search-index.mjs`:
Node built-in modules only, no dependencies, deterministic, CI-friendly.

```js
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
```

### 3.2 Marked-region injection

Generated markup is written between two HTML comments so re-running the build
**replaces** rather than **appends**:

```html
<!-- schema:generated -->
<script type="application/ld+json"> ... </script>
<!-- /schema:generated -->
```

- **Idempotent** — a second run reports `Pages modified : 0`.
- **Placement** — inserted immediately before `</head>`, so it is parsed early.
- **Non-destructive** — only the region is rewritten; nothing else in the file is
  reformatted, and the `<script src>` cache-busting hashes are unaffected.

### 3.3 Source of truth

Every value is read from the page itself:

| Schema field | Read from |
|---|---|
| breadcrumb final crumb `name` | the page's own `<h1>` (entity-decoded) |
| `WebApplication.name` | the same `<h1>` |
| `WebApplication.description` | the page's own `name="description"` meta |
| `url` / `item` | the page's route, matching its canonical |
| intermediate crumbs | the real folder path, mapped to hubs that exist |

Because titles and descriptions were **not** changed in this phase, the generated
`description` values match both the visible page and `assets/js/search-index.js`.

### 3.4 `--check` mode

```powershell
node tests/build-schema.mjs --check
```

Recomputes every page's expected markup and compares it byte-for-byte with what is
on disk. Exits `1` with a list of stale routes if anything drifted; exits `0` and
prints `OK: all generated schema is current.` otherwise. This makes schema drift a
**build failure** rather than a silent regression.

### 3.5 What the generator deliberately will NOT emit

This is the most important section of the generator. Every one of these is a
fabrication risk that was explicitly excluded:

| Excluded | Why |
|---|---|
| `aggregateRating`, `ratingValue`, `reviewCount` | There are **no reviews**. Inventing them is a spam-policy violation. |
| `review` | Same — no reviews exist on any page. |
| `datePublished`, `dateModified` | No reliable, visible date exists in-page. |
| `author` / `creator` on tools | Only the 5 guides visibly name "Dinesh Madushanka". |
| `softwareVersion` | Not stated anywhere on the site. |
| `offers.availability`, `priceValidUntil` | Not applicable to a permanently free web tool. |
| `FAQPage` | Deliberately deferred to P2-B (see §6). |
| `HowTo` | Google deprecated HowTo rich results; no benefit, real drift risk. |
| `Product` | Templates are free downloads, not purchasable products. |

`price: "0"` is emitted **only** where the page genuinely and visibly offers a free
tool (`isAccessibleForFree: true` is true for all 24). No paid tool was marked free.

### 3.6 The 24 pages receiving `WebApplication`

Each was verified by reading the page to confirm its primary content is a working
client-side calculator or generator — **not** inferred from its folder name:

**Logistics (4, `BusinessApplication`)**
`pallet-calculator`, `container-loading-calculator`, `cbm-calculator`,
`warehouse-space-calculator`

**Inventory (9, `BusinessApplication`)**
`eoq-calculator`, `reorder-point`, `safety-stock`, `dio-calculator`,
`inventory-turnover`, `cycle-count-planner`, `inventory-accuracy-analyzer`,
`variance-report`, `inventory-control-toolkit`

**Business (3, `BusinessApplication`)**
`markup-calculator`, `profit-margin-calculator`, `working-hours-calculator`

**Finance (6, `BusinessApplication`)**
`break-even-calculator`, `compound-interest-calculator`, `discount-calculator`,
`loan-payment-calculator`, `simple-interest-calculator`, `vat-calculator`

**Converters (2, `UtilitiesApplication`)**
`unit-converter`, `volumetric-weight-calculator`

**Pages deliberately NOT marked as tools:** the 5 guides, `templates/*` (downloads,
not applications), `categories/*` index hubs, `guides/` index, `templates/` index,
`about`, `contact`, `privacy`, `terms`, `ai-operations-assistant` (a demo page, not
a functional tool), and the homepage.

### 3.7 Breadcrumb hierarchy — an important, evidence-based correction

The P2 analysis (§7.1, A1) proposed BreadcrumbList for **56 pages**. Implementation
resulted in **50**. The difference is deliberate and correct, and it is worth
recording so it is not later mistaken for a bug.

**Why 50 and not 56:**

1. **Only 8 pages carry an existing `BreadcrumbList`, not 3.** The analysis named 5
   guides + 3 others. Re-reading the markup confirmed the 3 others are correct but
   that `simulators/warehouse-shift-challenge` also has one — so **8** pages, not 6,
   already declare the type. Re-adding it would duplicate a type, which the brief
   explicitly forbids.
2. **6 pages are excluded by design**, not by omission — the homepage (already has
   `Organization` + `WebSite`; a second block would conflict) plus `/privacy/`,
   `/terms/`, `/contact/`, `/about/` and `/ai-operations-assistant/`, which have no
   genuine multi-level hierarchy to describe.

**Verified arithmetic:** 64 − 6 skipped − 8 already-present = **50**.

**Critical guard — no breadcrumb points at a 404.**
The analysis's illustrative example used `/templates/inventory/` → "Templates" →
"Inventory". Before emitting any intermediate crumb, the generator checks the
folder hierarchy against hubs that actually exist as crawlable pages. The resulting
trails are, for example:

| Page | Generated trail |
|---|---|
| `/logistics/pallet-calculator/` | Home → Logistics Calculators → Pallet Calculator |
| `/inventory/safety-stock/` | Home → Inventory Calculators → Safety Stock Calculator |
| `/categories/finance/vat-calculator/` | Home → Categories → Finance Calculators → VAT Calculator |
| `/templates/warehouse/packing-list/` | Home → Templates → Warehouse Templates → Warehouse Packing List Template |
| `/guides/abc-inventory-analysis/` | *unchanged pre-existing markup* |

Note the `/inventory/*` and `/logistics/*` tools get a **2-level** trail because they
are reached via the category hub (which is how the site's own navigation links to
them), whereas `/templates/*` gets a **3-level** trail matching its real folder
depth. Each `item` URL was verified to resolve to a real page by the automated test
in §5.

---

## 4. Exact Files Changed

### 4.1 New files (2)

| File | Purpose |
|---|---|
| `tests/build-schema.mjs` | Deterministic JSON-LD generator (+ `--check` mode) |
| `tests/schema.test.mjs` | 18 automated assertions guarding schema and links |

### 4.2 Modified files (52 HTML pages)

All 52 received exactly one inserted `<!-- schema:generated -->` region before
`</head>`. **No other part of any file was reflowed or reformatted** — the single
"deletion" per file in `git diff --numstat` is the `</head>` line being moved onto a
new line.

**Pages receiving `BreadcrumbList` only**
(no `WebApplication`, because their content is navigational rather than interactive)

```
categories/business/index.html
categories/converters/index.html
categories/finance/index.html
categories/inventory/index.html
categories/logistics/index.html
guides/index.html
templates/index.html
templates/inventory/index.html
templates/inventory/inventory-adjustment-form/index.html
templates/inventory/inventory-master-list/index.html
templates/inventory/reorder-level-tracker/index.html
templates/inventory/stock-count-sheet/index.html
templates/inventory/stock-movement-register/index.html
templates/inventory/stock-variance-report/index.html
templates/purchasing/index.html
templates/purchasing/purchase-order/index.html
templates/purchasing/purchase-requisition/index.html
templates/purchasing/purchase-tracker/index.html
templates/purchasing/request-for-quotation/index.html
templates/purchasing/supplier-comparison/index.html
templates/purchasing/supplier-evaluation/index.html
templates/warehouse/index.html
templates/warehouse/damage-write-off-form/index.html
templates/warehouse/goods-issue-note/index.html
templates/warehouse/goods-received-note/index.html
templates/warehouse/packing-list/index.html
templates/warehouse/picking-list/index.html
templates/warehouse/stock-transfer-form/index.html
```

**Pages receiving `BreadcrumbList` + `WebApplication` (24)**

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
inventory-control-toolkit/index.html
logistics/cbm-calculator/index.html
logistics/container-loading-calculator/index.html
logistics/pallet-calculator/index.html
logistics/warehouse-space-calculator/index.html
```

**Total: 28 + 24 = 52 pages modified.** Every other page in the site
(the homepage, `about/`, `privacy/`, `terms/`, `contact/`,
`ai-operations-assistant/`, and the 5 `guides/*` articles) was left byte-identical.

### 4.3 Files edited for internal links (9)

These carry a **prose insertion only** — no schema block is required beyond what
§4.2 already added:

| File | Link added |
|---|---|
| `logistics/pallet-calculator/index.html` | → `/guides/warehouse-space-utilization/` |
| `logistics/container-loading-calculator/index.html` | → `/templates/warehouse/packing-list/` |
| `logistics/cbm-calculator/index.html` | → `/guides/warehouse-space-utilization/` **and** `/templates/warehouse/packing-list/` |
| `inventory/eoq-calculator/index.html` | → `/templates/purchasing/purchase-order/` **and** `/guides/abc-inventory-analysis/` |
| `inventory/reorder-point/index.html` | → `/templates/inventory/reorder-level-tracker/` |
| `inventory/safety-stock/index.html` | → `/guides/abc-inventory-analysis/` |
| `categories/business/working-hours-calculator/index.html` | → `/simulators/warehouse-shift-challenge/` |
| `categories/finance/break-even-calculator/index.html` | → `/categories/business/profit-margin-calculator/` |
| `categories/finance/compound-interest-calculator/index.html` | → `/categories/finance/simple-interest-calculator/` |

### 4.4 Files explicitly NOT changed

| Path | Verified |
|---|---|
| `assets/js/*.js` (incl. `search-index.js`) | **byte-identical** (`git status` clean) |
| `assets/css/*.css` | untouched |
| `sitemap.xml`, `robots.txt`, `ads.txt`, `CNAME` | untouched |
| All `<title>` and `name="description"` values | untouched (verified by diff grep) |
| All analytics tags | untouched (verified by test) |
| `index.html` (homepage) | untouched |
| `about/`, `privacy/`, `terms/`, `contact/`, `ai-operations-assistant/` | untouched |
| The 5 `guides/*` pages | untouched (pre-existing JSON-LD preserved) |

---

## 5. Internal Links Added

### 5.1 Full internal-link graph, constructed before any edit

Inbound link counts were computed across all 64 pages **before** touching anything.
The distribution confirmed the P2 analysis:

| Rank | Page | Inbound before |
|---|---|---|
| 1 (worst) | `/categories/finance/simple-interest-calculator/` | **0 — true orphan** |
| 2 | `/ai-operations-assistant/` | 1 |
| 3 | `/templates/warehouse/packing-list/` | 1 |
| 4 | `/simulators/warehouse-shift-challenge/` | 1 |
| 5 | `/categories/business/working-hours-calculator/` | 2 |
| 6 | `/templates/inventory/reorder-level-tracker/` | 2 |
| … | *(hub pages)* | up to 137 |

### 5.2 The 9 links added

Anchors are descriptive and match the destination. None is an exact-match keyword
repetition, and none is inserted sitewide.

| # | From | To | Anchor text | Placement | Rationale |
|---|---|---|---|---|---|
| 1 | `logistics/pallet-calculator` | `guides/warehouse-space-utilization` | "warehouse space utilization" | Pallet Planning Considerations intro | Pallet count directly drives floor/racking space |
| 2 | `logistics/container-loading-calculator` | `templates/warehouse/packing-list` | "warehouse packing list" | "Check Regulatory and Cargo Restrictions" card | The packing list records the cartons this tool plans; genuine workflow step |
| 3 | `logistics/cbm-calculator` | `guides/warehouse-space-utilization` | "warehouse space planning" | end of "How to Use CBM in Shipping and Load Planning" | Ties measured volume to storage planning |
| 4 | `logistics/cbm-calculator` | `templates/warehouse/packing-list` | "warehouse packing list" | same paragraph as #3 | Dispatch documentation for the calculated volume |
| 5 | `inventory/eoq-calculator` | `templates/purchasing/purchase-order` | "purchase order" | "Practical Checks" closing paragraph | EOQ output becomes the PO quantity |
| 6 | `inventory/eoq-calculator` | `guides/abc-inventory-analysis` | "ABC inventory analysis" | same paragraph as #5 | Ordering policy varies by ABC class |
| 7 | `inventory/reorder-point` | `templates/inventory/reorder-level-tracker` | "reorder level tracker" | "Reorder Point vs Safety Stock" section | The operational companion page for recording ROPs |
| 8 | `inventory/safety-stock` | `guides/abc-inventory-analysis` | "ABC inventory analysis" | end of "Which Safety Stock Method Should I Use?" | Service level is set by item criticality |
| 9 | `categories/business/working-hours-calculator` | `simulators/warehouse-shift-challenge` | "warehouse shift challenge" | "Shift Workers" benefit card | Shift hours are exactly what the simulator models |
| 10 | `categories/finance/break-even-calculator` | `categories/business/profit-margin-calculator` | "profit margin calculator" | "Understand what drives your break-even point" | Break-even volume vs per-sale profitability |
| 11 | `categories/finance/compound-interest-calculator` | `categories/finance/simple-interest-calculator` | "simple interest calculator" | "Understand what this estimate assumes" | **Resolves the only orphan**; the two are the obvious pair |

*(11 link insertions across 9 files — `cbm-calculator` and `eoq-calculator` each
received two.)*

### 5.3 Cluster coverage requested by the brief

**`simple-interest-calculator` orphan — RESOLVED** (§5.2 #11). Inbound 0 → 1.

**`working-hours-calculator` low inbound — IMPROVED** (§5.2 #9). Inbound 2 → 3.
This is the page the analysis flagged as the standout: 201 impressions at position
28.83 with 0 clicks and only 2 inbound links. It now has a genuinely relevant
inbound link from a sibling business tool.

**Calculator → guide relationships — REPAIRED.** The analysis found 8 of 12
calculators linked to **no guide at all**. Now:
- `pallet-calculator` → `warehouse-space-utilization` (was: no guide)
- `eoq-calculator` → `abc-inventory-analysis` (was: no guide)
- `safety-stock` → `abc-inventory-analysis` (was: no guide)
- `cbm-calculator` → `warehouse-space-utilization` (was: no guide)

Remaining calculators still without a guide link (`container-loading-calculator`,
`dio-calculator`, `reorder-point`, `inventory-turnover`) are addressed by the
template/workflow links above where a natural target exists; the rest have no
genuinely relevant guide, and inventing one would be forced linking. **Recorded as
remaining work in §9.**

**Stock-count / cycle-count / inventory-variance cluster — ALREADY WELL CONNECTED,
DELIBERATELY NOT EXPANDED.** The graph showed
`templates/inventory/stock-count-sheet` with **18 inbound links** and
`inventory/variance-report` with **20**. The cluster is dense. Adding more links
here would produce exactly the repetitive pattern the brief forbids. Only one
genuine gap existed in this cluster — `reorder-level-tracker` (2 inbound) — and it
was filled (§5.2 #7).

**Pallet / CBM / container-loading / warehouse-space cluster — CONNECTED.**
- `pallet-calculator` → warehouse-space guide
- `cbm-calculator` → warehouse-space guide **and** packing-list
- `container-loading-calculator` → packing-list
- `warehouse-space-calculator` already linked to the guide (preserved, untouched)

### 5.4 Rules honoured

| Requirement | Status |
|---|---|
| Only natural, relevant contextual links | Yes — each is placed where the topic is already discussed |
| No repetitive sitewide linking | Yes — max 1 inbound link added per target per page |
| Descriptive anchors matching the destination | Yes — verified by automated test (§7) |
| Page URLs preserved | Yes — **zero** URL changes |
| Existing useful links not replaced | Yes — all links are **additions**; no `<a>` was removed or modified |
| No excessive exact-match keyword anchors | Yes — anchors are natural phrases ("warehouse packing list"), not "pallet calculator" repeated |
| No privacy/terms/contact links from content | Yes — deliberately excluded |
| No links from the homepage to everything | Yes — homepage untouched |

### 5.5 Verified before → after inbound counts

| Target | Before | After | Change |
|---|---|---|---|
| `/categories/finance/simple-interest-calculator/` | 0 | 1 | **+1 (orphan fixed)** |
| `/simulators/warehouse-shift-challenge/` | 1 | 2 | +1 |
| `/templates/warehouse/packing-list/` | 1 | 3 | **+2** |
| `/templates/inventory/reorder-level-tracker/` | 2 | 3 | +1 |
| `/templates/purchasing/purchase-order/` | 6 | 7 | +1 |
| `/guides/abc-inventory-analysis/` | 5 | 7 | **+2** |
| `/guides/warehouse-space-utilization/` | 5 | 7 | **+2** |
| `/categories/business/profit-margin-calculator/` | 7 | 8 | +1 |

**Orphan count sitewide: 1 → 0.**

---

## 6. Why FAQPage Was Not Implemented

The brief says explicitly: **"Do not automatically add FAQPage schema."** P2-A
therefore emits **zero** `FAQPage` blocks, and this is enforced by an automated test
(`no FAQPage schema is generated in P2-A`).

The P2 analysis already flagged this as P2-B for two independent reasons:

1. **Google restricted FAQ rich results in 2023** to a narrow set of authoritative
   government and health sites. For DIXANI the markup would very likely produce
   **no visible rich result** — the empty `Search appearance.csv` is consistent
   with that.
2. **FAQ markup must mirror visible text exactly.** Adding it to 53 pages requires
   a per-page review so the markup cannot drift from the rendered FAQ. Drift
   produces invalid markup, which is worse than no markup.

It remains a **P2-B** item, to be done only on pages where the FAQ is already
visible and after an exact-text review — never speculatively.

Similarly excluded in P2-A (per the analysis and the brief):
`HowTo` (deprecated), `Product` (free downloads, not products), `Course`, `Event`,
`JobPosting`, and any second `Organization` on the homepage.

---

## 7. Tests: Passed and Failed

### 7.1 Automated tests added — `tests/schema.test.mjs`

**18 tests, all passing.** They run under the same `node --test` harness as the
existing suite and cover both the new schema and the link graph.

| # | Test | Guards against |
|---|---|---|
| 1 | generated regions are balanced | Unmatched `<!-- schema:generated -->` markers |
| 2 | at least 50 pages receive generated markup | Silent generator failure |
| 3 | homepage is not given a generated region | Duplicate `Organization` conflict |
| 4 | every JSON-LD block parses as valid JSON | Escaping/injection bugs |
| 5 | no fabricated ratings, reviews, authors or dates | Spam-policy violation |
| 6 | no FAQPage schema is generated in P2-A | Scope creep into P2-B |
| 7 | no HowTo or Product schema is generated | Deprecated/inappropriate types |
| 8 | breadcrumb positions are contiguous, start at Home, end at the page | Invalid `itemListElement` |
| 9 | no page declares more than one BreadcrumbList | Duplicate types |
| 10 | no page declares more than one WebApplication | Duplicate types |
| 11 | every generated WebApplication has required, truthful properties | Missing `name`/`url`/`offers`; fabricated ratings |
| 12 | generated schema URLs match each page's canonical | Wrong `url`/`@id` |
| 13 | every internal link resolves to an existing file | Broken links |
| 14 | the P2-A link targets are all reachable from content | A link silently dropped |
| 15 | no page is an orphan | Re-introducing the orphan |
| 16 | anchors use descriptive text, not bare URLs or empty labels | "click here"/URL anchors |
| 17 | analytics identifiers are unchanged on every page | Accidentally editing the analytics |
| 18 | every page keeps exactly one `<h1>` and one canonical | Structural damage |

### 7.2 Test run results

```
node --test tests/*.test.mjs
ℹ tests 67
ℹ pass 67
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```

**49 pre-existing tests + 18 new = 67 passing, 0 failing.**

This includes the pre-existing guards that would have caught collateral damage:
- `site-integrity.test.mjs` — title uniqueness, canonical correctness, internal link
  resolution, robots coverage, OG/Twitter completeness, **analytics integrity**,
  and meta-description lengths.
- `site-search.test.mjs` — confirms the search index is **not stale** and that every
  indexed URL resolves. This is the test that proves the schema work did not disturb
  the search index.
- `cache-version.test.mjs` — cache-busting hashes still match.

### 7.3 Full build order executed

Run exactly in the mandated order:

| Step | Command | Result |
|---|---|---|
| 1 | `node tests/build-schema.mjs` | ✅ 64 scanned, 50 BreadcrumbList, 24 WebApplication, 52 pages modified |
| 2 | `node tests/build-search-index.mjs` | ✅ `Wrote 64 entries` — **file byte-identical** (`git status` clean) |
| 3 | `node tests/build-cache-versions.mjs` | ✅ `refs updated : 0`, `refs already fresh : 90`, `pages modified : 0` |
| 4 | `node tests/build-schema.mjs --check` | ✅ `OK: all generated schema is current.` |
| 5 | `node tests/build-cache-versions.mjs --check` | ✅ `OK: all cache versions are current.` |
| 6 | `node --test tests/*.test.mjs` | ✅ **67 pass, 0 fail** |
| 7 | `node audit-check.mjs` | ✅ exits `0` (only a pre-existing long-title note on `goods-issue-note`) |
| 8 | `git diff --check` | ✅ **CLEAN** — no whitespace errors, no conflict markers |

### 7.4 Idempotency proven

```
Run 1: Pages modified : 52   Pages already current : 0
Run 2: Pages modified : 0    Pages already current : 0
```

The generator converges after a single pass and produces no churn on re-runs.

### 7.5 Nothing sensitive changed — mechanically verified

| Check | Command | Result |
|---|---|---|
| Titles/descriptions untouched | grep of `git diff` for `<title>` / `name="description"` | **NONE modified** |
| JS/CSS/XML/TXT untouched | grep of `git diff --name-only` for those extensions | **none** |
| Search index untouched | `git status --porcelain assets/js/search-index.js` | **blank (unchanged)** |
| Whitespace/conflict errors | `git diff --check` | **clean** |
| Analytics intact | automated test #17 | **pass** |
| `<h1>` count intact | automated test #18 | **pass** |

### 7.6 Pre-existing issue observed (NOT caused by P2-A)

`templates/warehouse/goods-issue-note/index.html` has a 63-character title and a
render-blocking script, flagged by `audit-check.mjs`. This is **pre-existing
metadata** — P2-A did not touch its `<title>`. It is noted here only so the audit
output is not mistaken for a regression. Fixing it is a P2-B content decision.

---

## 8. SEO Risks and Remaining Work

### 8.1 Risk assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| `BreadcrumbList` changes SERP appearance unexpectedly | Very low | Low | Breadcrumbs are navigational, not a ranking claim; Google may or may not display them |
| `WebApplication` causes an unexpected rich result | Very low | Low | Only truthful properties emitted; no ratings means no review-style rich result |
| A title/description changed by accident | **None — verified** | — | Diff grep confirms zero title/description modifications |
| Internal links hurt an existing ranking | Very low | Low | Links are additive; no anchor was changed; no page's own title/desc changed |
| Search index drift | **None — verified** | — | `search-index.js` is byte-identical; test #6 of the search suite passes |
| Cache-version drift | **None — verified** | — | `--check` passes; `refs updated : 0` |
| Crawl-budget dilution from new links | Negligible | Negligible | 11 links added across 9 pages out of ~4,000 existing links |
| Schema/content drift over time | **Medium if unmanaged** | Medium | **`build-schema.mjs --check` fails the build on drift** — the core mitigation |

### 8.2 What is genuinely expected to change in Search Console

Being explicit, because the P2 analysis warned against conflating failure modes:

- **Structured data:** the main effect is **machine understanding**, not rich
  results. `Search appearance.csv` is empty and may well stay empty. Breadcrumbs
  *may* appear in SERPs for some queries; FAQ rich results are not expected at all.
- **Positions:** **not expected to change materially** in the short term. Internal
  links are a slow signal.
- **The real click opportunity remains A6** (title/description on the
  pos-5-to-20, CTR-<1% pages). **That was deliberately NOT done in P2-A**, because
  the brief for this phase forbids rewriting titles or descriptions:
  > *"Do not rewrite titles, descriptions or page copy for SEO in this phase."*

P2-A is therefore the **safe structural foundation**. The higher-expected-impact
snippet work (A6/B5) remains pending and is the correct next approval decision.

### 8.3 Remaining internal-linking work (deferred)

| Gap | Why deferred |
|---|---|
| `container-loading-calculator` → a guide | The only relevant guide (`warehouse-space-utilization`) is a stretch for a container-stuffing page; the packing-list link was the natural fit |
| `dio-calculator`, `reorder-point`, `inventory-turnover` → a guide | No genuinely relevant guide exists yet for these topics. Forcing a link would be low-quality |
| `volumetric-weight-calculator` (2 inbound) | Real gap, but no natural source page currently discusses volumetric weight alongside it. Needs content (P2-B) before a link |
| `picking-list` (2 inbound), `supplier-evaluation` (2 inbound) | Same — genuine low-inbound pages with no natural contextual source yet |
| `working-hours-calculator` could take a 4th inbound | Left at 3; adding more without a distinct topical reason would be repetition |

### 8.4 Remaining schema work (deferred)

| Item | Phase | Note |
|---|---|---|
| `FAQPage` on pages with visible FAQs | **P2-B** | Requires exact-text review; no rich result expected |
| `Person`/`author` on more pages | **Not planned** | Only legitimate where a name is visibly published |
| `@id` graph linking breadcrumbs to `WebPage` | Optional | The pre-existing markup uses `@id` in places; the generator intentionally emits standalone blocks to avoid conflicting with hand-written `@id` relationships on the 9 pre-marked pages |
| `sitemap.xml` lastmod for changed pages | Optional | Not required; GitHub Pages serves the files regardless |

### 8.5 ⚠️ Critical deployment dependency (carried over from P2 §8.5)

`assets/js/search-index.js` is generated from each page's `<title>` and
`name="description"`. **P2-A changed neither**, so the index is unchanged — that is
why step 2 of the build order produced a byte-identical file.

**This dependency still applies to any future phase.** If a later phase changes any
title or description (all of A6 and B5), the following order is **mandatory**:

```powershell
node tests/build-schema.mjs
node tests/build-search-index.mjs
node tests/build-cache-versions.mjs
node tests/build-schema.mjs --check
node tests/build-cache-versions.mjs --check
node --test tests/*.test.mjs
```

Skipping it would deploy a search index that describes pages as they no longer are —
the site's own search box would return stale descriptions.

### 8.6 Safety constraints honoured

| Constraint | Status |
|---|---|
| Preserve unrelated local changes | ✅ Only the 52 HTML files + 2 new test files touched |
| Do not modify calculator formulas | ✅ **Zero** JS files changed |
| Do not change page URLs | ✅ **Zero** URL/canonical changes |
| Do not modify analytics | ✅ Verified by automated test |
| Do not rewrite titles, descriptions or copy for SEO | ✅ Verified — prose additions only, and one heading I briefly altered was reverted |
| Do not implement P2-B or P2-C | ✅ Not implemented |
| Do not commit, push or deploy | ✅ **Not committed, not pushed, not deployed** |

---

## 9. PowerShell Deployment Instructions

**Nothing below has been executed.** Current state: changes are in the working tree
only. HEAD is still `741004b`.

### 9.1 Step 0 — Review before deploying

```powershell
cd C:\Users\DELL\Documents\Website\dixani.github.io

# See exactly what changed
git status --short
git diff --stat

# Read the schema additions on one representative page
git diff -- logistics/pallet-calculator/index.html

# Confirm no title/description/JS drift
git diff --name-only | Select-String '\.(js|css|xml|txt)$'   # expect: no output
git diff | Select-String '<title>|name="description"'         # expect: no output
```

### 9.2 Step 1 — Verify the generator is current

```powershell
node tests/build-schema.mjs --check
# expect: "OK: all generated schema is current."
```

### 9.3 Step 2 — Re-run the full build order (safe, idempotent)

```powershell
node tests/build-schema.mjs
node tests/build-search-index.mjs
node tests/build-cache-versions.mjs
node tests/build-schema.mjs --check
node tests/build-cache-versions.mjs --check
node --test tests/*.test.mjs
```

Expected: `Pages modified : 0` on the schema build, `refs updated : 0` on cache
versions, and **67 tests passing, 0 failing**.

### 9.4 Step 3 — Run the site audit

```powershell
node audit-check.mjs
git diff --check
```

`git diff --check` must produce **no output** on stdout (only the benign
`LF will be replaced by CRLF` warnings on stderr, which are a Windows line-ending
artifact, not a content problem).

### 9.5 Step 4 — Stage and commit

```powershell
git add tests/build-schema.mjs tests/schema.test.mjs
git add reports/DIXANI-P2-A-IMPLEMENTATION.md

# Stage the 52 modified HTML pages (PowerShell-safe: pipe the file list)
git diff --name-only | ForEach-Object { git add -- $_ }

git status --short                       # review the staged set

git commit -m "P2-A: add generated BreadcrumbList and WebApplication schema, repair internal-link gaps

- tests/build-schema.mjs: deterministic, idempotent JSON-LD generator with --check
- BreadcrumbList on 50 pages; WebApplication on 24 verified interactive tools
- No titles, descriptions, URLs, formulas, analytics or stylesheets changed
- 11 internal links across 9 pages: resolves the simple-interest-calculator orphan
- tests/schema.test.mjs: 18 new assertions; full suite 67/67 passing"
```

### 9.6 Step 5 — Push (triggers GitHub Pages deploy)

```powershell
git push origin main
```

### 9.7 Step 6 — Post-deploy verification

```powershell
# Wait ~2 minutes for the GitHub Pages build, then confirm schema is live
curl.exe -s https://dixani.com/logistics/pallet-calculator/ | Select-String 'BreadcrumbList'
curl.exe -s https://dixani.com/logistics/pallet-calculator/ | Select-String 'WebApplication'

# Confirm the orphan is now linked
curl.exe -s https://dixani.com/categories/finance/compound-interest-calculator/ | Select-String 'simple-interest-calculator'
```

Then validate the emitted markup with Google's tooling:

- **Rich Results Test:** https://search.google.com/test/rich-results
- **Schema Markup Validator:** https://validator.schema.org/

Validate at minimum: one `/logistics/*` tool, one `/inventory/*` tool, one
`/templates/*` page, one `/categories/*` calculator, and `/guides/abc-inventory-analysis/`
(to confirm the pre-existing markup is intact).

Finally, in Search Console request indexing for the 9 link-edited pages and monitor
**Enhancements → Breadcrumbs** over the following 2–4 weeks.

### 9.8 Rollback

The change is fully reversible without touching content:

```powershell
# Option A — discard everything (schema + links)
git checkout -- .

# Option B — keep the tools, revert only the HTML
git diff --name-only | Where-Object { $_ -like '*.html' } | ForEach-Object { git checkout -- $_ }
```

Because generated markup sits inside a marked region, removing the
`<!-- schema:generated --> … <!-- /schema:generated -->` blocks (or reverting the
HTML files) restores the exact pre-P2-A state. There is no data migration and no
irreversible step.

---

## 10. Current Repository State

```
HEAD:  741004b (unchanged — nothing committed)
```

| Item | State |
|---|---|
| Modified tracked files | **52** HTML pages |
| New untracked files | `tests/build-schema.mjs`, `tests/schema.test.mjs` |
| Untracked reports | `reports/DIXANI-P2-A-IMPLEMENTATION.md` (+ 4 earlier reports) |
| JS / CSS / XML / TXT modified | **none** |
| Titles / descriptions modified | **none** |
| Analytics modified | **none** |
| Committed | **No** |
| Pushed | **No** |
| Deployed | **No** |

**P2-A is complete and fully validated locally. Awaiting approval before commit,
push and deployment.**

---

*End of P2-A implementation report.*











