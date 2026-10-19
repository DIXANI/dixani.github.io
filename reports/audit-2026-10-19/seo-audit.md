# DIXANI Technical SEO, Content and Performance Audit — 2026-10-19

## Verification Boundary

The repository was fully inspectable. The production host was not reachable on 2026-10-19 (`Unable to connect to the remote server`), so the following remain unverified:

- live HTTP status codes and redirect chains;
- deployed HTML versus repository HTML;
- live canonical, robots and sitemap responses;
- Google indexing status and rich-result eligibility;
- Core Web Vitals from the field or lab;
- live analytics and AdSense behavior.

All technical findings below are from generated HTML and local browser rendering unless explicitly marked as historical Search Console evidence.

## Technical Baseline

| Check | Result | Evidence |
|---|---|---|
| Indexable routes | 64 | `evidence/site-survey.json` |
| Sitemap URLs | 64 | `sitemap.xml` |
| Pages missing from sitemap | 0 | Survey reconciliation |
| Sitemap URLs missing on disk | 0 | Survey reconciliation |
| Canonical tags | 64 present, 64 match route | Survey |
| Robots directive | `index, follow` on all 64 | Survey |
| H1 count | Exactly one on all 64 | Survey and existing tests |
| Duplicate titles | 0 | Survey |
| Duplicate meta descriptions | 0 | Survey |
| Broken internal links | 0 | Existing integrity tests and survey |
| Orphan pages | 0 | Existing integrity test |
| Missing image alt text | 0 | Survey |
| Invalid JSON-LD | 0 | Survey and schema tests |
| `robots.txt` | Allows all, declares sitemap | Repository |
| `ads.txt` | Google publisher line present | Repository |
| CNAME | `dixani.com` | Repository |
| Download artifacts | 30 unique, all exist, valid signatures | Additional PowerShell audit |

This is a strong static-SEO baseline. The earlier parser result suggesting 55 missing canonicals was a false positive caused by attribute order; after correcting the parser, all 64 canonicals match.

## Structured Data

Existing tests and page inspection found:

- 58 `BreadcrumbList` blocks;
- 24 `WebApplication` blocks for genuine interactive tools;
- 5 `Article` blocks on guides;
- 2 `WebPage` blocks;
- 1 `CollectionPage`;
- 1 `Organization`;
- 1 `WebSite`.

No `FAQPage`, `HowTo`, `Product`, ratings, reviews, authors or dates are fabricated. That restraint is appropriate: `HowTo` rich results are deprecated, and templates are free downloads rather than products.

## Historical Search Console Evidence

The existing `reports/DIXANI-P2-GSC-ANALYSIS.md` records a 42-day export ending 2026-10-14. It is historical evidence, not a live measurement:

| Metric | Value |
|---|---|
| Clicks | 21 |
| Impressions | 4,632 |
| CTR | approximately 0.45% |
| Mobile average position | approximately 16 |
| Desktop average position | approximately 41 |
| US impressions | 1,435 at position 43.05, zero clicks |
| Rich results | zero in the export |
| Search appearance rows | 0 |

The export cannot establish current rankings. It does show that impressions are being earned and that click-through is weak, especially on desktop. The site’s own data also shows instructional and terminology mismatches: users search “how to calculate warehouse space,” “TI-HI,” “container stuffing,” “warehouse storage cost calculator,” “warehouse racking calculator,” and “check digit calculator container.”

## Findings

### SEO-01 — Live deployment not verified (blocking)

No claim can be made that the repository HTML, canonical URLs, sitemap, redirects or status codes match production. A deployment verification pass is required before indexing or AdSense conclusions.

### SEO-02 — Eight titles exceed 60 characters (Low, heuristic)

| Route | Length |
|---|---|
| `/categories/business/working-hours-calculator/` | 61 |
| `/categories/finance/loan-payment-calculator/` | 61 |
| `/guides/warehouse-space-utilization/` | 64 |
| `/inventory-control-toolkit/` | 66 |
| `/inventory/inventory-accuracy-analyzer/` | 63 |
| `/templates/inventory/inventory-adjustment-form/` | 62 |
| `/templates/purchasing/` | 62 |
| `/templates/purchasing/request-for-quotation/` | 64 |

Sixty characters is a display heuristic, not a Google penalty. Review for truncation and intent fit; do not shorten mechanically.

One description is 161 characters (`/templates/inventory/stock-count-sheet/`); the rest are within 160. This is a low-priority snippet-length review.

### SEO-03 — Tool-page intent is not consistently matched (Medium)

The strongest observed gap is not missing tools but missing **instructional intent**:

- “How to calculate warehouse space” / “warehouse capacity calculation” clusters land on a calculator page without a prominent step-by-step calculation path.
- Container loading queries mix “how many fit” with “container stuffing / load plan.”
- Pallet queries repeatedly use “TI-HI,” while the pallet page does not visibly own the term.
- Search results show zero rich results in the historical export. FAQ markup is not a guaranteed fix, but visible FAQ content already exists and could be reviewed for eligibility.

**Recommendation:** add a short “How this calculation works” block near the calculator, a worked example with units, assumptions and limitations, then link to the detailed guide. Do not merge distinct tools merely because their keywords overlap.

### SEO-04 — Internal linking is structurally sound but workflow links are underused (Medium)

No orphan pages or broken internal links were found. The opportunity is semantic: connect the Accuracy Analyzer, ABC guide, cycle-count guide, Cycle Count Planner and Variance Report with explicit next-step links and a shared data handoff. Existing tests should be extended to assert these workflow links.

### SEO-05 — Performance is unmeasured but has clear risks (Medium)

Measured local asset sizes:

- median local JS/CSS per content page: approximately 13.6 KB;
- heaviest local JS/CSS page: approximately 65 KB (`/ai-operations-assistant/`);
- total repository CSS: approximately 192 KB;
- total repository JS: approximately 241 KB;
- 84 blocking local script references across 64 pages;
- every page loads Google Tag Manager and Cloudflare Insights from third parties;
- no page has content images in the static HTML, reducing image-weight risk.

The 84 count is a sum of blocking local script tags, not 84 per page. Each page includes at least one local script without `async` or `defer`, plus analytics. No LCP, INP or CLS measurement was possible, so no Core Web Vitals pass or failure is claimed.

**Recommendation:** measure production LCP/INP/CLS with PageSpeed Insights or CrUX before optimizing. If measurement is unavailable, defer or modularize non-critical local scripts, audit third-party consent/analytics loading, and keep calculators responsive with large CSV datasets.

### SEO-06 — Thin-content risk exists on a few utility pages (Low, hypothesis)

A text extraction proxy found the lowest word counts on `/contact/` (204), `/guides/` (335), `/simulators/warehouse-shift-challenge/` (340), `/categories/converters/unit-converter/` (471) and `/templates/warehouse/` (478). Word count is not a quality score and interactive tools legitimately have less prose.

**Recommendation:** judge each page by whether it answers the user’s task. Do not pad pages. Add a worked example or assumptions section where it improves comprehension.

### SEO-07 — AdSense readiness: no ads currently in static HTML (Low/Medium)

Verified:

- `ads.txt` contains a Google publisher line;
- the privacy page contains an advertising and Google AdSense disclosure;
- no AdSense script, ad slot, or `ca-pub` placement was found in static HTML;
- analytics and Cloudflare beacons load on all 64 pages.

Not verified:

- whether AdSense is active in production;
- whether a previous rejection is attributable to any specific issue;
- whether ad placement, consent behavior or policy review would pass.

The audit does not claim that any one issue caused a prior rejection and does not guarantee approval. Before applying, fix broken/stale calculator states, verify mobile overflow, add navigation bypass, and ensure privacy/consent text matches actual third-party behavior.

## Tool-Page SEO Quality Check

All 23 calculator pages have visible FAQ blocks (the minimum is one on Cycle Count Planner; most have four to seven). Formula and exposition presentation varies. Recommended standard for every tool page:

1. Descriptive title and one-sentence task statement.
2. Calculator near the top of the content flow.
3. Input definitions and units.
4. Formula with a worked example.
5. Assumptions and model limitations.
6. Interpretation and next action.
7. FAQ based on real questions.
8. Related calculator links and relevant template links.

The pallet and container pages are good examples of honest limitation statements. The accuracy analyzer has strong workflow content but must first fix its import contract.

## Prioritized SEO Actions

| Priority | Action | Reason | Verification |
|---|---|---|---|
| P1 | Verify production status, redirects, canonical and sitemap | Deployment may differ from repository | `curl`/browser at multiple routes; compare deployed HTML |
| P1 | Add skip link and fix CBM/Accuracy mobile overflow | Usability and mobile experience are quality signals | Keyboard and 320/390 px browser checks |
| P2 | Add instructional blocks and TI-HI terminology where intent is clear | Existing GSC evidence | Search-intent review; no keyword-volume claims |
| P2 | Add workflow links and explicit data handoff | Differentiates DIXANI and reduces repeat entry | Link-integrity and browser flow tests |
| P2 | Review performance after measurement | Avoid speculative optimization | PageSpeed/CrUX or lab trace |
| P3 | Review long titles and one long description | Snippet presentation | SERP preview review |
| P3 | Reconsider FAQ schema only after content review | Rich-result eligibility is not guaranteed | Validate against current Google guidance |

## Evidence

- `evidence/site-survey.json`
- `evidence/dixani-page-audit.json`
- `evidence/node-test-run-2026-10-19.txt`
- `reports/DIXANI-P2-GSC-ANALYSIS.md`
- `sitemap.xml`, `robots.txt`, `ads.txt`, `CNAME`
