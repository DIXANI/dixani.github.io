# DIXANI — Cache Busting for JavaScript Assets

**Date:** 16 Oct 2026
**Status:** IMPLEMENTED & VALIDATED — not committed
**Baseline commit:** `4111028` (P1), unmodified by this work

---

## 1. Root Cause

After the P1 deploy, returning visitors kept running the **previous** `main.js`,
whose search handler redirected queries to `/#tools` instead of using the new
64-page engine. A hard reload with cache disabled fixed it — the classic
signature of stale browser-cached JavaScript.

GitHub Pages serves `/assets/**` with a long-lived cache and **no version
parameter**, so the browser never learns the file changed. Measured live:

| Resource | `Cache-Control` | Effective staleness window |
|---|---|---|
| `/assets/js/main.js` | `max-age=14400` | **4 hours** |
| `/assets/js/search-index.js` | `max-age=14400` | **4 hours** |
| `/` (HTML) | `max-age=600` | 10 minutes |

```
$ curl -sSI https://dixani.com/assets/js/main.js
HTTP/1.1 200 OK
Cache-Control: max-age=14400
etag: W/"6ad240b4-12c4"
last-modified: Fri, 16 Oct 2026 15:20:20 GMT
x-cache: HIT            <- GitHub Pages / Fastly edge cache
cf-cache-status: HIT    <- Cloudflare edge cache
via: 1.1 varnish
Age: 547
```

The HTML is re-fetched every 10 minutes, so the browser happily reads **fresh
HTML that references a stale JS file**. `ETag`/`Last-Modified` do not save us:
they only trigger revalidation once the 4-hour freshness window has expired.

**The defect is not in the JavaScript — it is that the URL never changes.**

## 2. Solution Chosen

A deterministic, content-derived query parameter appended to every local script
URL:

```html
<script src="/assets/js/main.js?v=e271ad4197"></script>
```

- **SHA-256 of the file's content**, truncated to **10 hex chars** (40 bits)
- URL is part of the cache key, so new content = new URL = guaranteed fetch
- Long `max-age` becomes an *asset*, not a liability
- No framework, no dependency, no runtime code, no build pipeline

### Why not the alternatives

| Option | Verdict |
|---|---|
| `?v=<timestamp>` / `Date.now()` | **Rejected** — busts cache on *every* run, destroys caching, non-deterministic, causes noisy diffs |
| Rename files (`main.a1b2c3.js`) | Rejected — breaks the existing static structure and every reference |
| HTML `<meta http-equiv>` cache-control | Rejected — widely ignored by modern browsers for subresources |
| Service worker | Rejected — heavyweight, overkill, adds a new failure surface |
| CDN purge API | Not available — GitHub Pages exposes no purge control |
| `fetch(..., {cache:'no-store'})` for the index | Rejected — would disable caching entirely and cannot fix `main.js`, which is a `<script>` tag |

### Critical implementation detail: line-ending normalisation

`core.autocrlf=true` in this repo means files are **LF in git but CRLF on disk**:

```
git  (HEAD:assets/js/main.js) : 4804 bytes, 0 CR, 152 LF
disk (assets/js/main.js)      : 4956 bytes, 152 CR, 152 LF
```

Hashing raw disk bytes made the version **change after a fresh `git checkout`**
even though the tracked content was identical — I caught this in validation
(run 1 gave `e271ad4197`, after a `git checkout` it gave `d772545762`). Both the
generator and the test therefore **normalise CRLF → LF before hashing**, so the
version is a pure function of the *tracked* content. Verified: the emitted hash
now equals SHA-256 of the LF bytes from `git show HEAD:...` exactly.

---

## 3. Audit Results

| Finding | Detail |
|---|---|
| HTML pages scanned | **64** (content pages; `google*.html` verification token excluded) |
| `<script src>` tags | **218** |
| Local (same-origin) refs | **90** |
| Third-party refs (untouched) | **128** — gtag ×64, Cloudflare beacon ×64 |
| Distinct local JS files | **27** |
| Existing `?v=` parameters | **0** — no cache busting existed anywhere |
| `/assets/js/main.js` | **64 refs** (every page) — 4-hour stale risk |
| `/assets/js/search-index.js` | **1 ref** (homepage) — 4-hour stale risk |
| Other local JS files | **25 more** with the identical risk |
| GitHub Pages config | Branch deploy from `main`; `CNAME` present; **no `.nojekyll`** (Jekyll runs); no `package.json`, no bundler, no CI |
| Node.js | v24.21.0 (built-in `node:test`, `node:crypto`) |

**Scope discovery mattered:** a naive `/assets/js/`-only pass would have missed
**6 co-located calculator scripts** (`markup-calculator.js`, `profit-margin.js`,
`working-hours.js`, `break-even.js`, `discount.js`, `vat.js`) plus the
**9 root-relative `../../assets/js/*.js`** references. The resolver handles both
forms, so **all 27 files are covered**.

**Loading order** on the homepage was already correct and is preserved:
`search-index.js` → `main.js` (guarded by a regression test).

## 4. Files Modified / Created

### Created (3)
```
tests/build-cache-versions.mjs   generator: hashes JS and rewrites script srcs
tests/cache-version.test.mjs     8 regression tests
reports/DIXANI-CACHE-BUSTING.md  this document
```

### Modified (65)
```
64 x */index.html                one-line script src substitution each
tests/site-search.test.mjs       made 1 assertion cache-version tolerant
```
Also removed a stray junk file from the repo root (a malformed shell redirect
left by an earlier session — untracked, not site content).

### Deliberately untouched
`assets/js/*.js`, `assets/css/*.css`, `sitemap.xml`, `robots.txt`, analytics
tags, canonical URLs, titles, meta descriptions, OG/Twitter tags.

## 5. Before / After

| File | Before | After |
|---|---|---|
| `/assets/js/main.js` | `main.js` | `main.js?v=e271ad4197` |
| `/assets/js/search-index.js` | `search-index.js` | `search-index.js?v=241b8f4517` |
| `../../assets/js/eoq-calculator.js` | `eoq-calculator.js` | `eoq-calculator.js?v=9bf409fe9b` |
| `../../assets/js/pallet-calculator.js` | `pallet-calculator.js` | `pallet-calculator.js?v=bd33c97989` |

Homepage diff — exactly two lines, nothing else:

```diff
-<script src="/assets/js/search-index.js"></script>
-<script src="/assets/js/main.js"></script>
+<script src="/assets/js/search-index.js?v=241b8f4517"></script>
+<script src="/assets/js/main.js?v=e271ad4197"></script>

 <!-- Cloudflare Web Analytics -->
 <script type="module" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='...'></script>
```

All 27 content hashes:

```
793565b605  assets/js/ai-operations-assistant.js
1216288b55  assets/js/cbm-calculator.js
ca24e15db5  assets/js/compound-interest-calculator.js
ed75ff4d71  assets/js/container-loading-calculator.js
ba5eba0ce1  assets/js/cycle-count-planner.js
192b8fe65d  assets/js/dio-calculator.js
9bf409fe9b  assets/js/eoq-calculator.js
ec7f327b19  assets/js/inventory-accuracy-analyzer.js
8121228803  assets/js/inventory-turnover.js
65e6a757f0  assets/js/inventory.js
9cbfdbc60a  assets/js/loan-payment-calculator.js
e271ad4197  assets/js/main.js
bd33c97989  assets/js/pallet-calculator.js
0a7edd25b9  assets/js/reorder.js
51342c4d98  assets/js/safety-stock.js
241b8f4517  assets/js/search-index.js
16b452934c  assets/js/simple-interest-calculator.js
c401b235f1  assets/js/unit-converter.js
1b525144a9  assets/js/volumetric-weight-calculator.js
5a663dcfac  assets/js/warehouse-shift-challenge.js
c39afc20a4  assets/js/warehouse-space-calculator.js
83d7bef467  categories/business/markup-calculator/markup-calculator.js
83d7bef467  categories/business/profit-margin-calculator/profit-margin.js
18a1b959fc  categories/business/working-hours-calculator/working-hours.js
17c95c985e  categories/finance/break-even-calculator/break-even.js
47bb50531a  categories/finance/discount-calculator/discount.js
8c323ddac9  categories/finance/vat-calculator/vat.js
```

`markup-calculator.js` and `profit-margin.js` share a hash because they are
**byte-identical duplicates** (confirmed via SHA-256). Content-based versioning
is behaving correctly.

---

## 6. Validation Results

### Test suite — 49/49 pass (was 41)

| Suite | Tests | Pass | Fail |
|---|---|---|---|
| `cache-version.test.mjs` (new) | 8 | 8 | 0 |
| `pallet-calculator.test.mjs` | 13 | 13 | 0 |
| `site-integrity.test.mjs` | 11 | 11 | 0 |
| `site-search.test.mjs` | 17 | 17 | 0 |
| **Total** | **49** | **49** | **0** |

New regression tests:

```
ok 1 - every local <script src> carries a ?v= content version
ok 2 - each declared version equals the SHA-256 prefix of the file on disk
ok 3 - the same file is never referenced with two different versions
ok 4 - version derivation is deterministic (same bytes -> same hash, changed bytes -> new hash)
ok 5 - no runtime-generated cache busting (no Date.now / Math.random in tags)
ok 6 - third-party scripts are never rewritten
ok 7 - search-index.js still precedes main.js on the homepage
ok 8 - no duplicate local script loading on any page
```

### One pre-existing test required updating (explained)

`site-search.test.mjs` asserted the literal string
`src="/assets/js/search-index.js"`, which no longer matched once `?v=` was
appended. That assertion encoded the *old* URL, not the behaviour under test.
I made it **cache-version tolerant** while keeping every guarantee:

```js
// before: html.includes('src="/assets/js/search-index.js"')
// after:  matches src="/assets/js/search-index.js(?:?[^"]*)?"  and still asserts order
```

It still verifies the script is loaded, resolvable, and ordered **before**
`main.js`. The intent is intact — only the brittle exact-string match changed.
This was the **only** failing test; no other assertion was weakened.

### Requirement-by-requirement evidence

| Requirement | Evidence | Result |
|---|---|---|
| Version matches the referenced file | Hash equals SHA-256 of the LF bytes from `git show HEAD:assets/js/main.js` → `e271ad4197` | PASS |
| Changed content → different version | Appended `// probe` → `e271ad4197` → `79447c633f`, all 64 refs auto-updated | PASS |
| Unchanged content → same version | 3rd run: `refs updated: 0`, `refs already fresh: 90`; `git status` byte-identical | PASS |
| Script is idempotent | Run 2 and run 3 changed nothing; `--check` exits 0 | PASS |
| All HTML references valid | 90/90 local refs resolve on disk; `--check` reports 0 unresolved; no bare (unversioned) local ref remains | PASS |
| No duplicate script loading | Test 8: 0 duplicates; `main.js` = 64 refs, `search-index.js` = 1 ref | PASS |
| All 41 existing tests still pass | 49/49 total, 0 failures (41 original + 8 new) | PASS |
| Homepage search functional | Served over real HTTP: index parses to **64 entries**; `main.js` served is the **new** handler; **no `#tools` redirect** | PASS |
| Calculator formulas unchanged | `git status` on `assets/js` + `assets/css` = **empty**; 13/13 pallet tests pass | PASS |
| SEO metadata unchanged | 0 changed lines matching `<title`, `name="robots"`, `rel="canonical"`, `og:url`, `twitter:` | PASS |
| Canonical URLs unchanged | 11/11 integrity tests pass, incl. canonical/path match on all 64 pages | PASS |
| Analytics IDs unchanged | gtag `G-LQEH9L9TZ4` ×64 intact; Cloudflare beacon ×64 intact; **third-party tags never rewritten** | PASS |
| No published URL changed | URL *paths* untouched — only a query string added; `sitemap.xml` unmodified | PASS |
| No calculators/guides/templates removed | 64 pages before and after; 0 deletions in diff | PASS |
| Diff scope is surgical | 64 HTML files, **exactly balanced** insertions/deletions; every added line matches `?v=[0-9a-f]{10}` | PASS |
| Whitespace hygiene | `git diff --check` exits 0 | PASS |
| HTTP serving | `GET /assets/js/main.js?v=e271ad4197` → **200 `text/javascript`**; versioned and bare paths both resolve | PASS |

### Diff scope proof

Every added line in the entire change set is a cache-versioned script tag:

```
=== confirm every changed line contains ?v= ===
PASS: every added line is a cache-versioned script tag
```

All 64 HTML files have **equal** insertions and deletions (single-line
substitutions). The only file with unequal counts is `tests/site-search.test.mjs`
(10/4) — the intentional test fix. **No production JS or CSS file content changed.**

### Line-ending invariant

```
disk copy (CRLF) -> e271ad4197
git  copy (LF)   -> e271ad4197
identical: true
```

## 7. Deployment Order — Why It Matters

The steps have a **required order**, because each depends on the previous one:

```
1. Edit JavaScript              (or add/remove/rename/title pages)
2. node tests/build-search-index.mjs   <- refresh the generated index from current HTML
3. node tests/build-cache-versions.mjs <- hash the FINAL JS bytes into the HTML
4. node --test tests/*.test.mjs        <- verify (49/49)
5. git add / commit / push             <- publish
```

**Why step 2 must precede step 3:** `search-index.js` is itself a generated
JavaScript file. Regenerating it *changes its bytes*, which **changes its hash**.
If you version first and regenerate second, the HTML would point at a stale
version of the index that no longer exists — the browser would cache the old
index under the old URL and the whole fix would silently fail for that file.

**Why both must precede step 4 and 5:** the tests assert that every declared
version equals the on-disk hash, so running them last proves the tree is
internally consistent before it is published. Step 3 must come after **all**
JavaScript modifications (step 1) for the same reason.

**Skipping step 3 does not break the site** — it just means returning visitors
keep the 4-hour stale window. Skipping it is safe but defeats the purpose.

---

## 8. Remaining Browser / CDN Caching Limitations

Cache versioning fixes the **hard problem** (stale JS executing after deploy),
but it cannot fix everything. Honest limitations:

### 1. HTML itself still caches for 10 minutes
`/` is served with `max-age=600` and `cf-cache-status: DYNAMIC`. A returning
visitor may keep the **old HTML** — with the **old** `?v=` URLs — for up to
10 minutes. During that window they run the old JS. This is much better than
4 hours, and it is *safe* (the old URLs still resolve), but it is not zero.
There is no way to override GitHub Pages' HTML cache header without a CDN rule.

### 2. The Cloudflare + GitHub Pages edge cache retains each URL
`cf-cache-status: HIT` and `x-cache: HIT` show both edges cache `/assets/**`.
A new `?v=` URL is a **cold key**, so the first visitor after deploy pays a
(brief) origin fetch for it. Old URLs stay warm but harmless. This is the
intended trade-off: correctness over a one-request edge miss.

### 3. Versioned URLs accumulate in caches
Each deploy of changed JS leaves the previous `?v=` URL cached at the edge until
eviction. Cached bytes are tiny and never referenced by fresh HTML, so there is
no correctness issue — only a negligible amount of unused cache storage.

### 4. No instant global invalidation
GitHub Pages exposes **no purge API**. The only "purge" available is relying on
URL uniqueness, which is exactly what this solution does. Do not expect an
immediate worldwide flush; expect that **no fresh HTML ever requests a stale URL**.
That is the guarantee, and it is sufficient.

### 5. A visitor mid-session is not force-reloaded
If a visitor loaded the site *before* the deploy and keeps the tab open, they
keep running the old JS until they navigate or reload. Nothing can change that
without a service worker (rejected as overkill). Their next page load within
10 minutes may still be old HTML; after that, the new URLs are guaranteed.

### 6. `Cache-Control` cannot be edited
GitHub Pages hard-codes `max-age=14400` for assets. There is no `_headers`
support (that is a Netlify/Cloudflare Pages feature). Content-hash query strings
are the correct and **only** dependency-free answer for GitHub Pages.

### What this solution does guarantee
> **No freshly served HTML will ever reference a JavaScript URL whose cache
> entry can be stale.** Any change to a JS file necessarily produces a new URL,
> and the test suite **fails the build** if any declared version drifts from the
> file on disk.

---

## 9. Deployment Commands (Windows PowerShell)

Nothing was committed. Run these when you approve.

```powershell
# --- 0. Confirm the baseline -------------------------------------------
cd "C:\Users\DELL\Documents\Website\dixani.github.io"
git status                    # expect: 64 modified *.html, tests/site-search.test.mjs, 3 new files
git log --oneline -1          # expect: 4111028 P1: improve site search, SEO metadata and validation

# --- 1. Regenerate the search index FIRST -----------------------------
node tests/build-search-index.mjs

# --- 2. Stamp cache versions onto the FINAL javascript bytes -----------
node tests/build-cache-versions.mjs
#    expect: refs updated: 0  refs already fresh: 90   (0 = already current)

# --- 3. Verify (49/49 must pass) ---------------------------------------
node --test tests/*.test.mjs

# --- 4. Optional stricter gate: fail if any version is stale -----------
node tests/build-cache-versions.mjs --check     # expect exit 0 + "OK: all cache versions are current."

# --- 5. Stage and inspect ----------------------------------------------
git add --all
git status --short
git diff --cached --check                       # expect exit 0

# --- 6. Commit ----------------------------------------------------------
git commit -m "Add content-hash cache busting for JavaScript assets"

# --- 7. Publish (triggers GitHub Pages deploy) -------------------------
git push origin main
```

Full commit message if you want the detail:

```
Add content-hash cache busting for JavaScript assets

- Add tests/build-cache-versions.mjs: SHA-256 (10 hex) content hash appended
  as ?v= to every local <script src> across 64 pages (90 refs, 27 JS files)
- Normalise CRLF to LF before hashing so versions are stable across checkouts
  under core.autocrlf=true
- Add tests/cache-version.test.mjs: 8 regression tests (hash correctness,
  idempotency, no runtime busting, third-party tags untouched, load order)
- Make one site-search assertion cache-version tolerant
- Third-party tags, analytics, canonical URLs and SEO metadata unchanged
```

### The one-liner for future deploys

Whenever you change any JavaScript, or add/remove/rename/re-title a page:

```powershell
cd "C:\Users\DELL\Documents\Website\dixani.github.io"; node tests/build-search-index.mjs; node tests/build-cache-versions.mjs; node --test tests/*.test.mjs; git add --all; git commit -m "Update site"; git push origin main
```

**Order is non-negotiable:** index first (it regenerates a JS file), versions
second (it hashes the final bytes), tests third (they verify consistency),
commit and push last.

## 10. Files To Commit

```
Modified (65)
  64 x */index.html                  script src -> ?v=<hash>
  tests/site-search.test.mjs         assertion made cache-version tolerant

Added (3)
  tests/build-cache-versions.mjs     generator
  tests/cache-version.test.mjs       8 regression tests
  reports/DIXANI-CACHE-BUSTING.md    this document

Removed (1, untracked)
  "<junk shell-redirect file>"       accidental artifact from an earlier session
```

## 11. Conclusion

**IMPLEMENTED AND VALIDATED — awaiting approval to commit.**

- Root cause proven with live HTTP headers: `Cache-Control: max-age=14400` with
  no version parameter = up to 4 hours of stale JavaScript.
- Fixed with deterministic, content-derived `?v=` hashes — no dependencies, no
  framework, no build pipeline, fully GitHub Pages compatible.
- **49/49 tests pass**; 8 new regression tests lock the behaviour in.
- Diff is surgical: 64 files, one line each, balanced insertions/deletions,
  every added line a versioned script tag. No JS, CSS, SEO, canonical or
  analytics content altered.
- A latent line-ending determinism bug was found and fixed during validation.
- Nothing committed, pushed or deployed.
