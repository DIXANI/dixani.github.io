# DIXANI Website â€” P1 Improvement Report

- **Site:** https://dixani.com/ (GitHub Pages)
- **Repo:** `dixani.github.io`
- **Date:** 2026-10-16
- **Scope:** P1 (low-risk, verified improvements) â€” **stopped at P1, not committed, not pushed**
- **Baseline:** P0 fixes committed and live on `origin/main` (`6f29162`)
- **Predecessor:** `reports/DIXANI-AUDIT.md`

---

## 1. Executive Summary

P1 addressed six low-risk, high-confidence items drawn from the audit. Every change was
**verified against the source before editing** and **re-verified by automated tests after editing**.

| # | Task | Status | Outcome |
|---|---|---|---|
| A | Site search | âœ… **Implemented** | Replaced 3 hardcoded keyword patterns with a real 64-page static search index, ranked matching, live results panel and a proper empty state |
| B | Stale root `main.js` | âœ… **Removed** | Proven to have **0 references** sitewide; deleted |
| C | Performance | âš ï¸ **Investigated, 1 proposal** | No render-path defect found. The ~1.16 MB social preview PNG is **OG-only and non-render-blocking**; resizing proposed, not applied |
| D | Social metadata | âœ… **Implemented** | **45 pages** gained a complete OG + Twitter block (they previously had **zero** tags) |
| E | On-page SEO | âœ… **Implemented** | Fixed the only missing `robots` meta, removed all raw `&rarr;` entities, brought descriptions into SERP limits |
| F | Analytics verification | âœ… **Verified clean** | 64/64 pages correct. **No IDs or snippets were modified** |

**Headline results**

- Meta descriptions over the 160-char SERP truncation limit: **13 â†’ 0**
- Pages with a complete OG/Twitter block: **19/64 â†’ 64/64**
- Search queries returning relevant results: **3 patterns â†’ all 64 pages, ranked**
- Tests: **40/40 passing** (0 failures), full suite in ~1.5 s

---

## 2. Method & Verification Discipline

A recurring theme this round was that **the audit's own helper regexes were wrong**, not the site.
Each finding was therefore re-verified from raw source before any edit, and the resulting
test/helper code was itself corrected when it produced false positives. Specifically:

| Apparent finding | Re-verification result | Action |
|---|---|---|
| "og:image duplicate on `index.html`" | False positive â€” the second tag was `og:image:alt` | No change |
| "`twitter:image` duplicate on `index.html`" | False positive â€” the second tag was `twitter:image:alt` | No change |
| "Analytics config missing on 9 pages" | False positive â€” those pages use the minified one-line gtag form | No change; **analytics confirmed 64/64 clean** |
| "`privacy`/`terms` missing `robots` meta" | False positive â€” both already had it | No change |
| "`og:url` mismatches canonical on 50 pages" | False positive â€” tests required `property` before `content`; the site's order differs | **Test rewritten** |
| "`canonical` mismatches path" | False positive â€” tests required `rel` before `href`; the site uses `href` first | **Test rewritten** |

All extraction helpers now locate the **whole tag first, then read the attribute**, so attribute
order can never produce a false result again.

---

## 3. Task A â€” Site Search

### Problem (confirmed)
Before P1, search was:

```js
if (q.includes("inventory") || q.includes("variance") || q.includes("stock"))
  location.href = "/inventory/variance-report/";
else
  location.href = "/#tools";
```

Only three hardcoded substrings worked. **Every other query â€” "EOQ", "VAT", "pallet",
"purchase order" â€” silently threw the user onto the homepage `#tools` anchor.** On a site with
64 pages this made the search box actively misleading.

### Solution
1. **`assets/js/search-index.js`** (17.9 KB, generated) â€” one entry per page:
   `{ u: url, t: title, c: category, y: type, d?: description }`. Titles have the `| DIXANI`
   brand suffix stripped and HTML entities decoded so results render as plain text.
2. **`tests/build-search-index.mjs`** â€” regenerates the index from the site's own `<title>`,
   meta description, `<h1>` and folder path. Re-run after adding pages.
3. **`assets/js/main.js`** â€” rewritten search: normalised matching, weighted ranking
   (exact title > prefix > word-boundary > substring > category > type > description > URL),
   multi-word AND semantics, live results as you type, `Enter`/button to jump straight to a
   confident match, `Escape` and outside-click to dismiss.
4. **`index.html`** â€” added `role="combobox"`, `aria-controls`, `aria-expanded`,

---

## 4. Task B â€” Stale Root `main.js`

### Problem (confirmed)
Two files existed:

| File | HTML references | Content |
|---|---|---|
| `/main.js` (repo root) | **0** | Old search logic; redirected to `/inventory/` |
| `/assets/js/main.js` | **64** (every page) | Current logic |

The root file was **dead code**, still being served, and the source of the audit's "stale script"
finding. Because it was tracked by git, deletion was staged with `git rm`.

### Solution
- **Deleted `/main.js`.** A sitewide assertion now fails the test suite if any page ever
  references `/main.js` again, and another fails if the file reappears.

---

## 5. Task C â€” Performance

### Investigation result: no render-path defect found
This is an honest negative result rather than a fix, because the audit's framing did not survive
verification.

| Claim checked | Finding |
|---|---|
| "Oversized social preview image" | `dixani-social-preview.png` is **1731Ã—909 @ ~1.16 MB**. It is referenced **only** by `og:image` / `twitter:image` â€” it is **never loaded as page content**, so it does not affect LCP, CLS or any render metric |
| "Images missing dimensions" | Only **2** `<img>` elements exist sitewide; both already have `width`, `height` **and** `loading="lazy"` |
| "Heavy main-thread JS" | `/assets/js/main.js` is **596 B** and sits at the end of `<body>`. The new search index adds 17.9 KB, loaded **only on the homepage** |
| "Render-blocking scripts" | `audit-check.mjs` reports 1â€“2 per page, but these are the **`async` GA4 tag** and the same scripts on every page â€” a pre-existing sitewide characteristic, tracked as **P2**, not introduced here |

### Proposal (NOT applied)
Resize `dixani-social-preview.png` to **1200Ã—630** (the standard OG aspect ratio) and compress to
**< 300 KB**. This is a **social-sharing crawler** improvement, not a page-speed one: it reduces
the payload Facebook/LinkedIn/X must fetch to render a link preview. Doing it safely requires
re-encoding the PNG (image tooling), outside P1's low-risk scope, so it is proposed for later.

---

## 6. Task D â€” Social Metadata

### Problem (confirmed)
**45 of 64 pages had ZERO Open Graph and ZERO Twitter tags** â€” not merely a missing `og:image`.
Sharing any of those URLs produced no title, description or image preview. The 19 pages that did
have tags (the older/marketing set) used a consistent, established pattern.

### Solution
- Created **`tests/add-social-meta.mjs`**, which inserts the **site's own existing pattern** â€”
  the same 11 tags in the same order, reusing the **existing**
  `https://dixani.com/assets/images/dixani-social-preview.png`.
- `og:title`, `og:description` and `og:url` were derived **from each page's own** `<title>`,
  meta description and canonical URL. **Nothing was invented**; no generic or placeholder copy
  was introduced.
- The script is **idempotent** â€” it skips any page that already has an `og:` tag, so it is safe
  to re-run. Result: **45 pages updated, 19 correctly skipped.**

```html
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="DIXANI"/>
<meta property="og:title" content="..."/>       <!-- from that page's <title> -->
<meta property="og:description" content="..."/> <!-- from that page's description -->

---

## 7. Task E â€” On-Page SEO

### E1. Missing `robots` directive â€” FIXED
`categories/converters/unit-converter/` was the **only** page lacking a `robots` meta tag
(every other page has `index, follow`). Added the standard tag. Sitewide coverage is now
**64/64**, asserted by test.

> Note: an initial hypothesis that `privacy` and `terms` were also missing it was **tested and
> disproved** â€” both already had the tag. No change was made to those files.

### E2. Raw `&rarr;` entities â€” FIXED
Five instances of `&rarr;` were used in visible labels rather than the character itself.
Replaced with the literal `â†’` for consistency with the rest of the site.

| File | Line | Before | After |
|---|---|---|---|
| `index.html` | 225 | `Explore the Toolkit &rarr;` | `Explore the Toolkit â†’` |
| `categories/inventory/index.html` | 192 | `Explore the Toolkit &rarr;` | `Explore the Toolkit â†’` |
| `inventory/cycle-count-planner/index.html` | 516 | `Open the Analyzer &rarr;` | `Open the Analyzer â†’` |
| `inventory/cycle-count-planner/index.html` | 533 | `Read the guide &rarr;` | `Read the guide â†’` |
| `inventory/cycle-count-planner/index.html` | 549 | `Explore the toolkit &rarr;` | `Explore the toolkit â†’` |

A test now fails the suite if any raw `&rarr;`/`&larr;` reappears in visible label text.

### E3. Meta description lengths â€” FIXED
Descriptions over ~160 characters are truncated in search results. **13 pages were affected.**
Each was rewritten to preserve every primary keyword while fitting the limit.

| Page | Before â†’ After |
|---|---|
| `inventory-control-toolkit` | 191 â†’ within limit |
| `categories/finance/break-even-calculator` | 178 â†’ within |
| `templates/inventory/stock-count-sheet` | 178 â†’ within |
| `templates/purchasing/purchase-requisition` | 173 â†’ within |
| `templates/purchasing/request-for-quotation` | 172 â†’ within |
| `about` | 170 â†’ within |
| `inventory/dio-calculator` | 168 â†’ within |
| `inventory/eoq-calculator` | 168 â†’ within |
| `categories/finance/compound-interest-calculator` | 167 â†’ within |
| `logistics/pallet-calculator` | 166 â†’ within |
| `templates/inventory/reorder-level-tracker` | 163 â†’ within |
| `templates/inventory/inventory-adjustment-form` | 161 â†’ within |
| `templates/warehouse/packing-list` | 161 â†’ within |

**Result: descriptions > 160 chars: 13 â†’ 0.** A test enforces a 165-char ceiling.

### E4. Under-length description â€” FIXED
`contact/index.html` had a 46-character description ("Contact DIXANI about feedback and bug
reports."). Rewritten to 133 characters with meaningful context.
**Result: descriptions < 70 chars: 1 â†’ 0.**

### E5. Under-length title â€” FIXED
`contact/index.html` had a 14-character title (`Contact DIXANI`). Rewritten to
`Contact DIXANI | Feedback & Support` (35 chars).
**Result: titles < 30 chars: 3 â†’ 2.**

### E6. Long titles â€” REVIEWED, INTENTIONALLY NOT CHANGED
15 page titles run **61â€“70 characters** against a 60-character soft guideline (Google
truncates by pixel width, not character count, and these are keyword-dense).

Examples:
- `Free Inventory Control Toolkit: Tools, Guides & Templates | DIXANI` (70)
- `Free Purchasing & Procurement Templates â€“ Excel & PDF | DIXANI` (70)

**Decision: no change.** These are 1â€“10 characters over a *guideline*, are keyword-rich, and
trimming them would remove specific search-intent terms to satisfy an arbitrary threshold â€”
a net SEO negative. Documented here as a **deliberate, justified deviation**. The two remaining
under-30 titles (`privacy` at 23, `terms` at 21) are legal pages where a longer title adds no value.

---

## 8. Task F â€” Analytics Verification

### Result: CLEAN â€” and deliberately untouched
The audit raised no analytics defect, so this task was **verification only**. The tag IDs are
load-bearing and were not modified in any way.

Every one of the **64 pages** has:

- exactly **1** GA4 loader: `googletagmanager.com/gtag/js?id=G-LQEH9L9TZ4`
- exactly **2** occurrences of `G-LQEH9L9TZ4` (the loader URL + the `gtag('config', â€¦)` call)
- exactly **1** Cloudflare beacon: `static.cloudflareinsights.com`

**0 mismatches across 64 pages.** A test now asserts these exact counts sitewide, so any future
edit that duplicates or drops a snippet fails immediately.

> An earlier scan appeared to show "9 pages missing the config call". This was a **regex artefact**:
> those pages use a minified single-line `gtag('js',new Date());gtag('config','G-LQEH9L9TZ4');`
> form that the first pattern did not account for. Counting raw ID occurrences proved all 64
> pages correct.

<meta property="og:url" content="..."/>         <!-- from that page's canonical -->
<meta property="og:image" content="https://dixani.com/assets/images/dixani-social-preview.png"/>
<meta property="og:locale" content="en_US"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="..."/>

### Verified
- **64/64** pages now have exactly **one** each of `og:image`, `og:title`, `og:description`,
  `og:url`, `og:type`, `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`.
- `og:url` **equals** the page canonical on **every** page (asserted by test).
- **No duplicates** anywhere (the two `index.html` "duplicates" were `og:image:alt` /
  `twitter:image:alt`, which are correct and intentional).

---

## 9. Files Changed

### Production files modified
| File | Change |
|---|---|
| `index.html` | Search markup upgraded (combobox a11y + results container), `search-index.js` wired in, `&rarr;` â†’ `â†’` |
| `assets/js/main.js` | Search rewritten: ranked index matching, live results, empty state |
| `assets/css/templates.css` | Added search-results panel styles |
| 45 `*/index.html` pages | Added full OG + Twitter block (Task D) |
| `categories/converters/unit-converter/index.html` | Added missing `robots` meta |
| `categories/inventory/index.html` | `&rarr;` â†’ `â†’` |
| `inventory/cycle-count-planner/index.html` | 3 Ã— `&rarr;` â†’ `â†’` |
| 13 pages | Meta description rewritten to fit SERP limits |
| `contact/index.html` | Title lengthened + description rewritten |

### Production files added
| File | Purpose |
|---|---|
| `assets/js/search-index.js` | Generated 64-page search index (17.9 KB) |

### Production files deleted
| File | Reason |
|---|---|
| `main.js` (repo root) | **0 references sitewide** â€” proven dead code |

### Tooling / tests added
| File | Purpose |
|---|---|
| `tests/build-search-index.mjs` | Regenerates `assets/js/search-index.js` from page HTML |
| `tests/add-social-meta.mjs` | Idempotent OG/Twitter backfill for pages missing it |
| `tests/page-inventory.mjs` | Emits `tests/_page-inventory.json` (route, title, h1, description) |
| `tests/meta-outliers.mjs` | Read-only title/description length report |
| `tests/site-search.test.mjs` | 16 search-engine tests |
| `tests/site-integrity.test.mjs` | 11 sitewide integrity tests |

> **Untracked and excluded from any commit:** `audit-check.mjs` (pre-existing helper) and
> `tests/_page-inventory.json` (generated data). `reports/` and `tests/` were already untracked
> before P1 began.

---
## 10. Validation

### Automated test suite — 40/40 passing
```
node --test tests/site-search.test.mjs tests/site-integrity.test.mjs tests/pallet-calculator.test.mjs
# tests 40 | pass 40 | fail 0 | duration_ms ~830
```

**`site-search.test.mjs` (16 tests)** — index completeness (index size == page count), every
indexed URL resolving to a real file, no entity artefacts, ranking precedence, the exact
regression that motivated the rewrite, prefix/partial matching, multi-word AND semantics, empty
state, script wiring, CSS presence, and stale-`main.js` absence.

**`site-integrity.test.mjs` (11 tests)** — title uniqueness + non-emptiness, description/robots
coverage, canonical correctness **and per-page path matching**, canonical uniqueness, internal
link resolution, relative asset resolution, OG/Twitter completeness, `og:url` == canonical,
analytics integrity, no raw arrow entities, description length ceiling.

**`pallet-calculator.test.mjs` (13 tests, pre-existing)** — still passing, confirming the P0
pallet/CBM behaviour was **not** disturbed.

### Independent sitewide checks

| Check | Result |
|---|---|
| Sitemap URLs vs. pages | **64 / 64 — exact match**, 0 missing, 0 extra |
| Duplicate titles | **0** |
| Duplicate canonicals | **0** |
| Canonical matches page path | **64 / 64** |
| Broken internal links | **0** |
| Broken relative assets | **0** |
| `robots` meta coverage | **64 / 64** |
| OG + Twitter completeness | **64 / 64**, no duplicates |
| Analytics snippets | **64 / 64**, 0 mismatches |
| `git diff --check` | Clean (only benign `LF→CRLF` notices) |

### Notable incident (resolved)
While iterating, an edit inserted test blocks **inside** an existing test's `for` loop, causing
448 nested subtests and an 18-second run. The nesting was detected via the TAP reporter and
corrected; the suite now runs in **~1.5 s**. This affected the **test harness only** — never any
production file. It is recorded here for transparency.

---



## 11. Remaining Recommendations (NOT done in P1)

### Kept as proposals â€” these are P2/P3 and require judgement or tooling
| Item | Why deferred |
|---|---|
| **Resize `dixani-social-preview.png` to 1200Ã—630 / < 300 KB** | Needs image re-encoding; affects social crawlers only, not page speed |
| **Script `defer`/consolidation** | The audit's render-blocking finding is real but affects all 64 pages uniformly; a sitewide script-strategy change is not low-risk |
| **Structured data on 55 pages + FAQ schema** | Content-modelling decision (which schema per page type), must not contradict existing `ld+json` |
| **`lastmod` backfill on 59 sitemap URLs** | Requires an accurate change-date source; guessing dates is worse than omitting them |
| **Long titles (15 pages, 61â€“70 chars)** | Deliberate deviation â€” see Â§7 E6 |
| **Breadcrumb markup on 56 pages** | Sitewide template change, better batched with structured data |
| **Per-page social images (art direction)** | Requires a designed image per page; reusing the existing brand image is correct for now |

### SEO risk assessment
| Risk | Assessment |
|---|---|
| Adding OG/Twitter tags changing indexing | **None** â€” these tags are not used for indexing or ranking |
| Rewritten descriptions losing keywords | **Low** â€” every primary keyword was preserved in each rewrite |
| Deleting root `main.js` | **None** â€” 0 references proven; a test guards against reintroduction |
| Search index growing stale as pages are added | **Guarded** â€” re-run `node tests/build-search-index.mjs`; a dedicated test now fails if any indexed description differs from the live page |
| New 17.9 KB homepage script | **Negligible** â€” homepage only, no render-blocking, no new round-trips beyond one cacheable asset |

---

## 11a. Release-Review Repairs (added after the initial P1 pass)

A full pre-release audit of the P1 diff surfaced **two defects**, both now fixed and
covered by tests. They are recorded here because they changed the final diff.

| # | Defect | Severity | Fix |
|---|---|---|---|
| 1 | **Stale search index** â€” `assets/js/search-index.js` was generated *before* the Task E description rewrites, so 14 entries still carried the **old, over-long descriptions**. The shipped search panel would have displayed outdated snippets on those pages. | Medium | Regenerated the index with `node tests/build-search-index.mjs`. Now **0 mismatches** against live page HTML. A new test, *"the index is not stale"*, fails with the remediation command if this ever drifts again. |
| 2 | **Missing `og:locale`** on `/ai-operations-assistant/` and `/inventory/cycle-count-planner/` â€” the only 2 of 64 pages without it. **Pre-existing at `HEAD`**, not introduced by P1, but inconsistent with the other 62 pages. | Low | Added `<meta property="og:locale" content="en_US"/>` to both, matching the sitewide pattern. |

Both fixes were re-verified: full suite **41/41 passing** (40 original + the new
stale-index guard), metadata problems **0/64**, index freshness **0/64 mismatches**.

---

## 12. Deployment Readiness

**Status: P1 complete and ready for your review. Nothing has been committed or pushed.**

- âœ… All 41 tests passing (28 search/integrity + 13 pre-existing calculator)
- âœ… All 64 pages verified for canonical, robots, OG/Twitter and analytics integrity
- âœ… Sitemap exact match; 0 broken links; 0 broken assets; 0 duplicate titles/canonicals
- âœ… `git diff --check` and `git diff --cached --check` both clean
- âœ… Analytics IDs **untouched** (0 analytics lines appear in the entire P1 diff)
- âœ… P0 behaviour intact (pallet-calculator tests still green)
- âœ… Search verified over **real HTTP** (all 64 destinations return 200), not just `file://`
- âœ… Search escaping verified against XSS in both the query string and the index data
- âœ… No P2 or P3 work started

### Regeneration commands
```bash
node tests/build-search-index.mjs   # after adding/renaming pages
node tests/add-social-meta.mjs      # after adding a page without OG tags (idempotent)
node tests/page-inventory.mjs       # refresh analysis data
node tests/meta-outliers.mjs        # review title/description lengths
node --test tests/site-search.test.mjs tests/site-integrity.test.mjs tests/pallet-calculator.test.mjs
```

### Suggested commit message (when you approve â€” not performed)
```
P1: real site search, complete social metadata, on-page SEO fixes

- Replace 3-keyword search with a generated 64-page ranked index,
  live results panel and empty state (assets/js/search-index.js)
- Add Open Graph + Twitter tags to the 45 pages that had none,
  reusing the existing brand preview image (no invented content)
- Fix missing robots meta on unit-converter; replace 5 raw &rarr;
  entities; bring 13 over-long and 1 under-length descriptions
  into SERP limits; lengthen the contact title
- Remove stale, unreferenced root main.js (0 HTML references)
- Add tests: 16 search + 11 site-integrity (40/40 passing)
```

---

*End of P1 report. P0 work was committed previously as `6f29162`. P1 changes remain
uncommitted in the working tree, pending your review.*
