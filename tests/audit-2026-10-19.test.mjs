// Regression tests for the AUD-001..AUD-019 fixes from
// reports/audit-2026-10-19 (P0 critical/high + P1 bugs across the calculator
// suite). Every test below ties back to a numbered finding in
// reports/audit-2026-10-19/bug-register.csv.
//
// Run:  node --test tests/
//
// WHY THESE TESTS EXIST
// ---------------------
// The production scripts are IIFEs that touch the DOM and expose nothing, so
// (as with tests/pallet-calculator.test.mjs) we validate two things:
//   1. SOURCE INTEGRITY  - the hardening code is still present in each file.
//   2. BEHAVIOUR         - a faithful re-implementation of the fixed maths /
//                          validation logic produces the audited-expected value.
// If someone reverts a fix, one of these guards fails.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..");
const read = (p) => readFileSync(join(repoRoot, p), "utf8");

const analyzerJs = read("assets/js/inventory-accuracy-analyzer.js");
const compoundJs = read("assets/js/compound-interest-calculator.js");
const reorderJs = read("assets/js/reorder.js");
const safetyJs = read("assets/js/safety-stock.js");
const volumetricJs = read("assets/js/volumetric-weight-calculator.js");
const palletJs = read("assets/js/pallet-calculator.js");
const containerJs = read("assets/js/container-loading-calculator.js");
const workingHoursJs = read("categories/business/working-hours-calculator/working-hours.js");
const breakEvenJs = read("categories/finance/break-even-calculator/break-even.js");
const cbmCss = read("assets/css/cbm-calculator.css");
const accuracyCss = read("assets/css/inventory-accuracy-analyzer.css");
const consistencyCss = read("assets/css/site-consistency.css");

// ===========================================================================
// AUD-001 / AUD-003 / AUD-005 - Inventory Accuracy Analyzer numeric validation
// ===========================================================================

// Faithful re-implementation of the strict numeric parser added for AUD-001.
// Blanks and non-numeric text -> NaN (so the caller can reject them); a
// genuine "0" -> 0. Mirrors `strictNum` in inventory-accuracy-analyzer.js.
function strictNum(v) {
  const s = String(v ?? "").replace(/,/g, "").trim();
  if (s === "") return NaN;
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

test("AUD-001: strictNum rejects non-numeric text instead of coercing to 0", () => {
  assert.ok(Number.isNaN(strictNum("not-a-number")), "text must be NaN");
  assert.ok(Number.isNaN(strictNum("")), "blank must be NaN");
  assert.ok(Number.isNaN(strictNum("   ")), "whitespace must be NaN");
  assert.ok(Number.isNaN(strictNum("3abc")), "partially numeric must be NaN");
});

test("AUD-001: strictNum still accepts real numbers (incl. thousands separators)", () => {
  assert.equal(strictNum("120"), 120);
  assert.equal(strictNum("0"), 0);
  assert.equal(strictNum("1,200"), 1200); // commas stripped, as typed by users
  assert.equal(strictNum("-5"), -5); // negative parses; AUD-005 rejects it
});

test("AUD-001: the analyzer source keeps the strict parser and atomic import", () => {
  assert.match(analyzerJs, /function\s+strictNum\s*\(/, "strictNum() must exist");
  assert.match(analyzerJs, /if\(Number\.isNaN\(sys\)\)/, "System Qty NaN guard missing");
  assert.match(analyzerJs, /if\(Number\.isNaN\(phys\)\)/, "Physical Qty NaN guard missing");
  assert.match(
    analyzerJs,
    /Nothing was imported/,
    "Import must stay atomic (single bad row imports nothing)."
  );
});

test("AUD-003: blank required quantities cannot become a perfect-accuracy row", () => {
  // Row: SKU present, system/physical blank -> both NaN -> rejected.
  const sys = strictNum("");
  const phys = strictNum("");
  assert.ok(Number.isNaN(sys) && Number.isNaN(phys));
  assert.match(analyzerJs, /System Qty must be a number/, "blank System Qty message missing");
  assert.match(analyzerJs, /Physical Qty must be a number/, "blank Physical Qty message missing");
});

test("AUD-005: negative quantities and costs are rejected", () => {
  assert.match(analyzerJs, /quantities cannot be negative/, "negative-quantity guard missing");
  assert.match(analyzerJs, /cannot be negative/, "negative-value guard missing");
  // A negative physical qty must not silently pass the numeric gate.
  assert.ok(strictNum("-10") < 0, "negative parses as a number, then the <0 guard must fire");
});

// ===========================================================================
// AUD-002 - duplicate SKU + location detection
// ===========================================================================

// Faithful re-implementation of the composite key used in importText()/validateRows().
const dupKey = (sku, location) => `${String(sku).toLowerCase()}\u0000${String(location).toLowerCase()}`;

test("AUD-002: duplicate SKU-location collapses to one key and is caught", () => {
  const seen = new Map();
  const rows = [
    { sku: "DUP", location: "A-01" },
    { sku: "DUP", location: "A-01" }, // duplicate identity
  ];
  const duplicates = [];
  rows.forEach((r, i) => {
    const key = dupKey(r.sku, r.location);
    if (seen.has(key)) duplicates.push(i);
    else seen.set(key, i);
  });
  assert.deepEqual(duplicates, [1], "the second DUP@A-01 must be flagged");
  assert.match(analyzerJs, /duplicate SKU-Location/, "duplicate detection message missing");
});

test("AUD-002: the same SKU in a different location is NOT a duplicate", () => {
  const seen = new Map();
  let dup = 0;
  for (const r of [{ sku: "DUP", location: "A-01" }, { sku: "DUP", location: "A-02" }]) {
    const key = dupKey(r.sku, r.location);
    if (seen.has(key)) dup++; else seen.set(key, 1);
  }
  assert.equal(dup, 0, "distinct locations must remain distinct records");
});

// ===========================================================================
// AUD-004 - unterminated CSV quote detection
// ===========================================================================

// Faithful re-implementation of the quote-state tracker in parseDelimited().
// Returns { quoted } where true means the text ended inside a quoted cell.
function scanQuotes(text) {
  const first = text.split(/\r?\n/, 1)[0] || "";
  const delimiter = (first.match(/\t/g) || []).length > (first.match(/,/g) || []).length ? "\t" : ",";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') { i++; } else { quoted = !quoted; }
    } else if (c !== delimiter && !quoted) {
      // ordinary character
    }
  }
  return { quoted };
}

test("AUD-004: an unterminated quote is detected and blocks import", () => {
  const bad = 'SKU,System Qty,Physical Qty\n"BAD,1,2';
  assert.equal(scanQuotes(bad).quoted, true, "unterminated quote must be detected");
  assert.match(analyzerJs, /Unterminated quoted value starting on line/, "parse error message missing");
});

test('AUD-004: balanced quotes (incl. escaped "") parse cleanly', () => {
  assert.equal(scanQuotes('SKU,LOC\n"a,b",c').quoted, false, "balanced quote must pass");
  assert.equal(scanQuotes('SKU,LOC\n"a""b",c').quoted, false, "escaped quote must pass");
});

// ===========================================================================
// AUD-006 - future last-count date rejection
// ===========================================================================

test("AUD-006: a future last-count date is rejected", () => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const future = new Date("2099-01-01T00:00:00");
  assert.ok(future > today, "2099 must be treated as future");
  assert.match(analyzerJs, /Last Count Date cannot be in the future/, "future-date guard missing");
});

// ===========================================================================
// AUD-007 - Compound Interest exact period maths
// ===========================================================================

// Faithful re-implementation of the fixed principal growth:
//   FV = P * (1 + r/n)^(n*t)   with a fractional exponent allowed.
function compoundPrincipal(P, annualRatePct, compoundsPerYear, years) {
  const ratePerPeriod = annualRatePct / 100 / compoundsPerYear;
  return P * Math.pow(1 + ratePerPeriod, compoundsPerYear * years);
}

test("AUD-007: 10,000 at 5% for exactly 1 month, monthly compounding = 10,041.67", () => {
  const fv = compoundPrincipal(10000, 5, 12, 1 / 12);
  assert.equal(Number(fv.toFixed(2)), 10041.67, "one partial month must be applied, not dropped");
});

test("AUD-007: the old daily-simulation bug (returning the principal) cannot recur", () => {
  const fv = compoundPrincipal(10000, 5, 12, 1 / 12);
  assert.notEqual(Number(fv.toFixed(2)), 10000.0, "must not return the untouched principal");
});

test("AUD-007: exact-period result matches an independent per-period loop", () => {
  // 10,000 at 5% for 3 months, monthly compounding.
  const closed = compoundPrincipal(10000, 5, 12, 3 / 12);
  let loop = 10000;
  const i = 0.05 / 12;
  for (let k = 0; k < 3; k++) loop *= 1 + i;
  assert.equal(Number(closed.toFixed(6)), Number(loop.toFixed(6)), "closed form must equal the loop");
});

test("AUD-007: full years use the standard compound formula", () => {
  // 1,000 at 10% for 2 years, annual compounding -> 1210.
  assert.equal(Number(compoundPrincipal(1000, 10, 1, 2).toFixed(2)), 1210.0);
});

test("AUD-007: the source applies a fractional exponent via Math.pow", () => {
  assert.match(compoundJs, /Math\.pow\(1 \+ ratePerPeriod, periodsTotal\)/, "principal growth formula missing");
  assert.match(compoundJs, /compoundsPerYear \* years/, "periodsTotal must be n*t");
});

// ===========================================================================
// AUD-008 / AUD-009 - Reorder + Safety Stock reject negatives / non-numbers
// ===========================================================================

// Mirrors the shared `raw()` helpers: blank -> null (treated as zero by the
// calculator), non-finite -> NaN (rejected), otherwise the number.
function raw(v) {
  const s = String(v ?? "").trim();
  if (s === "") return null;
  const x = Number(s);
  return Number.isFinite(x) ? x : NaN;
}

test("AUD-008: reorder rejects a negative or non-numeric input", () => {
  assert.ok(Number.isNaN(raw("abc")), "text must be NaN");
  assert.equal(raw("-3"), -3); // parses, then the <0 guard fires
  assert.match(reorderJs, /function errorMode\(\)/, "reorder errorMode() missing");
  assert.match(reorderJs, /must be zero or positive numbers/, "reorder validation message missing");
  assert.match(reorderJs, /Number\.isNaN\(x\.v\)\|\|x\.v<0/, "reorder rejection guard missing");
});

test("AUD-009: safety stock rejects a negative or non-numeric input in the active method", () => {
  assert.ok(Number.isNaN(raw("x")), "text must be NaN");
  assert.match(safetyJs, /function errorState\(\)/, "safety-stock errorState() missing");
  assert.match(safetyJs, /must be zero or positive numbers/, "safety-stock validation message missing");
  assert.match(safetyJs, /activeIds\.some/, "active-method-only validation missing");
  // Both simple and advanced field sets must be checked.
  assert.match(safetyJs, /"maxDaily","maxLead","avgDaily","avgLead"/, "simple method fields missing");
  assert.match(safetyJs, /"service","std","advLead","advAvg"/, "advanced method fields missing");
});

// ===========================================================================
// AUD-010 / AUD-011 - Volumetric Weight integer qty + blank-on-error
// ===========================================================================

test("AUD-010: volumetric weight requires an integer quantity", () => {
  assert.match(volumetricJs, /Number\.isInteger\(quantity\)/, "integer quantity guard missing");
});

test("AUD-011: validation errors blank the previous result rather than keep it", () => {
  assert.match(volumetricJs, /function blankResults\(\)/, "blankResults() missing");
  // Both the generic validation branch and the quantity branch must blank.
  const blanks = (volumetricJs.match(/blankResults\(\)/g) || []).length;
  assert.ok(blanks >= 3, `expected blankResults() on each error path, found ${blanks}`);
});

// ===========================================================================
// AUD-012 / AUD-013 - Working Hours + Break-even clear stale results on error
// ===========================================================================

test("AUD-012: working-hours showError() resets the result panel", () => {
  assert.match(workingHoursJs, /function\s+showError\s*\(/, "showError() missing");
  assert.match(workingHoursJs, /function\s+resetResults\s*\(/, "resetResults() missing");
  const m = workingHoursJs.match(/function\s+showError\s*\([^)]*\)\s*\{[\s\S]*?\}/);
  assert.ok(m, "could not isolate showError()");
  assert.match(m[0], /resetResults\(\)/, "showError() must call resetResults()");
});

test("AUD-013: break-even showError() resets the result panel", () => {
  const m = breakEvenJs.match(/function\s+showError\s*\([^)]*\)\s*\{[\s\S]*?\}/);
  assert.ok(m, "could not isolate break-even showError()");
  assert.match(m[0], /resetResults\(\)/, "break-even showError() must call resetResults()");
});

// ===========================================================================
// AUD-014 / AUD-015 - Pallet + Container reject fractional totals
// ===========================================================================

test("AUD-014: pallet calculator rejects a fractional carton count", () => {
  assert.match(palletJs, /!Number\.isInteger\(a\.total\)/, "pallet integer-total guard missing");
  assert.match(palletJs, /Total cartons must be a whole number/, "pallet fractional message missing");
  assert.equal(Number.isInteger(200.5), false, "200.5 must not be treated as whole");
});

test("AUD-015: container loading rejects a fractional carton count", () => {
  assert.match(containerJs, /!Number\.isInteger\(a\.total\)/, "container integer-total guard missing");
  assert.match(containerJs, /Total cartons must be a whole number/, "container fractional message missing");
  assert.equal(Number.isInteger(1000.5), false, "1000.5 must not be treated as whole");
});

// ===========================================================================
// AUD-016 / AUD-017 - mobile table overflow
// ===========================================================================

test("AUD-016: CBM calculator no longer hides table overflow on mobile", () => {
  const c = cbmCss.replace(/\s+/g, "");
  assert.doesNotMatch(c, /\.table-wrap\{overflow:visible\}/, "mobile overflow:visible override must be gone");
  assert.match(c, /\.table-wrap\{overflow-x:auto;overflow-y:hidden;max-width:100%\}/, "mobile table-wrap must scroll inside its wrapper");
  assert.match(c, /\.table-wrap\{overflow-x:auto;margin-top:20px\}/, "base table-wrap scroll missing");
});

test("AUD-017: accuracy analyzer constrains its wide tables", () => {
  assert.match(
    accuracyCss,
    /\.editable-table-wrap,\s*\.results-table-wrap\{overflow:auto;max-width:100%;min-width:0/,
    "table wrappers must cap width and allow shrinking"
  );
  assert.match(
    accuracyCss,
    /@media\s*\(max-width:760px\)\{[\s\S]*\.editable-table\{min-width:900px\}/,
    "mobile editable-table min-width cap missing"
  );
});

// ===========================================================================
// AUD-019 - shared skip link on every page
// ===========================================================================

const PAGES = [];
(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if ([".git", ".vscode", "node_modules", "reports", "tests"].includes(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (entry === "index.html") PAGES.push(full);
  }
})(repoRoot);

test("AUD-019: a skip-to-content link is the first focusable element on every page", () => {
  assert.ok(PAGES.length >= 64, `expected >= 64 pages, found ${PAGES.length}`);
  const missing = [];
  const misTargeted = [];
  const misOrdered = [];
  for (const f of PAGES) {
    const html = readFileSync(f, "utf8");
    const skip = html.match(/<a class="skip-link" href="#([^"]+)">/);
    if (!skip) { missing.push(f); continue; }
    const id = skip[1];
    if (!new RegExp(`<main[^>]*\\bid="${id}"`).test(html)) misTargeted.push(f);
    // The skip link must precede the <header> so it is focused first on Tab.
    const skipAt = html.indexOf('class="skip-link"');
    const headerAt = html.indexOf('<header class="site-header">');
    if (headerAt !== -1 && skipAt > headerAt) misOrdered.push(f);
  }
  assert.equal(missing.length, 0, `pages without a skip link:\n${missing.join("\n")}`);
  assert.equal(misTargeted.length, 0, `skip link targets a missing #id:\n${misTargeted.join("\n")}`);
  assert.equal(misOrdered.length, 0, `skip link must come before the header:\n${misOrdered.join("\n")}`);
});

test("AUD-019: the shared skip-link styles are defined once, site-wide", () => {
  assert.match(consistencyCss, /\.skip-link\{/, "skip-link base style missing");
  assert.match(consistencyCss, /\.skip-link:focus\{[^}]*top:0/, "skip-link must reveal on focus");
});

// ===========================================================================
// AUD-018 - Cycle Count Planner must not leak raw JSON parser text
// ===========================================================================

const cycleCountJs = read("assets/js/cycle-count-planner.js");

test("AUD-018: backup restore parses through a friendly guard, not raw JSON.parse", () => {
  assert.match(
    cycleCountJs,
    /function parseBackup\(text\)\s*\{\s*try\s*\{\s*return JSON\.parse\(text\);\s*\}\s*catch\s*\{/,
    "parseBackup must wrap JSON.parse in try/catch"
  );
  assert.match(
    cycleCountJs,
    /is not valid JSON/,
    "the malformed-backup message must be human readable"
  );
  // The two user entry points (uploaded file + saved device copy) must both use it.
  assert.match(cycleCountJs, /restore\(parseBackup\(text\)\)/, "loadLocal must use parseBackup");
  assert.match(
    cycleCountJs,
    /readFile\(event\.target,\s*text\s*=>\s*restore\(parseBackup\(text\)\)\)/,
    "the uploaded backup path must use parseBackup"
  );
  // No unguarded JSON.parse may remain anywhere in the planner.
  const rawParses = cycleCountJs.match(/JSON\.parse\(text\)/g) || [];
  assert.equal(rawParses.length, 1, "only parseBackup should call JSON.parse(text)");
});

// Faithful re-implementation of the AUD-018 guard for behavioural coverage.
function parseBackup(text) {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      "This file is not valid JSON. Choose a DIXANI cycle count backup (.json) file and try again."
    );
  }
}

test("AUD-018: malformed backup yields a readable error, valid backup still parses", () => {
  assert.throws(
    () => parseBackup("{not valid json"),
    (err) => {
      assert.ok(!/position \d+|Unexpected|Expected property/i.test(err.message),
        "raw parser text must not reach the user");
      assert.match(err.message, /not valid JSON/);
      return true;
    }
  );
  const good = { version: 1, items: [], settings: {}, history: [] };
  assert.deepEqual(parseBackup(JSON.stringify(good)), good);
});

// ===========================================================================
// AUD-020 - keep rendered <title> lengths display-safe
// ===========================================================================

test("AUD-020: no page title exceeds 65 rendered characters and all stay unique", () => {
  const titles = [];
  for (const f of PAGES) {
    const html = readFileSync(f, "utf8");
    const m = html.match(/<title>([\s\S]*?)<\/title>/);
    assert.ok(m, `missing <title> in ${f}`);
    const rendered = m[1]
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&[a-z]+;/gi, "x")
      .trim();
    titles.push({ file: f, rendered, len: rendered.length });
  }
  const tooLong = titles.filter((t) => t.len > 65);
  assert.equal(
    tooLong.length,
    0,
    `titles over 65 rendered chars:\n${tooLong.map((t) => `${t.len} ${t.rendered}`).join("\n")}`
  );
  const seen = new Map();
  const dupes = [];
  for (const t of titles) {
    if (seen.has(t.rendered)) dupes.push(`${t.rendered} (${t.file})`);
    seen.set(t.rendered, t.file);
  }
  assert.equal(dupes.length, 0, `duplicate titles:\n${dupes.join("\n")}`);
});





