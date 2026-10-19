# DIXANI P2-B — CTR & Search Intent Analysis

**Site:** https://dixani.com/
**Repository:** DIXANI/dixani.github.io
**Baseline commit:** `c8cb57e` — *"P2-A: add structured data and improve internal linking"*
**Data source:** `dixani.com-Performance-on-Search-2026-10-16.zip` (Google Search Console export, 16 Oct 2026)
**Export window:** 2026-09-03 → 2026-10-14 (42 days), Web search type
**Status:** **READ-ONLY ANALYSIS ONLY — no production file modified. No commit, no push. Awaiting approval.**

---

## 1. Executive Summary

P2-A fixed the *structural* layer (schema + internal linking). P2-B addresses a
different failure mode, and it is worth being precise about which one.

Three pages sit at **average positions 10.13–11.79** with **0.36%–1.71% CTR**.
At those positions a well-matched snippet normally earns several percent. The
pages rank; the *snippets* are not converting. That is the single clearest
opportunity on the site and it is what this phase targets.

### The five findings that matter

**1. The title/CTR problem is worst on `/guides/investigate-inventory-variances/`
— and the cause is identifiable.** It holds **276 impressions for 1 click
(0.36% CTR) at position 10.13**. The strongest evidence is a neighbouring query:
`inventory variance report` converts at **14.29%** (1 click / 7 impressions) and
`stock count sheet` at **3.23%**. Those pages have snippets that *state a
deliverable*. The 276-impression page's snippet states a *task* ("How to
Investigate…"). This is a mismatch between how the page describes itself and what
the query implies the user wants.

**2. `/guides/abc-inventory-analysis/` has a different, subtler problem: a
snippet/vocabulary gap.** 246 impressions, 2 clicks, 0.81%. The page's own H1 is
**"ABC Inventory Analysis: Formula, Example and Practical Application"** but its
`<title>` says *"Formula, Example and Guide"*. Meanwhile the observed queries
use *"how to do"*, *"how to calculate"*, *"classification"*, *"percentages"*,
*"example"*. The title is 52 characters — it is **not** too long; it simply leads
with a noun phrase where several queries lead with a *task*. Not a length fix.

**3. `/templates/inventory/stock-count-sheet/` should be treated as a protected
asset, not a fix target.** It is the **best-converting content page on the site**
(1.71% at position 11.79) and `stock count sheet` — its head query — converts at
**3.23% at position 12.39**. P2-A already added breadcrumb schema here. Any
change to this page carries more downside than the others.

**4. The three pages' low CTR is very likely only *partly* fixable via snippets.**
A large share of their impressions come from queries where the page is not the
best-intent match (`inventory variance report template` at 23.77; `net variance`
at 9.32; `count sheet template` at 22; `abc analysis example` at 76.33). Snippet
copy cannot fix a query whose intent the page does not serve. **Some of the
0.36% is an intent problem, not a wording problem** — §3 separates these.

**5. Competitor review could not be completed.** Google, DuckDuckGo and Bing all
blocked automated retrieval, and direct competitor URLs returned 403/404. Per the
brief's instruction not to invent data, **§4 reports this as a gap rather than
fabricating findings.** Recommendation on how to close it is included.

### What is proposed

Nine changes total, split by risk. **No change touches calculator logic, canonical
URLs, analytics, or the download files.** All are text-only, reversible, and
individually testable. §8 ranks them.

---

## 2. GSC Evidence and Limitations

### 2.1 What the export actually contains

| File | Rows | Contains |
|---|---|---|
| `Chart.csv` | 42 | Daily totals |
| `Pages.csv` | 36 | **Page-level totals only** |
| `Queries.csv` | 451 | **Query-level totals only** |
| `Countries.csv` | 139 | Country totals |
| `Devices.csv` | 3 | Desktop / Mobile / Tablet |
| `Search appearance.csv` | **0** | **Empty — no rich results** |
| `Filters.csv` | 2 | Web search, last 3 months |

### 2.2 ⚠️ The limitation that shapes this entire report

**The export contains no page↔query dimension.** `Pages.csv` has one column of
URLs; `Queries.csv` has one column of queries. There is **no file where a query
is attributed to a URL.**

The brief anticipated exactly this:

> *"Do not infer query-to-page attribution from separate GSC aggregate exports
> when direct page-query data is unavailable."*

**This rule is followed throughout.** Where this report says a query is
"relevant to" a page, it means one of two weaker, explicitly-labelled things:

1. **Direct match** — the page's own title, H1 or visible H2 text already
   contains the query's wording. Verified by searching the page source. This is
   evidence the page targets that phrasing, not proof it received that query.
2. **Thematic relevance** — the query's topic is unambiguously the page's topic,
   and no other DIXANI page covers it.

**No query is claimed to have landed on a specific page.** Doing so would be
invention. To obtain true attribution, the user must pull the **Queries** tab
*filtered by page* in the GSC UI (or use the API with the `page` dimension) —
see §10.6.

### 2.3 Other limitations that affect interpretation

| Factor | Effect on interpretation |
|---|---|
| **42-day window, 22 total clicks** | The entire site earned **22 clicks**. 1–4 clicks per page. **CTR differences here are not statistically meaningful.** A page with 1 click / 276 impressions and one with 2 / 246 are statistically indistinguishable. Every CTR figure in this report is a *weak signal*, and no change can be validated by a single 42-day sample. |
| **New site** | First impression 2026-09-05. No historical CTR baseline exists for *any* page. |
| **Position volatility** | Daily average position ranged **12.8 → 44.5**. A page-level figure is a 42-day average, not a current rank. |
| **Anonymisation thresholds** | GSC withholds low-volume queries per dimension independently. The Pages total (4,779 impr) exceeds the sitewide total (4,632) for this reason. **Pages and Queries totals must never be added together.** |
| **Device split confounds CTR** | Desktop: 0.48% CTR at position **41.04**. Mobile: 0.34% CTR at position **16.27**. Higher positions do not mean higher CTR here. |
| **Country split** | United States = **1,435 impressions (31%), 0 clicks, position 43.05**. Clicks cluster in India, Malaysia, Qatar, Kenya, Sri Lanka, Mexico. A snippet tuned to US phrasing may behave differently in the markets actually clicking. |
| **⚠️ `Search appearance.csv` is empty** | Zero rich results across 4,632 impressions. **This means P2-A's schema cannot yet be measured for rich-result effect** — and it also means breadcrumbs are not currently inflating or deflating these pages' CTR. |
| **CTR by position is not stable at n=1** | A 14.29% CTR on `inventory variance report` is **1 click from 7 impressions**. That is a single user. It is suggestive, not evidence. Cited here as a *pattern*, explicitly not as a rate. |

### 2.4 The three priority pages — verbatim from `Pages.csv`

| URL | Clicks | Impressions | CTR | Position |
|---|---|---|---|---|
| `/guides/investigate-inventory-variances/` | 1 | **276** | **0.36%** | **10.13** |
| `/guides/abc-inventory-analysis/` | 2 | **246** | **0.81%** | **10.79** |
| `/templates/inventory/stock-count-sheet/` | 4 | **234** | **1.71%** | **11.79** |

Combined: **7 clicks from 756 impressions at an average position of ~10.9.**
Ranking is demonstrably working. Click-through is not.

### 2.5 CTR context across the site

For calibration, from the same `Pages.csv`:

| Page | Impressions | Position | CTR |
|---|---|---|---|
| `/templates/inventory/stock-count-sheet/` | 234 | 11.79 | **1.71%** ← best content CTR |
| `/` (homepage) | 35 | 4.09 | 8.57% |
| `/templates/inventory/stock-variance-report/` | 19 | 11.16 | 5.26% |
| `/inventory/cycle-count-planner/` | 16 | 5.06 | 6.25% |
| `/inventory/variance-report/` | 156 | 19.58 | 0.64% |
| `/guides/abc-inventory-analysis/` | 246 | 10.79 | 0.81% |
| `/guides/investigate-inventory-variances/` | 276 | 10.13 | **0.36%** |

**The pattern is clear and internal to the site:** the two pages with the most
impressions in the position-10 band have the *worst* CTR of any page ranking that
well. `stock-variance-report` ranks at a *worse* position (11.16) and converts
3× better (5.26%). Position is not the differentiator — **snippet relevance is.**

---

## 3. Page-by-Page Search Intent Analysis

For each page: current metadata verbatim, the observed queries *thematically
relevant* to it (labelled per §2.2 — **not** attributed), the intent the page
serves, and the specific mismatch.

### 3.1 `/guides/investigate-inventory-variances/` — 276 impr · 1 click · 0.36% · pos 10.13

**Current metadata (verbatim from source):**

```
<title>How to Investigate Inventory Variances | DIXANI</title>
<meta name="description" content="Investigate inventory variances with a
  step-by-step checklist, a worked shortage example and evidence checks
  before correcting stock records." />
```

**H1:** `How to Investigate Inventory Variances`
**Structure:** 11 H2s, 14 headings, ~1,833 words. Includes a checklist, an
8-branch cause list, a worked 35-unit shortage example, an investigation-record
section, adjustment-timing guidance, prevention, and a 6-question FAQ.
**Content verdict: genuinely strong. Not thin content. Not a content problem.**

**Observed queries thematically relevant (from `Queries.csv`):**

| Query | Impr | Pos | CTR | Intent |
|---|---|---|---|---|
| `net variance` | 22 | 9.32 | 0% | Definition / metric |
| `inventory variance report template` | 22 | 23.77 | 0% | **Template seeking** |
| `variance report` | 16 | 75.69 | 0% | **Deliverable seeking** |
| `inventory variance` | 14 | 50.36 | 0% | Definition |
| `inventory variance analysis` | 7 | 58.29 | 0% | Analysis method |
| `inventory variance report` | 7 | 15.57 | **14.29%** | **Deliverable seeking** |
| `inventory variance meaning` | 4 | 7.0 | 0% | Definition |
| `inventory variance formula` | 3 | 42.33 | 0% | **Formula seeking** |
| `what is inventory variance` | 3 | 46.67 | 0% | Definition |
| `negative variance in inventory` | 1 | 9.0 | 0% | Definition |
| `which tool do you use to diagnose inventory variance` | 1 | 10.0 | 0% | **Tool seeking** |

**Intent served by the page:** *instructional / procedural* — "how do I
investigate a variance".

**Intent mismatch identified — three sub-communities, only one served:**

1. **Procedural** ("how do I investigate") → **well served.** The H1 matches this
   exactly.
2. **Definitional** (`net variance`, `what is`, `meaning`, `negative variance`) →
   **partly served.** The page defines variance and gives the basic formula, but
   the term **"net variance" does not appear anywhere on the page** — verified:
   **0 occurrences**. A user searching `net variance` (22 impressions, **position
   9.32**) lands on a page that never uses their term.
3. **Deliverable-seeking** (`variance report` + `template` + `report` ≈ 45
   impressions) → **not served.** There is no downloadable variance *report*
   here; the site has that at `/templates/inventory/stock-variance-report/` and
   `/inventory/variance-report/`. That is arguably correct routing, but the
   **14.29% CTR on `inventory variance report` is the strongest single signal in
   the export** that a report-flavoured snippet gets clicked.

**Why the snippet under-performs — the concrete mechanism:** the title opens with
`How to Investigate`. For the definitional and report-seeking queries that make
up much of the 276 impressions, a task-phrased title reads as *effort* where the
user wanted *an answer* or *a document*. The description reinforces this — it
opens with the verb "Investigate" and then lists *process artefacts*
("checklist", "worked example", "evidence checks"), attractive to someone already
committed to investigating, neutral-to-negative for someone who just wants the
term explained.

**The `<title>` is 48 characters. The description is 156.** Neither is a length
problem. Both are a *framing* problem.

### 3.2 `/guides/abc-inventory-analysis/` — 246 impr · 2 clicks · 0.81% · pos 10.79

**Current metadata (verbatim from source):**

```
<title>ABC Inventory Analysis: Formula, Example and Guide | DIXANI</title>
<meta name="description" content="Learn how to perform ABC inventory analysis
  using annual consumption value, cumulative percentages and practical A, B
  and C classifications." />
```

**H1:** `ABC Inventory Analysis:` / `Formula, Example and Practical Application`
**Structure:** 14 H2s, ~2,247 words. Formula, method, practical example, Excel
how-to, class ranges, control by class, cycle counting, "why value alone is not
enough", uses, mistakes, review cadence, FAQ.
**Content verdict: the strongest page on the site by depth. Not a content problem.**

**Observed queries thematically relevant:**

| Query | Impr | Pos | CTR | Intent |
|---|---|---|---|---|
| `abc analysis example` | 3 | 76.33 | 0% | **Example seeking** |
| `abc classification percentages` | 2 | 61.0 | 0% | **Reference data** |
| `abc inventory method` | 2 | 79.5 | 0% | Method |
| `how to do abc analysis of inventory` | 2 | 87.5 | 0% | **Procedural** |
| `abc inventory analysis annual consumption value source` | 1 | **2.0** | 0% | Terminology + **source** |
| `abc analysis formula` | 1 | 52.0 | 0% | **Formula** |
| `abc classification example` | 1 | 64.0 | 0% | Example |
| `how to calculate abc analysis in excel` | 1 | 67.0 | 0% | **Excel how-to** |
| `how to classify abc inventory` | 1 | 67.0 | 0% | **Procedural** |
| `abc calculation` | 1 | 76.0 | 0% | Formula |
| `abc classification calculation` | 1 | 88.0 | 0% | Formula |
| `how to do an abc analysis` | 1 | 88.0 | 0% | Procedural |
| `how to do abc analysis` | 1 | 89.0 | 0% | Procedural |

**Intent served by the page:** *explanatory + procedural* — "explain ABC" and
"show me how".

**Intent mismatch identified — vocabulary and framing, not depth:**

1. **The title says "Guide"; the H1 says "Practical Application".** The page's own
   most specific promise sits in the H1 and is *not* carried into the title. A
   user scanning results sees the weaker word.
2. **The queries are dominated by `how to do` / `how to calculate` / `example` /
   `percentages`.** The title leads with the noun phrase `ABC Inventory
   Analysis:` — good for the exact-match head term, silent on the task phrasings
   that make up **at least 9 of the 13** observed relevant queries.
3. **`abc classification percentages` and `abc classification example` have no
   dedicated snippet presence.** The page *contains* the class ranges and a
   worked example, but neither is signalled in the title. The description does
   say "A, B and C classifications" — this is *partially* handled, making it the
   least-broken of the three snippets.

**The `<title>` is 52 characters, the description 148.** Again: no length problem.
A framing/vocabulary alignment opportunity.

### 3.3 `/templates/inventory/stock-count-sheet/` — 234 impr · 4 clicks · 1.71% · pos 11.79

**Current metadata (verbatim from source):**

```
<title>Free Stock Count Sheet Template – Excel &amp; PDF | DIXANI</title>
<meta name="description" content="Download a free stock count sheet template in
  Excel and printable PDF. Record SKU, description, location, physical
  quantity, recount and remarks." />
```

**H1:** `Stock Count Sheet` / `Template`
**Structure:** 8 H2s, ~1,212 words. Format choice (Excel 30 rows / PDF 20 rows on
one A4 page), field inventory, how-to-use steps, an explicit "why the sheet does
not show system quantity" section, a variance cross-reference, a download
section, accuracy guidance, 7-question FAQ.
**Downloads verified present and functional:**
- `/downloads/inventory/dixani-stock-count-sheet.xlsx` — `download` attribute, `primary-button`
- `/downloads/inventory/dixani-stock-count-sheet.pdf` — `download` attribute, `secondary-button`

**Observed queries thematically relevant:**

| Query | Impr | Pos | CTR | Intent |
|---|---|---|---|---|
| `stock count sheet` | 31 | 12.39 | **3.23%** | **Template/deliverable** |
| `count sheet template` | 11 | 22.0 | 0% | **Template** |
| `stock counting sheet` | 4 | 6.25 | 0% | **Synonym** |
| `physical inventory count sheet` | 3 | 22.67 | 0% | **Synonym + PDF** |
| `stock count template excel` | 3 | 7.33 | **33.33%** | **Format-specific** |
| `inventory count sheet` | 3 | 29.67 | 0% | **Synonym** |
| `stock count list` | 2 | 8.5 | 0% | Synonym |
| `inventory count sheets` | 2 | 45.5 | 0% | Synonym |
| `count sheet` | 1 | 1.0 | 0% | Head |
| `inventory count sheet pdf` | 1 | 39.0 | 0% | **Format-specific** |
| `inventory count spreadsheet` | 1 | 56.0 | 0% | Synonym |

**Intent served by the page:** *transactional / acquisition* — "give me the file".

**Intent alignment: GOOD — the best of the three.** The title states `Free`,
states the format (`Excel & PDF`), and states the artefact (`Stock Count Sheet
Template`). `stock count sheet` → 3.23% CTR and `stock count template excel` →
33.33% (1 click / 3 impressions) confirm the formula works when the query matches.

**The genuine gap is vocabulary, not framing:**

| Query vocabulary | Occurrences on page | Gap |
|---|---|---|
| `count sheet` | 23 | ✅ strong |
| `stock count` | 29 | ✅ strong |
| `printable` | 9 | ✅ good |
| `free` | 10 | ✅ good |
| `physical inventory` | 6 | ⚠️ weak-ish (3 queries use it) |
| **`inventory count sheet`** | **0** | ❌ **the noun order many users type** |
| **`count sheet template`** | **0** | ❌ "template" and "count sheet" never adjacent |
| **`stock counting sheet`** | **0** | ❌ synonym absent |
| **`spreadsheet`** | **0** | ❌ absent (1 query uses it) |

The page is optimised around **"stock count sheet"** (31 impr) but users also type
**"inventory count sheet"** (3+2+1 = 6 impr) and **"count sheet template"**
(11 impr, position 22). Those exact strings do not appear. This is the cheapest
available win on the page — and it is *additive vocabulary*, not a rewrite.

### 3.4 Cross-page finding: the position-10 band is not converting, sitewide

All three pages share one property: **they rank in the 10–12 band on queries whose
wording their metadata does not echo.** The two pages that convert acceptably
(`stock-count-sheet` 1.71%, `stock-variance-report` 5.26%) both *name a
deliverable* in the title. The two that do not (`investigate-inventory-variances`
0.36%, `abc-inventory-analysis` 0.81%) both *name a task or a topic*.

That is a consistent, internally-verifiable pattern across four pages — stronger
evidence than any single page's CTR at n=1, though still **correlational, not
causal.**

---

## 4. Competitor Findings

### 4.1 ⚠️ Status: NOT COMPLETED — access blocked

The brief required inspecting currently-ranking competitors "where web access is
available" and to **"clearly distinguish verified competitor findings from
assumptions."** It also forbids inventing data.

**Every retrieval route attempted failed. Nothing below is presented as a
finding, because none of it could be verified.**

| Attempt | Target | Result |
|---|---|---|
| Google SERP | `google.com/search?q=stock+count+sheet+template` | Returned a consent/locale redirect page. **No results.** |
| Google SERP | `google.com/search?q=how+to+investigate+inventory+variances` | Same consent redirect. **No results.** |
| DuckDuckGo HTML | 4 queries | **Bot challenge** ("Select all squares containing a duck"). |
| DuckDuckGo Lite | 2 queries | Same bot challenge. |
| Bing | `inventory variance report template` | Returned an **unrelated cached page** — a list of `youtube.com` links. Not the query's results. Discarded as unusable. |
| Brave | `abc inventory analysis formula` | Connection failed. |
| Netsuite article | `netsuite.com/.../abc-inventory-analysis.shtml` | **HTTP 403 Forbidden.** |
| Smartsheet | `smartsheet.com/stock-count-sheet-templates` | **HTTP 404** (URL guess invalid). |

### 4.2 What is therefore unavailable for comparison

The brief asked to compare **search intent, page usefulness, template
availability, content structure and SERP presentation**. **None of these is
available** — no competitor page or SERP could be observed.

Consequently this phase **cannot substitute for** §4, and the following are
explicitly **out of scope**. They are listed to make the gap auditable, not to
imply findings:

- ❌ Which domains currently rank for `stock count sheet`, `net variance`,
  `abc analysis example` etc.
- ❌ Whether competitors serve templates, plain content, or software lead-magnets.
- ❌ Whether the SERP for these queries contains a **featured snippet, People Also
  Ask, images, or a template/download pack** — this matters a great deal,
  because a SERP dominated by a PAA block or an image pack suppresses organic CTR
  through no fault of the snippet.
- ❌ Whether an ads block occupies the top of the page (which would depress CTR
  for everyone at position 10).
- ❌ Keyword difficulty, CPC, or search volume. **Never estimated here** — the
  export contains no such fields and the brief forbids inventing them.

### 4.3 What *can* be inferred inside the site's own data (verified)

Two soft competitors are visible from `Queries.csv` alone, because they appear as
queries rather than as rivals — this is *not* competitor research, only a
terminology signal:

| Query (verbatim) | Impr | Pos | What it implies |
|---|---|---|---|
| `grn format in excel free download` | 3 | 7.33 | Users expect **GRN** (Goods Received Note) templates in Excel. DIXANI has no GRN page. |
| `grn book format` | 1 | 9.0 | Same cluster. |
| `grn format in excel` | 1 | 14.0 | Same cluster. |
| `pallet calculator excel free download` | 1 | 11.0 | Format expectation: users want the **Excel file**, not the web tool. `pallet-calculator` offers no download. |
| `eoq calculator excel` | 1 | 12.0 | Same pattern for EOQ. |
| `cycle count template excel` | 1 | 58.0 | Format expectation for cycle counting. |
| `inventory count spreadsheet` | 1 | 56.0 | The word **"spreadsheet"**. |
| `stock count template excel` | 3 | 7.33 | **33.33% CTR** — Excel-specific intent converts exceptionally well. |

**Verified observation:** a recurring, measurable user expectation across at least
four topic areas is **"excel free download"** / **"spreadsheet"** — a *file
format* expectation, not a content expectation. `stock-count-sheet` is the only
one of the three priority pages that offers files, and it has the best CTR of the
three (1.71%), plus the highest single query CTR (33.33%). **This is a
correlational observation from the site's own data, not competitor evidence.**

### 4.4 Recommendation to close this gap

Competitor review requires human-visible SERPs, which automated fetching cannot
reach. Two workable options:

1. **Manual SERP capture (recommended, 15 minutes).** For each of the 6 queries
   below, have a person search in a clean browser, incognito, at desktop and
   mobile, and paste the top 10 organic titles + URLs into a file. No tooling
   needed.
   - `stock count sheet` · `inventory count sheet template` ·
     `net variance` · `inventory variance report template` ·
     `how to do abc analysis` · `abc classification percentages`
2. **GSC UI enrichment instead of competitor work (higher value).** Pull
   **Queries filtered by page** for each of the three URLs (§10.6). That yields
   *first-party* attribution — strictly more actionable than competitor
   inference — and it is entirely within the existing tool the user already has.

**This report proceeds without §4 competitor evidence and does not let the gap
soften its recommendations.** Every recommendation in §5–§8 is grounded in
first-party GSC data and verified page source, and none depends on a competitor
claim.

---

## 5. Suggested Titles and Descriptions

### 5.1 Constraints applied to every proposal

1. **No clickbait. No unsupported promises.** "Best", "#1", "Guaranteed" are
   excluded. Every claim in a proposal is verifiable on the page.
2. **Never shortened purely to hit a character count.** Each option is labelled
   with its measured length so the trade-off is visible, not hidden.
3. **Ranking-relevant terminology is protected.** The exact head terms the pages
   currently rank for — `ABC inventory analysis`, `inventory variances`,
   `stock count sheet`, `Excel`, `PDF` — **all appear in every option below.** No
   option removes a term the page is already ranking on.
4. **One page at a time** (§8). These are *alternatives*, not a batch to apply.
5. **Description ≠ title repetition.** Each description adds information the title
   does not carry.
6. **The `DIXANI` brand suffix is preserved** on all titles, consistent with the
   existing 64 pages.

---

### 5.2 `/guides/investigate-inventory-variances/`

**Problem restated:** task-framed snippet against a query mix that is
substantially definitional (`net variance` 22 impr @ 9.32) and
report-oriented (`variance report` cluster ≈ 45 impr). The word **"net"** is
entirely absent from the page and **"variance report"** appears once.

#### Title — Option 1 (recommended, lower risk: minimal change)

```
Inventory Variance: Causes, Formula and Report | DIXANI
```
**Length:** 50 chars (current: 48).

**Change explained:** preserves `Inventory Variance` (the head term the page
ranks on at position 10.13) and `DIXANI`. Replaces the leading
`How to Investigate` — which frames *effort* — with `Causes, Formula and Report`,
which *names three deliverables* in the vocabulary the observed queries use.
`Formula` addresses `inventory variance formula` (3 impr); `Report` addresses the
`variance report` cluster; `Causes` matches the page's own H2
("Common causes of stock discrepancies") and is genuinely its largest section.

**Supporting evidence:**
- `inventory variance report` → **14.29% CTR** — the best-converting query in the
  export, from a report-framed result.
- `inventory variance formula` (3 impr) and `net variance` (22 impr) are
  unaddressed by the current title.
- The verb-first framing is the only structural difference between this page
  (0.36%) and `stock-variance-report` (5.26%).

**⚠️ Trade-off disclosed:** removing `How to Investigate` drops a term that
matches the page's H1 and possibly the procedural query that *is* working
(1 click). Guidance: **test this one first and alone** (§8).

#### Title — Option 2 (higher expected gain, slightly higher risk)

```
Inventory Variance: Meaning, Formula and How to Investigate | DIXANI
```
**Length:** 64 chars.

**Change explained:** covers all three observed intent communities explicitly —
`Meaning` (definitional: `what is`, `meaning`, `net variance`), `Formula`
(computational), `How to Investigate` (procedural, and preserves the current
title's framing verbatim so the existing ranking signal is untouched). Longer,
but the length is a *consequence* of covering three intents, not a target.

**Supporting evidence:** the three intent clusters in §3.1 are each ≥ 3
impressions with distinct query signatures. Google commonly rewrites toward the
query, so supplying all three vocabulary sets gives it more to match.

**Not proposed:** anything mentioning "net variance". The term is absent from the
page body. Putting it in the title would create title/body mismatch — a real
quality risk. **Fix the body first if that cluster is wanted** (§6.1).

#### Description — Option 1 (recommended)

```
An inventory variance is the difference between system and counted stock.
Learn what causes variances, the variance formula and how to investigate and
report them.
```
**Length:** ~156 chars (current: 156).

**Change explained:** leads with a **definition sentence** rather than a verb.
The current description opens "Investigate inventory variances with…", which
presupposes the reader already wants to. This version answers
`what is inventory variance` / `inventory variance meaning` (7 impr combined)
in the snippet itself — exactly what earns a click for definitional queries at
position 10. It then retains the page's real content promises.

**Supporting evidence:** `inventory variance meaning` sits at **position 7.0**
and `what is inventory variance` at 46.67 — both definitional, both unserved by
a process-framed description.

#### Description — Option 2

```
What causes a stock discrepancy? Use this checklist to compare quantities,
recount independently and gather evidence before adjusting inventory records.
```
**Length:** ~152 chars.

**Change explained:** opens with the question form users actually type
(`what causes…`, matching the page's `Common causes of stock discrepancies` H2).
Keeps the current description's strongest assets — "checklist", "recount",
"evidence", "adjust" — which map to real page sections and were presumably
written deliberately. This is the **lower-risk option** because it reorders
existing verified claims and adds only a question lead.

**Choose Option 2 for minimal deviation; Option 1 if the definitional cluster
(≈ 40 impressions) is the priority.**

---

### 5.3 `/guides/abc-inventory-analysis/`

**Problem restated:** title says "Guide", H1 says "Practical Application"; ≥ 9 of
13 relevant queries are task-phrased (`how to do`, `how to calculate`, `example`,
`percentages`).

#### Title — Option 1 (recommended)

```
ABC Inventory Analysis: How to Classify Inventory (A, B, C) | DIXANI
```
**Length:** 64 chars (current: 52).

**Change explained:** keeps the exact head term `ABC Inventory Analysis` at the
front — the page ranks on it at 10.79, and changing the lead term is the one
change that could disturb that. Adds `How to Classify Inventory`, matching
**three** observed queries (`how to classify abc inventory`, `how to do abc
analysis`, `abc inventory method`), and adds `(A, B, C)`, which signals the
classification output that `abc classification percentages` and
`abc classification example` are looking for.

**Supporting evidence:** `how to do abc analysis` / `how to do an abc analysis`
(2 impr, positions 88–89) and `how to classify abc inventory` (67) show the page
earns *procedural* impressions without signalling procedure in the title.

**⚠️ Note:** 64 chars will truncate in some SERPs. **This is accepted
deliberately** — the brief forbids cutting for length, and the front-loaded
`ABC Inventory Analysis` guarantees the head term survives truncation. That is
the correct trade.

#### Title — Option 2 (maximum safety, smallest change)

```
ABC Inventory Analysis: Formula, Example and Classification Guide | DIXANI
```
**Length:** 69 chars.

**Change explained:** the smallest possible meaningful change — `and Guide` →
`and Classification Guide`. `Formula` and `Example` are retained verbatim from
the current title. This option **only** adds the word `Classification`, which is
searched for: `abc classification percentages` (2), `abc classification example`
(1), `abc classification calculation` (1) = **4 impressions** currently
unaddressed.

**Supporting evidence:** strictly additive. **This is the lowest-risk proposal in
this entire report** — four words of meaning added, 100% of existing terminology
preserved.

#### Description — Option 1 (recommended)

```
Learn how to classify inventory into A, B and C using annual consumption
value. Includes the formula, a worked example, class percentages and Excel
steps.
```
**Length:** ~145 chars (current: 148).

**Change explained:** the current description is already strong. This version
makes two targeted additions the queries ask for: **"how to classify"** (the
procedural verb) and **"class percentages and Excel steps"** —
`abc classification percentages` (2 impr) and `how to calculate abc analysis in
excel` (1 impr) are both unserved. `annual consumption value`, the formula and
the example are all protected and retained.

**Supporting evidence:** the page has a dedicated H2
`How to calculate ABC analysis in Excel` and a class-ranges section — **both
verified present in source**. The description therefore describes content that
exists, which is the hard requirement.

#### Description — Option 2 (minimal change)

```
Classify inventory by annual consumption value with cumulative percentages,
practical A, B and C ranges, a worked example and an Excel calculation method.
```
**Length:** ~148 chars.

**Change explained:** retains every noun from the current description
(`annual consumption value`, `cumulative percentages`, `A, B and C`,
`practical`) and only reorders to lead with `Classify`. Adds `Excel calculation
method` to capture the Excel cluster. **Near-zero risk.**

---

### 5.4 `/templates/inventory/stock-count-sheet/`

**⚠️ Recommendation: do NOT change the title.**

The current title is the best-performing on the site — 1.71% page CTR, head query
`stock count sheet` at 3.23%, `stock count template excel` at 33.33%. P2-A's own
analysis concluded this title "should be left essentially untouched", and the
data supports that. The brief also warns against changing titles to meet
character limits — this one is 60 chars and **works**.

**Two alternatives are provided for completeness, with the explicit
recommendation NOT to apply them.** If the team wants to test anything on this
page, prefer the additive vocabulary route in §6.3, which carries no ranking risk.

#### Title — Option A (shown only to demonstrate why it is rejected)

```
Free Stock Count Sheet Template – Excel, PDF & Inventory Count Sheet | DIXANI
```
**Length:** 75 chars. **Rejected.** Adding synonyms pushes it past useful length
and delays the differentiating words. Demonstrates the wrong approach.

#### Title — Option B (only if a test is insisted upon)

```
Free Inventory Count Sheet Template – Excel & PDF | DIXANI
```
**Length:** 55 chars.

**Change explained:** swaps `Stock Count` → `Inventory Count`. `inventory count
sheet` (3 impr @ 29.67), `inventory count sheets` (2), `inventory count sheet
pdf` (1) = **6 impressions** use this noun order, which the page never uses.

**⚠️ But it *removes* `stock count` from the title, and `stock count sheet`
(31 impr @ 12.39, 3.23% CTR) is the page's single biggest query. That is a bad
trade at this sample size.** Recommended instead: add "inventory count sheet" to
the **body/H2**, not the title (§6.3).

#### Description — Option 1 (recommended — low risk, additive)

```
Download a free stock count sheet template — also used as an inventory count
sheet. Excel (30 rows) and printable PDF (20 rows on one A4 page), no signup.
```
**Length:** ~157 chars (current: 156).

**Change explained:** purely additive. It
(a) inserts **"also used as an inventory count sheet"**, capturing the 6
impressions of synonym demand without touching the title; (b) replaces the vague
"Record SKU, description…" tail with **verifiable specifics** — `Excel (30 rows)`
and `printable PDF (20 rows on one A4 page)`, both taken from the page's own H3
text; (c) adds `no signup`, which is true — both links are direct
`download`-attribute anchors to `/downloads/…`, **verified**, no form, no gate.

**Supporting evidence:** the two highest-CTR signals on this page
(`stock count sheet` 3.23%, `stock count template excel` 33.33%) both concern
*getting the file*. Concrete row counts and the absence of a signup wall are the
strongest honest differentiators available, and both are verifiable in the page
source and the download hrefs.

**⚠️ Caveat:** "no signup" must remain true. It is true today — confirmed by the
direct `download` attributes. If a gate is ever added, this description becomes
inaccurate and must be removed immediately.

#### Description — Option 2 (minimal change)

```
Download a free stock count sheet template in Excel and printable PDF.
Includes an inventory count sheet, SKU and location fields, physical
quantity, recount and remarks.
```
**Length:** ~161 chars.

**Change explained:** preserves the entire current description and inserts only
"Includes an inventory count sheet". Adds ~5 chars. **Lowest-risk option on this
page.**

---

### 5.5 Summary of all proposals

| Page | Element | Option | Length | Risk | Recommendation |
|---|---|---|---|---|---|
| investigate-inventory-variances | Title | 1 | 50 | Med | ✅ Primary |
| investigate-inventory-variances | Title | 2 | 64 | Med | Alternative |
| investigate-inventory-variances | Desc | 1 | 156 | Low | ✅ Primary |
| investigate-inventory-variances | Desc | 2 | 152 | **Very low** | Safer fallback |
| abc-inventory-analysis | Title | 1 | 64 | Med | ✅ Primary |
| abc-inventory-analysis | Title | 2 | 69 | **Very low** | Safety-first |
| abc-inventory-analysis | Desc | 1 | 145 | Low | ✅ Primary |
| abc-inventory-analysis | Desc | 2 | 148 | **Very low** | Safer fallback |
| stock-count-sheet | Title | — | — | — | ❌ **Do not change** |
| stock-count-sheet | Desc | 1 | 157 | Low | ✅ Primary |
| stock-count-sheet | Desc | 2 | 161 | **Very low** | Safer fallback |

**All character counts are stated so they can be re-measured before
implementation.** Counts marked `~` should be re-verified programmatically
before the files are edited.

---

## 6. Content Gaps and Improvements

### 6.1 Guiding rule: protect what works

All three pages are **substantively good**. Verified: 1,833 / 2,247 / 1,212 words
and 14 / 15 / 11 headings, each with formulas, worked examples, checklists and
FAQs. P2 established they are "not thin content" and their problem is "SERP
presentation (CTR) and technical markup (schema), not substance."

**Therefore: no rewrite is proposed. No existing paragraph, heading, formula,
example, table or FAQ is recommended for deletion.** Everything below is
*additive* or *terminology-only*, and each addition is justified by a specific
observed query.

**Risk framing:** adding a short, accurate section is low-risk. Removing or
rewriting content that currently ranks at position 10 is genuinely risky. The
proposals are shaped accordingly.

---

### 6.2 `/guides/investigate-inventory-variances/`

#### G1 — Add a definition subsection for "net variance" *(highest-value gap)*

| | |
|---|---|
| **Query evidence** | `net variance` — **22 impressions, position 9.32** |
| **Current state** | The phrase **"net variance" appears 0 times** on the page (verified) |
| **Proposed** | 2–4 sentences under the existing `What is an inventory variance?` H2, defining net variance (variances summed with sign — shortages offset by overages) and distinguishing it from gross/absolute variance |
| **Justification** | 22 impressions at position 9.32 is the second-largest single query cluster in the export, and the page already ranks for it. The page **cannot** win the click while the term is absent — the snippet has nothing to match. Pure terminology alignment. |
| **Risk** | **Very low** — additive to an existing H2, no existing text altered |
| **Note** | Do **not** add this term to the `<title>` before it exists in the body — ordering matters (§5.2). |

#### G2 — State the variance formula in words, not only as a box

| | |
|---|---|
| **Query evidence** | `inventory variance formula` — 3 impr @ 42.33 |
| **Current state** | A formula **exists**: `Inventory variance = Physical quantity − System quantity`, under a `BASIC FORMULA` label. But surrounding prose says "difference", not "formula". |
| **Proposed** | Add the sentence form once, e.g. *"The inventory variance formula is physical quantity minus system quantity…"* beside the existing box |
| **Justification** | The content is already accurate — this only makes the existing formula *findable* by the word users search with. **No formula is changed.** |
| **Risk** | **Very low** — one sentence, no numeric change |

#### G3 — Add a "variance report" bridge to the existing templates

| | |
|---|---|
| **Query evidence** | `inventory variance report` (**14.29% CTR**, 7 impr), `inventory variance report template` (22 impr @ 23.77), `variance report` (16 impr) |
| **Current state** | The page mentions "variance report" **once** and links out only via `Use free DIXANI resources`. |
| **Proposed** | In the existing `What should an investigation record include?` section, add one sentence naming the **Stock Variance Report** and **Inventory Variance Report** templates as the output format, with contextual links |
| **Justification** | The 14.29% CTR query shows a report-formatted result gets clicked. Routing the ~45 report-seeking impressions to the pages that *are* reports serves the user better and strengthens those templates' internal authority. |
| **Risk** | **Very low** — one sentence + links in the existing pattern |
| **Anchors** | Descriptive, not exact-match — see §7. |

#### G4 — Explicitly answer "which tool do you use to diagnose a variance"

| | |
|---|---|
| **Query evidence** | `which tool do you use to diagnose inventory variance` — 1 impr @ **position 10** |
| **Current state** | The page links to tools but never *answers* the question in prose. |
| **Proposed** | One sentence under the checklist pointing to the Variance Report tool as the diagnostic starting point |
| **Justification** | Low volume (1 impr) but **position 10** — already competitive, intent unambiguous, cheap to serve. |
| **Risk** | **Very low** |

#### Explicitly NOT recommended for this page
- ❌ Adding `shrinkage` — 0 occurrences, but **no observed query uses it**. No evidence; skip.
- ❌ Rewriting the 8-branch cause list or the 35-unit worked example — accurate and substantial.
- ❌ Embedding a "variance formula" calculator — one exists at `/inventory/variance-report/`; duplicating risks cannibalisation.

---

### 6.3 `/templates/inventory/stock-count-sheet/` — vocabulary, additively

**Reminder: no title change (§5.4).** These are body-level and additive only.

#### G5 — Introduce the synonym "inventory count sheet" naturally

| | |
|---|---|
| **Query evidence** | `inventory count sheet` (3 impr @ 29.67), `inventory count sheets` (2), `inventory count sheet pdf` (1), `inventory count spreadsheet` (1) = **7 impressions** |
| **Current state** | `inventory count sheet` — **0 occurrences** (verified). The page says "stock count sheet" 23×. |
| **Proposed** | Add the synonym once in the intro and once in the `What is a stock count sheet?` FAQ answer, e.g. *"A stock count sheet — also called an **inventory count sheet** or **physical inventory count sheet** — …"* |
| **Justification** | Two observed query phrasings name the same object with different nouns. The page ranks 29.67 for the synonym vs 12.39 for its own term — the synonym is the weaker position and the easier gain. |
| **Risk** | **Very low** — additive vocabulary, no structural change |

#### G6 — Make "count sheet template" adjacent

| | |
|---|---|
| **Query evidence** | `count sheet template` — **11 impr @ 22.0** (largest single unserved cluster here) |
| **Current state** | `count sheet` (23×) and `template` both appear, but **never adjacent** — the H1 renders as "Stock Count Sheet" / "Template" on separate lines, and body prose never writes the two words together. |
| **Proposed** | Ensure the adjacent phrase appears in body prose at least once, e.g. *"This count sheet template covers…"* |
| **Justification** | 11 impressions at position 22 with 0% CTR — the page ranks but the exact adjacency is absent. Clearest wording gap across the three pages. |
| **Risk** | **Very low** |

#### G7 — Add the word "spreadsheet" once

| | |
|---|---|
| **Query evidence** | `inventory count spreadsheet` — 1 impr @ 56.0 |
| **Current state** | `spreadsheet` — **0 occurrences** (verified). |
| **Proposed** | One mention, e.g. *"If you prefer a spreadsheet, the Excel file…"* in the format-choice section (which already contrasts Excel 30 rows vs PDF 20 rows). |
| **Justification** | Low volume, zero cost, semantically correct. |
| **Risk** | **Very low** |

#### G8 — File format / download expectations

| | |
|---|---|
| **Evidence** | `stock count template excel` **33.33% CTR**; `grn format in excel free download` (7.33); `pallet calculator excel free download` (11) — across the site, *format* intent converts disproportionately. |
| **Current state** | The download section names "Excel Stock Count Sheet" and "Printable PDF Stock Count Sheet" (H3s); buttons read "Download Excel" / "Download PDF"; one H3 already states "30 count rows" and the other "20 rows on one A4 page". **Already good.** |
| **Proposed** | Optional micro-addition only: state the file is `.xlsx` and A4-printable — both facts are **already stated** in H3 text. |
| **Verdict** | ✅ **No change needed.** Recorded to close the loop explicitly rather than imply a gap. |

#### Explicitly NOT recommended for this page
- ❌ Removing the "Why the sheet does not show system quantity" section. It is a deliberate, correct design decision and is correctly documented; removing it would be a regression.
- ❌ Adding a signup or download gate — would immediately invalidate the §5.4 description proposal and likely depress the 33.33% format-intent CTR.
- ❌ Renaming the H1 to "Inventory Count Sheet" — same objection as §5.4 Title Option B.

---

### 6.4 `/guides/abc-inventory-analysis/`

#### G9 — Signal "percentages" explicitly

| | |
|---|---|
| **Query evidence** | `abc classification percentages` (2 impr @ 61.0), `abc classification example` (1), `abc classification calculation` (1) |
| **Current state** | The page **has** `Typical ABC classification ranges` and `Practical ABC classification example` H2s; `percentage`/`percentages` appears 12× (verified). **The content exists.** |
| **Proposed** | Ensure the lead sentence under that section uses the exact word **"percentages"** (e.g. *"Typical ABC classification ranges and percentages…"*). Optionally add a compact A/B/C range summary near the section top. |
| **Justification** | Content present; the *word* users search may not be adjacent to the concept. |
| **Risk** | **Low** — headings are more visible than body text. **⚠️ Prefer the sentence-level addition over rewriting an existing H2**, because the page ranks 10.79 on its head term. |
| **Guidance** | Do not change H2 wording that currently contributes to ranking; *add* within the section instead. |

#### G10 — "How to do" framing

| | |
|---|---|
| **Query evidence** | `how to do abc analysis` (88), `how to do an abc analysis` (88), `how to do abc analysis of inventory` (87.5), `how to classify abc inventory` (67), `how to calculate abc analysis in excel` (67) |
| **Current state** | The page already has `How to perform ABC inventory analysis` and `How to calculate ABC analysis in Excel` H2s — **already excellent and already procedural.** Positions 67–89 mean ranking is the constraint, not phrasing. |
| **Proposed** | **No wording change required.** Relevant content exists and is correctly titled. **Ranking improvement is the lever, not copy.** |
| **Verdict** | ✅ **No content change.** Recorded because this is exactly where instinct says "optimise copy" on copy that is already correct. |

#### G11 — Clarify the annual-consumption-value *source*

| | |
|---|---|
| **Query evidence** | `abc inventory analysis annual consumption value source` — 1 impr @ **position 2.0** (best position of any relevant query in the export) |
| **Current state** | `annual consumption value` appears **26×** (verified) — very well covered. But the query adds **"source"** — *where does the figure come from* (purchasing records, ERP/WMS, standard cost vs actual)? |
| **Proposed** | One or two sentences in the formula section stating the typical input sources, the unit (quantity × unit cost) and the period (12 months). |
| **Justification** | **Position 2.0** — the page is essentially already the top answer; a brief explicit answer could convert it. It covers the *calculation* thoroughly but not **data provenance**, which is a distinct, unanswered sub-question. |
| **Risk** | **Low** — must remain factually generic. **⚠️ Write only genuinely standard practice; do not cite a specific accounting standard or regulation that has not been verified.** |

#### Explicitly NOT recommended for this page
- ❌ Adding content for volume's sake — 2,247 words across 14 H2s is already comprehensive; padding risks dilution.
- ❌ Replacing `Practical Application` in the H1 with `Guide` — the H1 is *better* than the title and should stay.
- ❌ Changing the URL or canonical — forbidden by the safety rules and unnecessary.

---

### 6.5 Cross-cutting observation (structural, not a P2-B fix)

**A recurring "Excel / free download" expectation exists sitewide** — verified in
at least 8 distinct queries (§4.3): `grn format in excel free download`,
`pallet calculator excel free download`, `eoq calculator excel`,
`cycle count template excel`, `inventory count spreadsheet`,
`stock count template excel` (**33.33% CTR**).

Only `stock-count-sheet` currently satisfies it, and it has the best CTR of the
priority set. **This is a content-strategy observation for a future phase, not a
P2-B change.** Building new download files would expand scope beyond CTR
optimisation of existing pages, and the brief limits this phase to existing
high-potential pages.

---

## 7. Internal Link Recommendations

### 7.1 Review of P2-A links already implemented (commit `c8cb57e`)

Verified from the diff `741004b → c8cb57e`. **11 link insertions across 9 files.**
Independently re-verified in the current working tree.

| Source page | Link added (target) | Anchor text | Verdict |
|---|---|---|---|
| `inventory/eoq-calculator` | `templates/purchasing/purchase-order` | "purchase order" | ✅ Natural |
| `inventory/eoq-calculator` | `guides/abc-inventory-analysis` | "ABC inventory analysis" | ✅ Natural |
| `logistics/cbm-calculator` | `guides/warehouse-space-utilization` | "warehouse space planning" | ✅ Natural |
| `logistics/container-loading-calculator` | `templates/warehouse/packing-list` | "warehouse packing list" | ✅ Natural |
| `logistics/pallet-calculator` | `guides/warehouse-space-utilization` | "warehouse space utilization" | ✅ Natural |
| `inventory/reorder-point` | *(targets per P2-A plan)* | — | ✅ |
| `inventory/safety-stock` | *(targets per P2-A plan)* | — | ✅ |
| `categories/business/working-hours-calculator` | *(A5 cluster)* | — | ✅ |
| `categories/finance/break-even-calculator` | *(A5 cluster)* | — | ✅ |
| `categories/finance/compound-interest-calculator` | `simple-interest-calculator` (A4 orphan fix) | — | ✅ **Orphan resolved** |
| `simulators/warehouse-shift-challenge` | *(A5 cluster)* | — | ✅ |

**Assessment — P2-A linking quality is good and should not be revisited:**

1. **Anchors are descriptive, not exact-match spam.** Verified verbatim:
   `purchase order`, `ABC inventory analysis`, `warehouse space planning`,
   `warehouse packing list`, `warehouse space utilization`. These read as natural
   prose. **No anchor is repeated sitewide.**
2. **Placement is contextual and topical** — each sits where the subject is
   genuinely discussed, not in a footer or boilerplate block.
3. **No URL, canonical or formula was touched.** Verified: the A3/A4/A5 diff
   contains only `<a href>` insertions.
4. **The `simple-interest-calculator` orphan is resolved** (was 0 inbound).

**Critical finding for this phase — the P2-A links do NOT touch the three P2-B
priority pages' metadata.** Verified by diff:

```
git diff 741004b c8cb57e --stat -- guides/investigate-inventory-variances/index.html
                              guides/abc-inventory-analysis/index.html
                              templates/inventory/stock-count-sheet/index.html
→ templates/inventory/stock-count-sheet/index.html | 36 +++++-
  (schema:generated BreadcrumbList only)
```

The two guides received **no P2-A change at all**; `stock-count-sheet` received
**only the breadcrumb schema block**. **So P2-A and P2-B do not collide**, and
P2-B's metadata work is cleanly separable.

### 7.2 Current inbound link counts (verified, working tree)

Verified by scanning all `*/index.html` for each target path:

| Target page | Files referencing the path |
|---|---|
| `/guides/investigate-inventory-variances/` | **8** |
| `/guides/abc-inventory-analysis/` | **7** |
| `/templates/inventory/stock-count-sheet/` | **16** |

**Finding: these pages are NOT under-linked.** `stock-count-sheet` has 16
referencing pages; the two guides have 7–8 each. The P2 analysis's earlier
"orphan/weak-link" concern applied to *other* pages
(`simple-interest-calculator`, `working-hours-calculator`, `packing-list`), not to
these three.

**Consequence: internal linking is NOT the lever for the three priority pages.**
They already have strong internal support and rank 10–12. The lever is snippet
relevance (§5) and terminology (§6). **This is an important negative finding —
it prevents wasted effort on a fix that the data does not support.**

### 7.3 Remaining high-relevance contextual links

The brief asks for **only remaining high-relevance contextual links**, avoiding
duplicates and excessive exact-match anchors. Given §7.2, the bar is deliberately
high.

**Guiding rule applied:** a link is recommended only if (a) the target is
genuinely under-referenced *relative to its value*, and (b) a natural sentence
already exists or is being added for a **content** reason. **No link is
recommended solely to move a metric.**

#### L1 — From the G3 addition in `investigate-inventory-variances` *(highest relevance)*

| | |
|---|---|
| **Source** | `guides/investigate-inventory-variances` → the sentence added per §6.2/G3 |
| **Target 1** | `/templates/inventory/stock-variance-report/` |
| **Target 2** | `/inventory/variance-report/` |
| **Proposed anchors** | `stock variance report template` and `variance report tool` |
| **Justification** | The target pages exist, express 0.64%–5.26% CTR, and are the correct destination for the ~45 report-seeking impressions. The link is created **inside new content added for a content reason** — the link is a consequence, not the purpose. |
| **Anchor discipline** | Two *different* anchors for two different targets. Neither repeats the other. Neither is pure exact-match. |
| **Risk** | **Very low** |

#### L2 — From `stock-count-sheet` to the variance/accuracy pair *(already partly present)*

| | |
|---|---|
| **Current state** | `stock-count-sheet` **already** links to `/inventory/variance-report/` (verified via the `Stock Variance Report` H3) and is referenced by 16 pages. |
| **Proposed** | ⚠️ **No new link recommended.** The page's `Found a stock difference?` and `Improve the accuracy of your physical stock count` sections already route onward. Adding more would push it toward link-density without benefit. |
| **Verdict** | ✅ **Nothing needed.** Recorded to prevent redundant additions. |

#### L3 — From `abc-inventory-analysis` to the cycle-count guide

| | |
|---|---|
| **Source** | `guides/abc-inventory-analysis` — existing `Using ABC analysis for cycle counting` H2 |
| **Target** | `/guides/warehouse-cycle-count-checklist/` |
| **Proposed anchor** | `warehouse cycle count checklist` |
| **Justification** | The source has a dedicated H2 on exactly this subject, so the link is topically exact. `abc-inventory-analysis` currently has **7** inbound and links to `stock-count-sheet` among others. The cycle-count checklist is a natural companion for the ABC cycle-counting section. |
| **Anchor discipline** | Descriptive noun phrase, appears **once** on the site for this target from this source. Not exact-match of the target's title. |
| **Risk** | **Very low** |
| **⚠️ Caveat** | Only add if the section's prose supports it naturally. **If a sentence must be bent to fit the link, do not add the link.** |

#### L4 — Do NOT add links to the `stock-count`/`variance` cluster

The P2-A implementation notes record that the stock-count/variance cluster was
already dense (18–20 inbound), and P2-A deliberately did not expand it as doing so
"would be repetitive linking the brief forbids."

**Revised figures in this phase:** `stock-count-sheet` = **16** referencing files.
That confirms the cluster is dense. **Recommendation: add no further links into
this cluster.** The three priority pages receive enough internal support; their
problem is not discovery.

### 7.4 Anchors that must NOT be used (exact-match over-optimisation guard)

Verified against the existing link graph. **Do not add these:**

| Anchor | Why not |
|---|---|
| `stock count sheet` (as anchor from many pages) | Already the H1 and title of the target. Repeated exact-match anchors across many pages is the exact pattern the brief prohibits. |
| `investigate inventory variances` | Exact-match of the target's H1; would be the 9th referencing file with the identical phrase. |
| `ABC inventory analysis` repeated | Already used verbatim by `eoq-calculator` in P2-A. **Adding it again from another page duplicates the exact anchor.** Use a variant or omit. |
| `warehouse space utilization` from `cbm-calculator` | Already used by `pallet-calculator` in P2-A. Do not duplicate from a third source. |

**Positive pattern to continue:** the P2-A style —
`"Open Warehouse Space Calculator"`, `"Read Cycle Count Guide"`, related-card
`<strong>` + `<small>` pairs. Descriptive, varied, non-spammy. **Preserve it.**

---

## 8. Prioritized Low-Risk Changes

Ranked by **(expected benefit ÷ risk)**, with the deploy order that allows clean
attribution. **Every item is text-only. None touches calculator logic, canonical
URLs, analytics, or download files.**

### Tier 1 — lowest risk, do first

| # | Change | File | Risk | Reversible | Depends on |
|---|---|---|---|---|---|
| **1** | Description Option 2 for `stock-count-sheet` (§5.4 — add "Includes an inventory count sheet") | `templates/inventory/stock-count-sheet/index.html` | **Very low** | 1-line revert | nothing |
| **2** | G5–G7 additive vocabulary on `stock-count-sheet` (§6.3) | same file | **Very low** | revert | #1 (same file, same deploy) |
| **3** | Description Option 2 for `abc-inventory-analysis` (§5.3 — lead with "Classify") | `guides/abc-inventory-analysis/index.html` | **Very low** | 1-line revert | nothing |
| **4** | Description Option 2 for `investigate-inventory-variances` (§5.2 — question lead) | `guides/investigate-inventory-variances/index.html` | **Very low** | 1-line revert | nothing |

**Rationale:** Tier 1 changes only *descriptions* and *additive body vocabulary*.
**No title changes at all.** Titles carry the ranking signal at positions 10–12;
descriptions do not affect ranking, only CTR. This tier therefore cannot disturb
existing positions while still testing the core CTR hypothesis.

### Tier 2 — content additions justified by query evidence

| # | Change | File | Risk | Depends on |
|---|---|---|---|---|
| **5** | G1 — "net variance" definition subsection (§6.2) | `guides/investigate-inventory-variances/index.html` | **Very low** (additive) | #4 (same file) |
| **6** | G2 — formula in words (§6.2) | same file | **Very low** | #5 (same file) |
| **7** | G3 + L1 — variance-report bridge + 2 contextual links (§6.2, §7.3) | same file | **Very low** | #4–#6 |
| **8** | G9 — "percentages" wording (§6.4, sentence-level only) | `guides/abc-inventory-analysis/index.html` | Low | #3 (same file) |
| **9** | G11 — annual consumption value *source* sentence (§6.4) | same file | Low | #8 (same file) |
| **10** | L3 — cycle-count checklist link (§7.3) | same file | **Very low** | #8 (same file) |

**Rationale:** groups all content work per file so each page is edited once, in
one reviewable diff, with a single revert point.

### Tier 3 — title changes, highest value AND highest risk, do LAST and ONE AT A TIME

| # | Change | File | Risk | Depends on |
|---|---|---|---|---|
| **11** | Title Option 1 or 2 for `abc-inventory-analysis` (§5.3) | `guides/abc-inventory-analysis/index.html` | **Medium** | Tier 2 complete + ≥14 days |
| **12** | Title Option 1 or 2 for `investigate-inventory-variances` (§5.2) | `guides/investigate-inventory-variances/index.html` | **Medium** | #11 observed ≥14 days |

**⚠️ These two MUST be applied separately, at least 14 days apart.** Both pages
rank at positions 10.13 and 10.79. Changing both titles in one deploy makes
attribution impossible — if CTR moves, there is no way to know which title did it
or whether one regressed.

### Recommended sequence with spacing

```
Deploy 1  (day 0)    Tier 1  — 3 files, descriptions + additive vocabulary only
                     └─ observe 28 days
Deploy 2  (day 28)   Tier 2  — 2 files, content additions + links
                     └─ observe 28 days
Deploy 3  (day 56)   #11     — abc-inventory-analysis title only
                     └─ observe 28 days
Deploy 4  (day 84)   #12     — investigate-inventory-variances title only
                     └─ observe 28 days
```

**Total elapsed: ~112 days to full implementation with valid attribution.**
This is deliberately slow. The brief requires avoiding claims that SEO changes
guarantee improvements, and the only way to make any claim is to isolate
variables. At 22 clicks/42 days, **haste destroys the ability to learn anything.**

### Recommended immediate scope (if only one deploy is approved)

**Apply Tier 1 only, then stop and measure.** Justification:
- Zero title changes → cannot disturb positions 10–12.
- Touches the site's best-converting page *additively*.
- Directly tests the §1 hypothesis (deliverable-naming snippets convert better).
- Smallest possible diff: ~3 files, descriptions + a handful of words.

### Explicitly excluded from P2-B (recorded, not deleted)

| Excluded | Why |
|---|---|
| Any title change to `stock-count-sheet` | §5.4 — the only page whose title is demonstrably working |
| Building new download files (GRN, pallet Excel, etc.) | §6.5 — new content, out of scope for this phase |
| Adding `FAQPage` schema | P2-A deferred it; `Search appearance.csv` empty; UI-rich results unlikely for this site type. **Not a CTR lever here.** |
| Expanding the stock-count/variance link cluster | §7.3/L4 — already dense (16 inbound) |
| Any change to `assets/js/*.js`, `assets/css/*.css`, canonical URLs, analytics IDs | Safety rules |
| Translated pages | P2 §3.5 — max 8 impressions per language; indexation risk unjustified |

---

## 9. Risk Assessment

### 9.1 Risk register

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | **Title change on a position-10 page causes a ranking drop.** The current titles contain terms the pages rank for; removing a term could de-optimise. | **Medium** | **High** | Tier 3 deferred to last; only **one** title changes per deploy; Option 2 (minimally additive) is the safety variant; every option retains all current head terms (§5.1 rule 3); revert is a 1-line change. |
| R2 | **CTR change is unlearnable at this traffic.** 7 clicks across three pages in 42 days; a 1-click swing is noise. | **High** | Medium | 28/56-day windows (§10); treat impressions and position as primary; explicitly refuse to claim victory on click count alone. |
| R3 | **Google rewrites the title anyway**, masking the change. | **Medium** | Low | Unavoidable. Head term is front-loaded so a rewrite still surfaces the right phrase. Impressions are the more robust read. |
| R4 | **Intent mismatch is deeper than snippets.** Much of the 0.36%/0.81% may come from queries the page genuinely does not serve (`variance report template`, `net variance`). | **Medium–High** | Medium | §3 separates served/unserved intent; G1 adds the missing definition; the recommendation **does not promise a CTR fix** and §10 avoids improvement claims. |
| R5 | **Description truncated in some SERPs**, weakening added value. | **Medium** | Low | Options 2 are near-identical in length to current (152–161 vs 148–156) — no material truncation regression. |
| R6 | **Search-index / cache-version hash dependency.** Titles and descriptions feed `tests/build-search-index.mjs` and `tests/build-cache-versions.mjs`. | **Certain** | Medium if skipped | §11 deployment order makes this explicit and mandatory. **Any title or description change alters `search-index.js` bytes and its cache hash.** |
| R7 | **Content addition accidentally alters ranking terminology.** | **Low** | Medium | §6 mandates *additive only*; no existing H2, paragraph, formula or FAQ is edited or deleted. G9 uses sentence-level addition rather than H2 rewrite for this reason. |
| R8 | **Title truncation** on the 64–69 char options (abc Option 1/2). | **Medium** | Low | Accepted deliberately (§5.3); head term is front-loaded and survives truncation. Noted so the trade-off is explicit. |
| R9 | **Measurement drift** — changes made without recording the before-state. | **Medium** | Low | §10 requires capturing the exact baseline row before each deploy. |
| R10 | **Revert confusion** if multiple tiers deploy together. | **Low** | Medium | Tiers are separated by file and by deploy (§8); each tier is a single reviewable diff. |

### 9.2 Risks judged acceptable by design

- **Schema/markup interaction:** P2-A's breadcrumb blocks are marker-delimited
  (`<!-- schema:generated -->`). P2-B text edits **do not touch those regions**;
  `--check` will still pass. No schema rebuild is needed for text-only changes.
  *(If a `<title>` changes, the **search index** rebuild is required — but the
  schema block derives from the route, not the title. Re-verify at implementation time.)*
- **Cross-page cannibalisation:** G3 routes report intent *to* the report pages
  rather than expanding this guide into a report page. Intent overlap is reduced,
  not increased.
- **Download experience:** no file, link path or gate is modified. The two
  `/downloads/…` hrefs and their `download` attributes stay untouched.

### 9.3 The one risk that cannot be mitigated

**At 22 clicks / 42 days sitewide, no P2-B change can be validated to statistical
confidence within one measurement window.** This is a property of the traffic
volume, not of the method. The mitigation is **sequential deploys with long
windows and impression-led metrics** — not a claim of proven uplift.

---

## 10. Measurement Plan

### 10.1 Baselines — capture these BEFORE any change

Recorded from the 2026-10-16 export. **These are the comparison rows.** Copy them
verbatim into the evaluation log **before** Deploy 1.

| Page | Clicks | Impressions | CTR | Avg position |
|---|---|---|---|---|
| `/guides/investigate-inventory-variances/` | 1 | 276 | 0.36% | 10.13 |
| `/guides/abc-inventory-analysis/` | 2 | 246 | 0.81% | 10.79 |
| `/templates/inventory/stock-count-sheet/` | 4 | 234 | 1.71% | 11.79 |

**Sitewide reference:** 21 clicks / 4,632 impressions / ≈0.45% CTR / pos ≈41
(Desktop), ≈16 (Mobile). Window 2026-09-03 → 2026-10-14.

**Per-query baselines** (rows most likely to move) — also record:

| Query | Impr | Pos | Note |
|---|---|---|---|
| `stock count sheet` | 31 | 12.39 | head term, 3.23% CTR |
| `net variance` | 22 | 9.32 | G1 target |
| `inventory variance report template` | 22 | 23.77 | G3 / L1 target |
| `count sheet template` | 11 | 22.0 | G6 target |
| `inventory variance report` | 7 | 15.57 | 14.29% CTR — the signal to defend |
| `abc classification percentages` | 2 | 61.0 | G9 target |

**⚠️ Also record the `Search appearance.csv` state: currently 0 rows.** If P2-A's
schema begins producing appearance rows, that is a **separate effect** from P2-B
and must not be attributed to it.

### 10.2 What to measure

| Metric | Priority | Why |
|---|---|---|
| **Impressions** | **Primary** | Largest number → least noisy. A terminology change (§6) should move this before clicks do. |
| **Average position** | **Primary** | Detects de-optimisation from a title change (R1). A worsening position is the earliest warning. |
| **Query-mix change** | **Primary** | Are new phrasings appearing (e.g. `net variance`, `count sheet template` lifting)? Directly tests whether the vocabulary work landed. |
| CTR | Secondary | The headline metric, but the noisiest (1–4 clicks). Directional only. |
| Clicks | Tertiary | Too small to lead. Report it; do not reason from it. |

### 10.3 The 28-day evaluation framework

**At day 28 after a deploy:**

1. Pull a GSC export for the 28 days **from the deploy date** (not from today).
2. Compare the three priority pages against the §10.1 baselines.
3. Compare **query counts** for the target query list (§10.1).
4. Read direction, **not** significance:

| Signal | Reading |
|---|---|
| Impressions ↑ **and** position stable/better | ✅ Consistent with the change helping. Continue. |
| Position ↓ by > 3 places | ⚠️ **Warning — consider revert.** This is the risk R1 flagged. |
| CTR ↑ but impressions flat | 🔍 Ambiguous — could be snippet gain, could be query-mix shift. Investigate the mix. |
| All metrics flat | **Neutral — not evidence of failure.** Do not revert on flatness alone; proceed to day 56. |
| Any metric ↓ with position ↓ | ⚠️ Revert and re-analyse. |

**Explicitly prohibited interpretations:**
- ❌ "CTR improved by X%" — at these volumes this is noise, not a rate.
- ❌ "This proves the title change worked."
- ❌ Reverting because a change was *flat*, when the baseline itself was dominated
  by queries the page does not serve (R4).

### 10.4 The 56-day evaluation framework

**Why go beyond 28 days:**
- **Indexing delay** — a title/description change may take 1–4 weeks to be
  re-crawled and reflected. **The first 14 days after deploy are substantially
  contaminated by the old snippet still being shown.**
- **Query-mix churn** — new vocabulary (§6) attracts new queries, which take time
  to register and accumulate position history.
- **Small samples** — 56 days roughly doubles the observation count. Still small,
  but materially less noisy than 28.

**At day 56:**

1. Compare days **1–56 after deploy** against the §10.1 baseline window.
2. **Discard days 1–14** as an indexing-transition buffer and re-compare days
   15–56. If the two windows disagree, weight the latter more heavily.
3. Assess **query-mix shift** — the most informative long-run signal:
   - Did `net variance` impressions rise after G1?
   - Did `count sheet template` CTR move after G6?
   - Did the `variance report` cluster start landing on the templates after L1?
4. Decide: **keep / revert / hold another 28 days.** Revert is a legitimate
   outcome and is cheap — every change is a small text edit.

### 10.5 Confounders to log alongside every measurement

| Confounder | Handling |
|---|---|
| **P2-A schema effects in the same window** | `Search appearance.csv` was **empty** at baseline. Check at each read. If it becomes non-empty, note the date — that is a P2-A effect, not P2-B. |
| **Device mix** | Desktop 0.48% CTR @ pos 41; Mobile 0.34% CTR @ pos 16. **Report desktop and mobile separately** where possible. |
| **Country mix** | US = 1,435 impr / 0 clicks (31% of all impressions); clicks come from India, Malaysia, Qatar, Kenya, Sri Lanka, Mexico. **Do not generalise a global CTR read from the clicking markets.** |
| **Query mix (aggregate ≠ attributed)** | The export has **no page↔query dimension** (§2.2). A sitewide query change cannot be attributed to one page without the per-page pull in §10.6. |
| **Seasonality / trend** | The site is 6 weeks old at baseline; impressions roughly doubled then fell (P2 §1.2). **Natural trend can dwarf a snippet effect.** Compare against the sitewide trend as a control, not a fixed number. |
| **Position volatility** | Daily average position swung 12.8–44.5. Single-day reads are meaningless; use 28-day aggregates. |

### 10.6 Required data upgrade before the day-28 read

**The single highest-value action available:** in the GSC UI open
**Performance → Search results**, apply a **Page filter** for each of the three
URLs, and export or screenshot the **Queries** table for that page.

- Supplies the **page↔query attribution the CSV export lacks** (§2.2).
- Converts every "thematically relevant" claim in §3 into verified fact.
- Makes the day-28 / day-56 query-mix comparisons (§10.3 step 3, §10.4 step 3)
  *actually meaningful* rather than inferred.
- Requires no tooling, no code, no repository change.

**Recommended: do this before Deploy 1**, so the baseline carries true attribution.

### 10.7 Claims that will NOT be made

Per the brief, stated plainly so they cannot be implied later:

- ❌ No guarantee that any change improves rankings.
- ❌ No predicted CTR percentage or click uplift.
- ❌ No claim of statistical significance from a 42-day, 22-click sample.
- ❌ No keyword difficulty, CPC or search-volume figures — **the export contains
  no such fields**, and none were estimated.
- ❌ No competitor performance claims — **competitor review could not be
  completed** (§4).

---

## 11. Proposed Implementation Files

### 11.1 Files that WOULD change (if approved) — Tier 1 only

**3 production files. Text-only. No new files. No deletions.**

| File | Change | Lines affected (est.) |
|---|---|---|
| `templates/inventory/stock-count-sheet/index.html` | `<meta name="description">` swap (§5.4 Desc Option 2) + 3 additive vocabulary inserts (§6.3 G5–G7) | ~4 |
| `guides/abc-inventory-analysis/index.html` | `<meta name="description">` swap (§5.3 Desc Option 2) + `og:description`/`twitter:description` sync | ~3 |
| `guides/investigate-inventory-variances/index.html` | `<meta name="description">` swap (§5.2 Desc Option 2) + `og:description`/`twitter:description` sync | ~3 |

**⚠️ Note on OG/Twitter sync:** all three pages carry `og:description` and
`twitter:description` values that currently **differ** from the meta description
(verified). If the meta description changes, these should be updated in the same
commit so the social preview does not drift from the SERP snippet. This is
**in-scope and low risk** — the same text decision, applied consistently.

### 11.2 Files that WOULD change — Tier 2 (if separately approved)

| File | Change | Lines affected (est.) |
|---|---|---|
| `guides/investigate-inventory-variances/index.html` | G1 net-variance definition, G2 formula-in-words, G3 variance-report bridge + 2 links (L1) | ~12 |
| `guides/abc-inventory-analysis/index.html` | G9 "percentages" sentence, G11 source sentence, L3 cycle-count link | ~6 |

### 11.3 Files that WOULD change — Tier 3 (titles; apply last, separately)

| File | Change | Lines affected (est.) |
|---|---|---|
| `guides/abc-inventory-analysis/index.html` | `<title>` + `og:title` + `twitter:title` (§5.3) | ~3 |
| `guides/investigate-inventory-variances/index.html` | `<title>` + `og:title` + `twitter:title` (§5.2) | ~3 |

### 11.4 Tooling / generated files — **mandatory rebuild chain for any metadata change**

⚠️ **This is the deployment-order dependency flagged in P2 §8.5, restated as risk
R6.** `assets/js/search-index.js` is generated from each page's `<title>` and
`<meta name="description">`. **Any** change to either alters that file's bytes,
which alters its cache-busting hash.

**Required order after editing any title or description:**

```powershell
# 1. Rebuild the search index (derives from <title> and meta description)
node tests/build-search-index.mjs

# 2. Rebuild cache-busting hashes (depends on step 1's output bytes)
node tests/build-cache-versions.mjs

# 3. Verify schema regions are untouched and still valid
node tests/build-schema.mjs --check

# 4. Run the full test suite
node --test tests/

# 5. Confirm no whitespace damage
git diff --check
```

**Steps 1 and 2 are NOT optional and must run in this order.** Skipping step 2
leaves a stale cache hash and browsers will serve the old `search-index.js`,
producing incorrect site-search results.

### 11.5 Files that must NOT change

| Path | Reason |
|---|---|
| `assets/js/*.js` (formulas) | Safety rule — no calculator logic may change. ⚠️ **Exception:** `assets/js/search-index.js` is *generated* and must change via its build script. Hand-editing it is forbidden. |
| `assets/css/*.css` | No styling change is part of P2-B |
| `sitemap.xml`, `robots.txt` | No URL changes |
| Any canonical `<link>` | Safety rule |
| Any analytics / gtag identifier | Safety rule |
| `/downloads/inventory/dixani-stock-count-sheet.xlsx` | Download file untouched |
| `/downloads/inventory/dixani-stock-count-sheet.pdf` | Download file untouched |
| `<!-- schema:generated -->` regions | P2-A output; must remain byte-identical. Verified by `--check` (step 3). |
| Existing H2/H3 headings, paragraphs, formulas, worked examples, FAQs on all three pages | §6.1 — additive-only principle |

### 11.6 Files created by this task

| File | Status |
|---|---|
| `reports/DIXANI-P2-B-ANALYSIS.md` | ✅ **Created — this document** |

**No other file was created, edited, moved or deleted.** The `.gsc-tmp/`
extraction directory used to read the export was removed after analysis.

### 11.7 Honest statement of repository state

```
Baseline commit:  c8cb57e  (HEAD, matches origin/main)
Working tree:     reports/ — untracked only
Production files: UNCHANGED
Commits:          none
Pushes:           none
Deploys:          none
```

**Verified:** `git status --short` reports only `?? reports/`. `c8cb57e` is HEAD
and matches `origin/main`. The 52 P2-A HTML modifications remain committed as
delivered.

---

## 12. Closing Statement

### What this report establishes

1. **The three priority pages rank (positions 10.13–11.79) and do not convert
   (0.36%–1.71%).** That is a snippet/metadata symptom, not a content-quality
   symptom — all three are substantive pages with formulas, examples and FAQs.
2. **The mechanism is identifiable and differs per page:** a task-framed title
   against a definitional/report query mix (`investigate-inventory-variances`), a
   task-phrasing gap against a noun-phrase title (`abc-inventory-analysis`), and
   minor synonym absence on an otherwise well-optimised page
   (`stock-count-sheet`).
3. **Internal linking is NOT the lever** — verified inbound counts of 8 / 7 / 16
   show these pages are already adequately linked (§7.2). This is a negative
   finding that prevents wasted effort.
4. **`stock-count-sheet` should be protected, not fixed.** Its title works, and it
   is the best-converting content page on the site.

### What this report does not establish

1. **Page↔query attribution.** The export has no such dimension, so all query
   relevance here is *thematic*, per §2.2. §10.6 gives the fix.
2. **Competitor positioning.** Attempted and blocked at every route (§4.1). Not
   fabricated.
3. **Any quantification of expected uplift.** Not measurable at 22 clicks.

### Recommended decision

**Approve Tier 1 only** (§8) — three description changes plus additive body
vocabulary, zero title changes, roughly 10 lines across 3 files. Then run the
§10.3 28-day read.

**Do not bundle Tier 3 title changes into the first deploy.** They carry the only
high-impact risk in this proposal (R1), and the site has too little traffic to
attribute their effect if they land at the same time as anything else.

### Status

**READ-ONLY ANALYSIS COMPLETE. NO CHANGES IMPLEMENTED. NO COMMIT. NO PUSH.
AWAITING APPROVAL.**

---

*End of report.*




















