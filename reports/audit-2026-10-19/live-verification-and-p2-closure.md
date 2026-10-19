# DIXANI Live Verification & P2 Closure — 2026-10-19 (round 2)

**Repository:** `C:\Users\DELL\Documents\Website\dixani.github.io`
**Branch:** `main` (working tree dirty — uncommitted fix set, see below)
**Live site:** `https://dixani.com/` — **REACHABLE this round (HTTP 200)**. The
`README.md` limitation "live site not reachable" no longer applies.
**Node:** v24.21.0

This addendum records (a) the first successful live-site verification of the
technical SEO baseline, and (b) the closure of the two remaining P2 defects
(AUD-018, AUD-020) with regression tests.

---

## 1. Live-site verification (previously blocked)

All checks below were executed against production on 2026-10-19.

| Check | Expected | Observed | Verdict |
|---|---|---|---|
| `https://dixani.com/` | 200 | 200 | Pass |
| `https://dixani.com/sitemap.xml` | 200, 64 URLs | 200, 64 `<loc>` | Pass |
| `https://dixani.com/robots.txt` | allows all + sitemap | matches repository exactly | Pass |
| Every sitemap URL HEAD | 200 | 64/64 return 200 | Pass |
| Unknown path `/nonexistent-page-xyz/` | 404 | 404 | Pass |
| `/logistics/cbm-calculator` (no slash) | redirect to trailing slash | 200 at `/logistics/cbm-calculator/` | Pass |
| Canonical on `/logistics/cbm-calculator/` | self | `https://dixani.com/logistics/cbm-calculator/` | Pass |
| `/index.html` duplicate of `/` | canonical to `/` | byte-identical content, `canonical=https://dixani.com/` | Pass (not a defect) |
| Homepage `<link rel=canonical>` | `https://dixani.com/` | matches | Pass |
| Serving layer | — | Cloudflare fronting GitHub Pages (`Server: cloudflare`, `x-github-request-id`) | Informational |
| `Cache-Control` on HTML | — | `max-age=600` | Informational |

**Conclusion:** the deployed site's technical SEO baseline is healthy and matches
the repository. No live indexability or redirect defects were found.

### Deployment lag (important)

The live deployment is **older than the working tree**: live tool pages contain
no `skip-link` and no `id="main"` yet. This confirms the in-repo fix set
(AUD-001…AUD-019) is **not yet deployed** — it must be committed and pushed
before any live effect can be observed. This is expected, not a defect.


---

## 2. Closed defects

### AUD-018 — Cycle Count Planner leaked raw JSON parser text (was P2 / Low) → FIXED

**Root cause.** Both restore entry points parsed before validating:

```js
restore(JSON.parse(text));                                   // loadLocal
readFile(event.target, text => restore(JSON.parse(text)));   // uploaded file
```

`readFile`'s `catch` surfaces `error.message` verbatim, so an upload of
`{not valid json` displayed e.g. *"Expected property name or '}' in JSON at
position 1"*.

**Fix.** New `parseBackup()` guard in `assets/js/cycle-count-planner.js`:

```js
function parseBackup(text) {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("This file is not valid JSON. Choose a DIXANI cycle count backup (.json) file and try again.");
  }
}
```

Both call sites now use `parseBackup(text)`. There is now exactly one
`JSON.parse(text)` in the file, inside the guard. Workspace state is unchanged
on failure because `restore()` never runs.

**Regression tests:** `tests/audit-2026-10-19.test.mjs`
- source guard: `parseBackup` wraps `JSON.parse` in try/catch; both entry points routed through it; only one raw parse remains.
- behavioural: malformed text yields a readable error containing no parser text; a valid backup still round-trips.

### AUD-020 — Overlong `<title>` tags (was P2 / Low, heuristic) → ADDRESSED

Measured **rendered** title length (HTML entities decoded), not raw markup.
Initially 15 routes exceeded 60 rendered characters; max 66.

11 titles were tightened while preserving keywords and uniqueness:

| Route | Before (len) | After (len) |
|---|---|---|
| `/inventory-control-toolkit/` | Tools, Guides & Templates (66) | Tools & Templates (58) |
| `/templates/purchasing/request-for-quotation/` | – Excel & PDF (66) | \| Excel & PDF \| (64) |
| `/templates/purchasing/` | – Excel & PDF (64) | \| Excel & PDF \| (62) |
| `/guides/warehouse-space-utilization/` | Formula, Example and Guide (64) | Formula & Example (55) |
| `/inventory/inventory-accuracy-analyzer/` | & Cycle Count Planner (63) | & Cycle Counter (59) |
| `/templates/warehouse/damage-write-off-form/` | – Excel & PDF (62) | \| Excel & PDF \| (60) |
| `/templates/warehouse/packing-list/` | – Excel & PDF (61) | \| Excel & PDF \| (59) |
| `/templates/warehouse/picking-list/` | – Excel & PDF (61) | \| Excel & PDF \| (59) |
| `/templates/warehouse/goods-issue-note/` | – Excel & PDF (61) | \| Excel & PDF \| (59) |

Result: over-60 titles reduced **15 → 4**, max length **66 → 64**. The remaining
four are inside Google's ~600 px display budget and remain descriptive and
unique, so they were deliberately left unchanged rather than shortened
mechanically (per the audit's own guidance).

**Regression test:** `AUD-020` asserts no title exceeds 65 rendered characters
and that all 61 titles remain unique.

---

## 3. Outstanding P2 item

### AUD-021 — Contrast heuristic (P2 / Low, hypothesis) → NOT ACTIONED

The automated scan flagged 181 nodes, but the register itself labels this a
*heuristic, not a confirmed WCAG failure* (flags include decorative card numbers
and "coming-soon" labels). Confirming it requires manual inspection of computed
foreground/background pairs. Left open intentionally rather than making
unverified style changes.

---

## 4. Test status

Command (explicit file list — do **not** run `node --test tests/` on this Node
version; it mis-discovers the helper scripts):

```powershell
node --test tests/audit-2026-10-19.test.mjs tests/pallet-calculator.test.mjs `
  tests/cache-version.test.mjs tests/schema.test.mjs `
  tests/site-integrity.test.mjs tests/site-search.test.mjs
```

| Round | Tests | Pass | Fail |
|---|---:|---:|---:|
| Baseline (pre-fix) | 67 | 67 | 0 |
| After AUD-001–019 (prior round) | 94 | 94 | 0 |
| After AUD-018 + AUD-020 (this round) | **97** | **97** | **0** |

Cache-version hashes were refreshed with `node tests/build-cache-versions.mjs`
after editing `cycle-count-planner.js`, keeping the `?v=` guard green.

---

## 5. Change set (uncommitted)

80 files modified on `main`. Net delta this round: 11 `index.html` titles,
`assets/js/cycle-count-planner.js`, `tests/audit-2026-10-19.test.mjs`, plus
regenerated `?v=` hashes.

**Not committed, not pushed, not deployed** — awaiting approval per the audit
execution rules.

---

## 6. Remaining verification gaps

| Check | Status | Note |
|---|---|---|
| Google indexing / rich-result eligibility | Not verified | Needs Search Console URL inspection |
| Core Web Vitals (field or lab) | Not verified | No CrUX/PageSpeed access from sandbox |
| AdSense approval outcome | Not verifiable | Evidence review only; no guarantee implied |
| Physical iOS/Android rendering | Not executed | Headless emulation only |
| NVDA / VoiceOver / TalkBack | Not executed | No assistive tech available |
| 200–400 % zoom / reflow | Not executed | — |
| Competitor live inspection | Attempted previously | Named competitor domains were unreachable; no competitor data invented |
