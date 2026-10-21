# DIXANI — Resume Here (single source of truth for "continue site improvement")

**Purpose:** If a new chat session is asked to *"continue the DIXANI site improvement"*,
**read this file first** and start from the checkpoint below. Do **not** re-run the
completed audit work.

**Last updated:** 2026-10-20
**Repo:** `https://github.com/DIXANI/dixani.github.io` (local: `C:\Users\DELL\Documents\Website\dixani.github.io`)
**Branch:** `main`
**Working tree:** clean (nothing uncommitted)
**HEAD = origin/main =** `f64707b`

---

## 1. Current checkpoint — nothing pending

| Item | State |
|---|---|
| Local `HEAD` | `f64707b` |
| `origin/main` | `f64707b` (identical — `rev-list --left-right --count` = `0  0`) |
| Uncommitted changes | **none** |
| Last session's work | **committed AND pushed** |

### Last 4 commits (newest first)

```
f64707b  Add related tool, template and guide links to four new guides
cc64997  Fix guide structure and styling for four new guides
9e1288d  Add warehouse capacity cost and container stuffing guides
ac78bb7  Add safety stock and cycle count scheduling guides
```

**Do not amend `cc64997` or `f64707b`.** They are already on the remote. Any further
work must be a **new forward commit**.
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

Tier 1 was deployed ahead of the 28-day spacing, so **before starting Tier 2,
confirm with the user whether the 28-day observation window has actually elapsed.**
If it has not, the correct action is to **wait, not write** — the whole point of the
staged plan is valid attribution.

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

## 5. Open item the user should rule on

Four tool pages were linked from the new guides without verifying they are fully
built out and published in the nav:

`inventory/inventory-turnover`, `inventory/inventory-accuracy-analyzer`,
`inventory/variance-report`, `logistics/cbm-calculator`

They exist on disk and are topically core, but if any is a stub, the link sends
readers to a thin page. **Worth confirming; links can be swapped out if needed.**

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
| 2026-10-20 | Tier 1 implementation (descriptions + additive vocabulary) | (per TIER1 report) |
| 2026-10-20 | 4 new guides: structure + styling repair | `cc64997` |
| 2026-10-20 | 4 new guides: internal tool / template / guide links | `f64707b` |


`page-inventory.mjs`, `pallet-calculator.test.mjs`, `schema.test.mjs`,
`site-integrity.test.mjs`, `site-search.test.mjs`
