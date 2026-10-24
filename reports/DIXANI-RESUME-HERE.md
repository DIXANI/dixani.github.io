# DIXANI — Resume Here (single source of truth for "continue site improvement")

**Purpose:** If a new chat session is asked to *"continue the DIXANI site improvement"*,
**read this file first** and start from the checkpoint below. Do **not** re-run the
completed audit work.

**Last updated:** 2026-10-24
**Repo:** `https://github.com/DIXANI/dixani.github.io` (local: `C:\Users\DELL\Documents\Website\dixani.github.io`)
**Branch:** `main`
**Working tree:** clean (nothing uncommitted)
**HEAD = origin/main =** `0a0b9ab`

---

## 0. Where we are right now (read this first)

| Question | Answer |
|---|---|
| Is anything blocked or uncommitted? | No — tree clean, all pushed |
| What is the next *content* work? | **Tier 2** (§4) — but **only after ~2026-11-13** |
| Why the wait? | Tier 1 deployed **2026-10-16**; needs 28 days to measure |
| What was just finished? | Zero-risk work (§5c): stub check ✅, indexing confirmed ✅, `lastmod` rejected ⛔ |
| What should happen next? | **Export fresh GSC data** (2026-10-16 → now) to get the first Tier 1 read |

**⚠️ Timing gate: do NOT deploy Tier 2 content before ~2026-11-13.** Tier 1 went live
2026-10-16 and the observation window is 28 days. Deploying earlier makes Tier 1's
effect unmeasurable. See §4 for the rationale.


---

## 1. Current checkpoint — nothing pending

> Superseded by §0 above; kept because §0 is a summary and this is the detail.

| Item | State |
|---|---|
| Local `HEAD` | `0a0b9ab` *(before the 2026-10-24 zero-risk commit)* |
| `origin/main` | `0a0b9ab` (identical — `rev-list --left-right --count` = `0  0`) |
| Uncommitted changes | **none** |
| Last session's work | **committed AND pushed** |

### Last commits (newest first)

```
0a0b9ab  Add resume checkpoint for continuing DIXANI site improvement
f64707b  Add related tool, template and guide links to four new guides
cc64997  Fix guide structure and styling for four new guides
9e1288d  Add warehouse capacity cost and container stuffing guides
ac78bb7  Add safety stock and cycle count scheduling guides
```

**Do not amend `cc64997`, `f64707b` or `0a0b9ab`.** They are already on the remote.
Any further work must be a **new forward commit**.
## 2. What is DONE (do not redo)

### 2.1 Four new guides — created, repaired, and fully linked

The four newest guides were added, then repaired for a wrong stylesheet and
structural corruption (content appearing after `</html>`), then given the four
missing sections (author bio, FAQ, worked example, CTA), then given full internal
linking. All work is committed and live.

Guides (9 total on disk, all structurally valid):

```
abc-inventory-analysis              (older)
investigate-inventory-variances     (older)
warehouse-cycle-count-checklist     (older)
warehouse-space-utilization         (older)
inventory-accuracy-percentage       (older)
safety-stock-explained              <- new
cycle-count-scheduling              <- new
warehouse-capacity-storage-cost     <- new
container-stuffing-load-planning    <- new
```

### 2.2 Internal linking (commit `f64707b`)

Each of the four new guides now ends with a "Use free DIXANI resources" box
pairing one online tool with the Excel/PDF formats for the same job:

| Guide | Tool linked | Formats linked |
|---|---|---|
| `safety-stock-explained` | Inventory Turnover Calculator | Reorder Level Tracker, Inventory Master List |
| `cycle-count-scheduling` | Inventory Accuracy Analyzer, Variance Report | Stock Count Sheet, Variance Report |
| `warehouse-capacity-storage-cost` | Inventory Turnover Calculator | Picking List, Stock Transfer Form |
| `container-stuffing-load-planning` | CBM Calculator | Packing List, Goods Received Note |

Plus in-prose tool links and cross-links to previously unlinked siblings
(`inventory-accuracy-percentage`, `warehouse-cycle-count-checklist`,
`abc-inventory-analysis`, `cycle-count-scheduling`, `safety-stock-explained`).

Resulting link density — the four new guides now **exceed** the older guides:

| guide | prose | action-box | templates | tool links | broken TOC |
|---|---|---|---|---|---|
| abc-inventory-analysis | 0 | 5 | 4 | 9 | 0 |
| investigate-inventory-variances | 4 | 4 | 9 | 10 | 0 |
| warehouse-cycle-count-checklist | 0 | 4 | 5 | 9 | 0 |
| **safety-stock-explained** | 5 | 5 | 5 | 14 | 0 |
| **cycle-count-scheduling** | 5 | 5 | 5 | 12 | 0 |
| **warehouse-capacity-storage-cost** | 5 | 5 | 5 | 14 | 0 |
| **container-stuffing-load-planning** | 4 | 5 | 5 | 14 | 0 |

**All 88 internal page links in the four new guides verified to resolve** to real
files on disk. Every link target was confirmed to exist *before* being added.

### 2.3 Test infrastructure added

`tests/check-guide-structure.mjs` — validates all 9 guides are structurally sound.
Reports `9/9 guides structurally valid`.

---

## 3. How to validate (run these — there is no `package.json`)

All commands are run from the repo root. **There is no `npm test`** — tests are
standalone `.mjs` files executed directly.

```powershell
# 1. Structural check on all guides -> expect "9/9 guides structurally valid"
node tests/check-guide-structure.mjs

# 2. Full unit suite -> expect pass=97  fail=0
foreach ($f in Get-ChildItem tests -Filter '*.test.mjs' -File) { node --test $f.FullName }

# 3. Generated schema is current -> expect "OK: all generated schema is current."
node tests/build-schema.mjs --check

# 4. Regenerate search index (run after any description/content change)
node tests/build-search-index.mjs

# 5. Cache-busting stamps (run after changing CSS/JS)
node tests/build-cache-versions.mjs
```

**Mandatory rebuild chain:** after editing any page's description or body text,
run `build-search-index.mjs`; after changing CSS/JS, run `build-cache-versions.mjs`.
Both regenerate files that are tracked in git, so they belong in the same commit.

**Test files present:** `add-social-meta.mjs`, `audit-2026-10-19.test.mjs`,
`build-cache-versions.mjs`, `build-schema.mjs`, `build-search-index.mjs`,
`cache-version.test.mjs`, `check-guide-structure.mjs`, `meta-outliers.mjs`,
`page-inventory.mjs`, `pallet-calculator.test.mjs`, `schema.test.mjs`,
`site-integrity.test.mjs`, `site-search.test.mjs`

---

## 4. NEXT WORK — the real backlog (from `reports/DIXANI-P2-B-ANALYSIS.md` §8)

**Source of truth for remaining work:** `reports/DIXANI-P2-B-ANALYSIS.md` §8
("Prioritized Low-Risk Changes"). Status of each item:

### Tier 1 — ✅ DONE (see `reports/DIXANI-P2-B-TIER1-IMPLEMENTATION.md`)

Items #1–#4 (description swaps on `stock-count-sheet`, `abc-inventory-analysis`,
`investigate-inventory-variances`, plus G5–G7 additive vocabulary). Item "G1 net
variance definition" was also applied as it was explicitly requested.

### Tier 2 — ❌ NOT STARTED ← **this is the next batch**

| # | Change | File | Risk |
|---|---|---|---|
| **5** | G1 — "net variance" definition subsection (§6.2) | `guides/investigate-inventory-variances/index.html` | Very low (additive) |
| **6** | G2 — formula in words (§6.2) | same file | Very low |
| **7** | G3 + L1 — variance-report bridge + 2 contextual links (§6.2, §7.3) | same file | Very low |
| **8** | G9 — "percentages" wording (sentence-level only) (§6.4) | `guides/abc-inventory-analysis/index.html` | Low |
| **9** | G11 — annual consumption value *source* sentence (§6.4) | same file | Low |
| **10** | L3 — cycle-count checklist link (§7.3) | same file | Very low |

**Tier 2 is grouped per file** so each page is edited once in a single reviewable diff.

### Tier 3 — ❌ NOT STARTED (do LAST, one at a time)

| # | Change | File | Risk |
|---|---|---|---|
| **11** | Title Option 1 or 2 (§5.3) | `guides/abc-inventory-analysis/index.html` | Medium |
| **12** | Title Option 1 or 2 (§5.2) | `guides/investigate-inventory-variances/index.html` | Medium |

> ⚠️ **#11 and #12 MUST be applied at least 14 days apart.** Both pages rank at
> positions 10.13 and 10.79. Changing both titles in one deploy makes attribution
> impossible.

### Recommended deploy sequence (from §8)

```
Deploy 1  (day 0)    Tier 1  — 3 files, descriptions + additive vocab   [DONE]
                     └─ observe 28 days
Deploy 2  (day 28)   Tier 2  — 2 files, content additions + links       [NEXT]
                     └─ observe 28 days
Deploy 3  (day 56)   #11     — abc-inventory-analysis title only
                     └─ observe 28 days
Deploy 4  (day 84)   #12     — investigate-inventory-variances title only
```

Tier 1 deployed **2026-10-16**. Tier 1 was deployed ahead of the 28-day spacing, so
**the 28-day observation window does not close until ~2026-11-13.** Before starting
Tier 2, check the real date:

- **Before ~2026-11-13** → the correct action is to **wait, not write**. Deploying
  Tier 2 now makes Tier 1's effect unattributable, which forfeits the whole point of
  the staged plan. (Confirmed reasoning: at 21 clicks/42 days the signal is barely
  above noise — measurement is the scarce resource, not content.)
- **On/after ~2026-11-13** → deploy Tier 2.

**Zero-risk work that does NOT break attribution** (safe during the wait): anything
invisible to the SERP — correctness fixes, internal plumbing, local verification.
Already done in the 2026-10-24 pass (§5c). **Do not** make further SERP-visible edits
(titles, descriptions, body copy) during the window.


### Explicitly EXCLUDED from this phase (recorded, not deleted)

| Excluded | Why |
|---|---|
| Any title change to `stock-count-sheet` | It is the only page whose title is demonstrably working |
| Building new download files (GRN, pallet Excel, etc.) | New content, out of scope for this phase |
| Adding `FAQPage` schema | Search-appearance data is empty; unlikely UI-rich results for this site type |
| Expanding the stock-count/variance link cluster | Already dense (16 inbound links) |

### Constraint that applies to ALL remaining work

**Every §8 item is text-only.** None may touch calculator logic, canonical URLs,
analytics, or download files. Titles are the highest-risk element — Tier 1
deliberately changed **zero** titles.

---

## 5. Open items — RESOLVED 2026-10-24

### 5.1 ✅ Stub check on the four linked tool pages — PASSED

Verified 2026-10-24. All four are substantive full pages, **not stubs**. The links
added in `f64707b` are safe; no swap required.

| Tool | Words | h1 | h2 | Script |
|---|---|---|---|---|
| `inventory/inventory-turnover` | 1,582 | 1 | 9 | dedicated (3 KB) |
| `inventory/inventory-accuracy-analyzer` | 1,261 | 1 | 6 | dedicated (22.7 KB) |
| `inventory/variance-report` | 1,791 | 1 | 10 | shared `assets/js/inventory.js` |
| `logistics/cbm-calculator` | 1,657 | 1 | 11 | dedicated (6.5 KB) |

> Note for future stub checks: `variance-report` has **no** dedicated
> `assets/js/variance-report.js` — it uses the shared `assets/js/inventory.js`.
> A naive "does `<slug>.js` exist" test gives a false positive here.

### 5.2 ✅ All four new guides are INDEXED (user-confirmed 2026-10-24)

The four guides added in `ac78bb7`/`9e1288d` went live 2026-10-20 and are all
confirmed indexed in Google. The technical indexability signals are working — no
action needed on canonical/robots/sitemap presence for these pages.

---

## 5b. ⛔ REJECTED — do not re-attempt: `sitemap.xml` lastmod backfill

**Task:** audit item P2 #10 — *"Add `<lastmod>` to the 59 sitemap URLs currently
missing it (aids recrawl)."*

**Decision 2026-10-24: REJECTED (again). Do not attempt without new information.**

`DIXANI-P1-REPORT.md` §11 already deferred this, with the objection:

> *"Requires an accurate change-date source; guessing dates is worse than omitting them."*

That objection was **re-tested on 2026-10-24 and it still holds.** Git looks like it
supplies the missing date source, but it does **not** supply the right one:

| Finding | Value |
|---|---|
| Repo created | 2026-08-16 |
| Total commits | 168 |
| Distinct git "last touched" dates across all 69 pages | **2** (2026-10-19, 2026-10-20) |
| `guides/abc-inventory-analysis` true content history | 6 commits: Sep 16, 21, 23, Oct 16 ×2, Oct 19 |
| `guides/abc-inventory-analysis` git last-touch date | 2026-10-19 (a meta-tag touch) |

**Why it fails.** `git log -1` returns when a *file was last modified*, not when its
*content meaningfully changed*. The 2026-10-19 audit sweep (`667695b`) touched nearly
every page for metadata/a11y fixes, so virtually every page now reports 10-19/10-20
regardless of its real editorial date. Writing those as `lastmod` would assert that
all 69 pages changed on the same two days — false, and a classic spam pattern.

**Additional contradiction.** The 9 URLs that already carry `lastmod` claim
`2026-09-09`, `2026-09-12`, `2026-09-15`, `...`. A git backfill of the other 60 would
leave the sitemap asserting that 9 pages have precise older dates while 60 all
"changed" on Oct 19–20 — internally inconsistent.

**Risk if done anyway.** A `lastmod` that does not reflect real content change is a
documented route to having the `<lastmod>` signal **ignored entirely** by Google.
The backfill would forfeit the exact benefit it was meant to gain.

**Conclusion.** `lastmod` is optional per P2-A §8.4 (*"Not required; GitHub Pages
serves the files regardless"*). Correct action is to **leave it alone.** If it is ever
revisited, the only sound method is to derive dates from *editorial/content* events
(not file touches) and to backfill the existing 9 entries to the same convention at
the same time — never mixing the two.**

---

## 5c. Status of the "safe work while Tier 1 is observed" plan (2026-10-24)

Chosen next step was **(a) zero-risk work**, not Tier 2 content (Tier 1 went live
2026-10-16; the 28-day observation window closes ~2026-11-13).

| Task | Status |
|---|---|
| Verify the 4 linked tools are not stubs | ✅ Done — all substantive (§5.1) |
| Confirm the 4 new guides are indexed | ✅ Done — all indexed (§5.2) |
| `sitemap.xml` `lastmod` backfill | ⛔ Rejected with evidence (§5b) |

---

## 6. Session protocol

1. **Read this file.** Confirm `git log --oneline -1` matches `f64707b` (or note what moved on).
2. Confirm the working tree is clean before editing.
3. Pick the next unstarted item from §4 (Tier 2 unless the user says otherwise).
4. **Check the timing gate** in §4 before writing Tier 2 / Tier 3 content.
5. Edit → run the §3 validators → review `git diff` → **new forward commit** (never amend) → push.
6. Update **this file** with the new checkpoint.

### History

| When | What | Commit |
|---|---|---|
| 2026-08-16 | Repo created | `3809a9f` |
| 2026-10-16 | P1 / P2-A / P2-B: metadata, schema, search intent, cache busting | `4111028`…`682e48e` |
| 2026-10-19 | Audit sweep: AUD-001..AUD-020 | `667695b` |
| 2026-10-20 | 4 new guides: safety stock, cycle count, warehouse capacity, container stuffing | `ac78bb7`, `9e1288d` |
| 2026-10-20 | 4 new guides: structure + styling repair | `cc64997` |
| 2026-10-20 | 4 new guides: internal tool / template / guide links | `f64707b` |
| 2026-10-21 | Resume checkpoint created | `0a0b9ab` |
| 2026-10-24 | Zero-risk pass: stub check ✅, indexing confirmed ✅, `lastmod` rejected ⛔ | (this commit) |



`page-inventory.mjs`, `pallet-calculator.test.mjs`, `schema.test.mjs`,
`site-integrity.test.mjs`, `site-search.test.mjs`
