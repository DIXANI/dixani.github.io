# DIXANI Competitor Analysis — 2026-10-19

## Status: Live Competitor Inspection Blocked

**Attempt date:** 2026-10-19  
**Environment:** restricted network sandbox  
**Result:** every named competitor request failed before an HTTP response. No competitor page was observed, so no competitor feature, ranking, traffic, keyword, pricing, or usability claim is made in this report.

| Target | Attempt | Result |
|---|---|---|
| `https://warehousecalculators.com/tools` | HTTP HEAD, 15 s timeout | `Unable to connect to the remote server` |
| `https://www.omnicalculator.com/` | HTTP HEAD, 15 s timeout | `Unable to connect to the remote server` |
| `https://www.calculator.net/` | HTTP HEAD, 15 s timeout | `Unable to connect to the remote server` |
| `https://dixani.com/` | HTTP HEAD, 15 s timeout | `Unable to connect to the remote server` |
| `https://dixani.com/sitemap.xml` | HTTP GET, 15 s timeout | `Unable to connect to the remote server` |

The existing GSC report records an earlier independent attempt in which Google, DuckDuckGo and Bing returned consent/bot pages and direct competitor URLs returned 403/404. That historical result is consistent with the current environment but is not new evidence about competitor pages.

## What This Report Can and Cannot Establish

### Verified from DIXANI source and executed browser checks

- DIXANI has 23 calculators spanning inventory, warehouse/logistics, business and finance.
- It pairs tools with five operational guides, 18 downloadable template detail pages, 30 unique files, and an inventory-control workflow hub.
- Calculations run client-side. Inventory data is not uploaded by the inspected implementations.
- The Accuracy Analyzer exports CSV; the Cycle Count Planner accepts an Analyzer-compatible CSV. This is a partial workflow handoff, not a fully linked application state.
- The pallet and container tools provide simple-grid visualizations and explicitly disclaim mixed-orientation optimization and weight-limit checks.
- The site has no account requirement, server-side inventory storage, or multi-user collaboration.
- The AI assistant is a rule-based local demo, not evidence of a networked generative model.

### Not established

- Whether any competitor is faster, clearer, more accurate, more mobile-friendly, or better ranked.
- Which competitor features are free versus gated.
- Which competitor pages rank for each DIXANI query.
- Search volume, keyword difficulty, CPC, traffic, conversion rate, or revenue for DIXANI or any competitor.
- Whether a competitor already offers a specific proposed tool or template.

## Provisional Comparator Set

These are **candidate references**, not verified comparator findings. They should be inspected manually in a clean browser before any comparative claim is published.

| DIXANI category | Candidate comparator | URL | Inspection status |
|---|---|---|---|
| Inventory calculations | Warehouse Calculators tools directory | `https://warehousecalculators.com/tools` | Blocked 2026-10-19 |
| Broad calculator coverage / UX benchmark | Omni Calculator | `https://www.omnicalculator.com/` | Blocked 2026-10-19 |
| Broad calculator coverage / SEO benchmark | Calculator.net | `https://www.calculator.net/` | Blocked 2026-10-19 |
| Pallet, CBM and container tools | Warehouse Calculators | `https://warehousecalculators.com/tools` | Blocked; category fit provisional |
| Finance calculators | Calculator.net | `https://www.calculator.net/` | Blocked; category fit provisional |
| Finance calculators | Omni Calculator | `https://www.omnicalculator.com/` | Blocked; category fit provisional |

No additional competitors were “discovered” through search because search and direct retrieval were unavailable. Adding names without observing their pages would violate the evidence standard of this audit.

## Comparison Framework for the Next Pass

For each DIXANI tool, capture the top three relevant organic comparator pages and record the following in a new dated file:

| Dimension | Evidence to capture |
|---|---|
| URL and page title | Exact URL, title, visible H1, date/time, country, device |
| Calculation coverage | Inputs offered, outputs offered, formula shown or hidden |
| Formula transparency | Is the formula stated? Is a worked example present? |
| Input flexibility | Units, bulk rows, CSV, paste, presets, custom divisors |
| Edge cases | Zero, negative, fractional quantity, invalid text, zero denominator |
| Result explanation | Does it explain what the number means and what to do next? |
| Visualizations | Pallet layers, container plans, charts, diagrams |
| Mobile usability | 390 px viewport, table overflow, touch target size |
| Export and print | CSV, Excel, PDF, print stylesheet |
| Account requirement | Free, sign-in, paywall, usage limit |
| Guides and templates | Worked examples, downloadable files, related content |
| Internal linking | Related calculators, next-step workflow |
| Differentiation | A capability DIXANI does not currently match |
| Evidence quality | Screenshot, page text, direct URL, access timestamp |

The comparison table requested by the brief should only be completed when the “features offered” column can be filled from an observed page. It must not be filled from memory or search snippets.

## DIXANI’s Verified Differentiation

Even without competitor evidence, several differentiators are verifiable inside DIXANI:

### 1. Operational workflow, not only isolated formulas

The Accuracy Analyzer connects count data, exact-match accuracy, financial exposure, ABC classes, risk scoring, action recommendations and CSV export. The Cycle Count Planner can consume an Analyzer-compatible CSV. This is a stronger operational chain than a standalone “inventory accuracy percentage” page, but the handoff is manual and should be made explicit.

**Opportunity:** add a visible “Send to Cycle Count Planner” or downloadable handoff file with the same SKU/location/ABC/risk fields, without server storage.

### 2. Privacy-first local processing

Inventory files are processed in the browser. This is valuable for organizations that cannot upload stock counts to a third-party service. It should be stated more prominently and tested with a network monitor to prove no inventory payload is transmitted.

### 3. Templates adjacent to calculations

The site combines calculators, guides and downloadable Excel/PDF templates. This can serve users who want either a quick answer or a reusable operating document. The templates are actual files and all 30 targets resolve.

### 4. Visual logistics planning

Pallet and container tools show simple top and side layouts. They are honest about being planning estimates. For small operations, this may be more useful than a raw CBM result; for advanced logistics, mixed-orientation and weight-aware planning remain gaps.

### 5. Explainable inventory risk

The Accuracy Analyzer’s risk score has documented weights and reasons. Once input integrity is fixed, this is a defensible differentiator: users can see why an item is ranked, not just receive an opaque score.

## Gaps That Are Evident from DIXANI’s Own Data

These are not competitor claims:

| Gap | Evidence | Why it matters |
|---|---|---|
| Instructional intent is underserved on tool pages | GSC clusters for “how to calculate warehouse space” and “warehouse utilization formula” landed on calculator/guide pages with weak positions | Users asking “how” need worked examples and assumptions, not only inputs |
| Container loading lacks a load-planning guide | GSC shows container loading/stuffing queries; the tool page is primarily a calculator | Separate “how many fit” from “how to plan and secure a load” |
| No TI-HI terminology | GSC queries include TI/HI variants; pallet page does not visibly target the term | A simple terminology and calculator-mode addition could satisfy existing demand |
| No warehouse storage-cost calculator | 17 GSC impressions at position 80.18 with no matching page | Existing demand is observed, though low and weak-positioned |
| No racking/bay calculator | 9 GSC impressions at position 81.11 with no matching page | Operational need and observed query, but demand size is unverified |
| No ISO 6346 container check-digit tool | 13 GSC impressions at position 36.15 | Distinct, bounded utility with a clear workflow |
| Manual cross-tool data transfer | Accuracy export and cycle-count import are separate steps | Reduces repeat entry and makes the workflow more defensible |

## Safe Provisional Positioning

Until competitor pages are observed, the defensible positioning is:

> DIXANI is a free, browser-based operations toolkit that combines calculation, explanation, visual planning and downloadable templates for inventory, warehouse, logistics and small-business teams. Inventory data stays in the browser, and the inventory tools are designed to support a count-to-action workflow rather than isolated formulas.

This is a description of verified DIXANI capabilities, not a claim of superiority.

## Manual Completion Checklist

1. In a clean incognito browser, search each of the 23 DIXANI tool names and capture the top five organic results at desktop and mobile.
2. Open `warehousecalculators.com/tools`, Omni Calculator and Calculator.net and record their actual inventory, pallet, CBM, container, unit and finance coverage.
3. Complete the comparison framework table with observed URLs, page text and screenshots.
4. Record the access date, country and device for every observation.
5. Do not add traffic, keyword volume, CPC, difficulty or ranking claims unless a dated data source is available.
6. Re-run this report after capture and replace “blocked” rows with evidence-backed rows.

## Evidence

- `evidence/site-survey.json`
- `README.md` live-access limitation
- Historical GSC analysis: `reports/DIXANI-P2-GSC-ANALYSIS.md`
- Historical blocked competitor attempt: `reports/DIXANI-P2-B-ANALYSIS.md`
