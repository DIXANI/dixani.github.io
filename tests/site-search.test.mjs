// Regression tests for the DIXANI local site-search engine.
// Verifies: index generation, ranking precedence, partial/prefix matching,
// multi-word AND behaviour, the empty-result path, and that every indexed
// URL resolves to a real page (no dead search results).
//
// Run: node --test tests/
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();

/* Load the generated index exactly the way the browser does. */
const loadIndex = () => {
  const src = readFileSync(join(ROOT, "assets", "js", "search-index.js"), "utf8");
  const sandbox = { window: {} };
  new Function("window", src)(sandbox.window);
  return sandbox.window.DIXANI_SEARCH_INDEX;
};

const INDEX = loadIndex();

/* Mirror the scoring in assets/js/main.js so tests exercise shipped rules. */
const norm = (t) =>
  String(t || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s+.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const terms = (q) => norm(q).split(" ").filter(Boolean);
const rx = (w) => new RegExp("\\b" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

const score = (item, words) => {
  const t = norm(item.t);
  const h = norm(item.h1);
  const c = norm(item.c);
  const y = norm(item.y);
  const d = norm(item.d);
  const url = norm(item.u.replace(/\//g, " "));
  let total = 0;
  for (const w of words) {
    let best = 0;
    if (t === w || h === w) best = 100;
    else if (t.startsWith(w)) best = 70;
    else if (rx(w).test(t)) best = 55;
    else if (h.includes(w)) best = 45;
    else if (t.includes(w)) best = 30;
    else if (c.includes(w)) best = 22;
    else if (y.includes(w)) best = 15;
    else if (d.includes(w)) best = 10;
    else if (url.includes(w)) best = 8;
    if (best === 0) {
      if (w.length >= 3 && t.includes(w)) best = 25;
      else if (w.length >= 3 && d.includes(w)) best = 6;
      else return 0;
    }
    total += best;
  }
  const phrase = words.join(" ");
  if (t === phrase) total += 120;
  else if (t.includes(phrase)) total += 60;
  if (item.u === "/") total -= 5;
  return total;
};

const rank = (q) => {
  const words = terms(q);
  if (!words.length) return [];
  return INDEX.map((item) => ({ item, s: score(item, words) }))
    .filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s || a.item.t.localeCompare(b.item.t));
};

/* ================================================================== *
 * 1. Index integrity
 * ================================================================== */

test("index is generated and non-empty", () => {
  assert.ok(Array.isArray(INDEX), "DIXANI_SEARCH_INDEX must be an array");
  assert.ok(INDEX.length >= 60, `expected >= 60 indexed pages, got ${INDEX.length}`);
});

test("index covers every index.html page on the site", () => {
  const SKIP = new Set([".git", ".vscode", "node_modules", "reports", "tests", "downloads", "assets"]);
  const pages = [];
  (function walk(dir) {
    for (const entry of readdirSync(dir)) {
      if (SKIP.has(entry)) continue;
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (entry === "index.html") pages.push(full);
    }
  })(ROOT);
  const indexed = new Set(INDEX.map((r) => r.u));
  for (const file of pages) {
    const route = "/" + relative(ROOT, file).split(sep).join("/").replace(/index\.html$/, "");
    assert.ok(indexed.has(route), `missing from search index: ${route}`);
  }
  assert.equal(INDEX.length, pages.length, "index size must equal page count");
});

test("every indexed URL resolves to a real page on disk", () => {
  for (const row of INDEX) {
    const target = row.u === "/" ? "index.html" : join(row.u.replace(/^\//, ""), "index.html");
    assert.ok(existsSync(join(ROOT, target)), `search result points at a missing page: ${row.u}`);
  }
});

test("every entry has a title, category and type; URLs are unique", () => {
  const seen = new Set();
  for (const row of INDEX) {
    assert.ok(row.u && row.u.startsWith("/"), `bad url: ${JSON.stringify(row)}`);
    assert.ok(row.t && row.t.length > 2, `missing title for ${row.u}`);
    assert.ok(row.c, `missing category for ${row.u}`);
    assert.ok(row.y, `missing type for ${row.u}`);
    assert.ok(!seen.has(row.u), `duplicate index entry: ${row.u}`);
    seen.add(row.u);
  }
});

test("the index is not stale: every description matches the live page", () => {
  // The index is generated from each page's own meta description, so it must be
  // regenerated whenever a description changes. Without this guard a stale index
  // keeps serving outdated search snippets while every other test still passes.
  const decode = (s) =>
    s
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, " ")
      .trim();
  for (const row of INDEX) {
    const file = row.u === "/" ? "index.html" : join(row.u.replace(/^\//, ""), "index.html");
    const html = readFileSync(join(ROOT, file), "utf8");
    const tag = html.match(/<meta[^>]*name="description"[^>]*>/i);
    if (!tag) continue;
    const live = decode((tag[0].match(/content="([^"]*)"/) || [])[1] || "");
    assert.equal(
      row.d,
      live,
      `stale search index for ${row.u} - run: node tests/build-search-index.mjs`
    );
  }
});

test("titles are HTML-entity-free (safe to render as text)", () => {
  for (const row of INDEX) {
    assert.ok(!/&(amp|lt|gt|quot|mdash|ndash|rarr);/.test(row.t), `unescaped entity in title: ${row.t}`);
  }
});

/* ================================================================== *
 * 2. The regression that motivated the rewrite
 * ================================================================== */

test("queries outside inventory/variance/stock now return real results", () => {
  // The old implementation only matched three hardcoded substrings and
  // dumped everything else onto the homepage #tools anchor.
  for (const q of ["eoq", "vat", "pallet", "purchase order", "profit margin", "abc analysis", "cycle count"]) {
    const hits = rank(q);
    assert.ok(hits.length > 0, `"${q}" returned no results`);
    assert.notEqual(hits[0].item.u, "/#tools", `"${q}" still falls back to the homepage anchor`);
  }
});

/* ================================================================== *
 * 3. Ranking precedence
 * ================================================================== */

test("exact title matches outrank incidental mentions", () => {
  const hits = rank("EOQ Calculator");
  assert.ok(hits.length > 0);
  assert.equal(hits[0].item.u, "/inventory/eoq-calculator/");
});

test("known tool queries resolve to their own page first", () => {
  const cases = [
    ["variance", "/inventory/variance-report/"],
    ["safety stock", "/inventory/safety-stock/"],
    ["reorder point", "/inventory/reorder-point/"],
    ["break even", "/categories/finance/break-even-calculator/"],
    ["vat", "/categories/finance/vat-calculator/"],
    ["packing list", "/templates/warehouse/packing-list/"],
    ["supplier evaluation", "/templates/purchasing/supplier-evaluation/"],
  ];
  for (const [q, expected] of cases) {
    const hits = rank(q);
    assert.ok(hits.length > 0, `"${q}" returned nothing`);
    assert.equal(hits[0].item.u, expected, `"${q}" top hit was ${hits[0].item.u}`);
  }
});

/* ================================================================== *
 * 4. Partial / prefix matching
 * ================================================================== */

test("prefix queries match full words (calc -> calculator)", () => {
  const hits = rank("calc");
  assert.ok(hits.length >= 5, `expected several calculator hits, got ${hits.length}`);
  assert.ok(hits.some((h) => /calculator/i.test(h.item.t)), "prefix 'calc' should surface calculator pages");
});

/* ================================================================== *
 * 6. Wiring / no-regression checks
 * ================================================================== */

test("main.js loads the index and no longer hardcodes the 3-keyword redirect", () => {
  const js = readFileSync(join(ROOT, "assets", "js", "main.js"), "utf8");
  assert.ok(js.includes("DIXANI_SEARCH_INDEX"), "main.js must consume the generated index");
  assert.ok(
    !/q\.includes\("inventory"\)\s*\|\|\s*q\.includes\("variance"\)/.test(js),
    "old 3-keyword logic still present"
  );
  assert.ok(!js.includes('/#tools"'), "main.js must not bounce searches to the #tools anchor");
});

test("homepage wires up the search index script, results container and a11y attributes", () => {
  const html = readFileSync(join(ROOT, "index.html"), "utf8");
  assert.ok(html.includes('src="/assets/js/search-index.js"'), "search-index.js not loaded on the homepage");
  const idx = html.indexOf('src="/assets/js/search-index.js"');
  const main = html.indexOf('src="/assets/js/main.js"');
  assert.ok(idx > -1 && main > -1 && idx < main, "search-index.js must load before main.js");
  assert.ok(html.includes('id="searchResults"'), "results container missing");
  const input = html.match(/<input[^>]*id="siteSearch"[^>]*>/)[0];
  assert.ok(/aria-controls="searchResults"/.test(input), "input not linked to results container");
  assert.ok(/role="combobox"/.test(input), "combobox role missing");
  assert.ok(/aria-expanded="false"/.test(input), "combobox should start collapsed");
});

test("search styles are shipped for desktop and the mobile breakpoint", () => {
  const css = readFileSync(join(ROOT, "assets", "css", "templates.css"), "utf8");
  for (const sel of [".search-results", ".search-list", ".search-hit-title", ".search-empty"]) {
    assert.ok(css.includes(sel), `missing style: ${sel}`);
  }
  assert.ok(css.includes(".home-search{flex-direction:column}"), "mobile stacking rule for the search bar was removed");
});

/* ================================================================== *
 * 7. Stale root main.js removal (Task B)
 * ================================================================== */

test("stale root main.js is gone and nothing references it", () => {
  assert.ok(!existsSync(join(ROOT, "main.js")), "root main.js should be deleted");

  const files = [];
  (function walk(dir) {
    for (const entry of readdirSync(dir)) {
      if ([".git", ".vscode", "node_modules", "reports", "tests"].includes(entry)) continue;
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (entry.endsWith(".html")) files.push(full);
    }
  })(ROOT);

  for (const file of files) {
    const html = readFileSync(file, "utf8");
    assert.ok(!/src=["']\/main\.js["']/.test(html), `stale /main.js still referenced by ${relative(ROOT, file)}`);
  }
});


test("partial words match mid-string (turn -> turnover)", () => {
  const hits = rank("turn");
  assert.ok(hits.some((h) => h.item.u === "/inventory/inventory-turnover/"), "'turn' should find Inventory Turnover");
});

/* ================================================================== *
 * 5. Multi-word (AND) behaviour + empty state
 * ================================================================== */

test("multi-word queries require every term to be present", () => {
  const hits = rank("warehouse picking");
  assert.ok(hits.length > 0);
  for (const h of hits) {
    const blob = norm([h.item.t, h.item.h1, h.item.c, h.item.y, h.item.d, h.item.u].join(" "));
    assert.ok(blob.includes("warehouse"), `result lost the 'warehouse' term: ${h.item.u}`);
    assert.ok(blob.includes("picking"), `result lost the 'picking' term: ${h.item.u}`);
  }
});

test("nonsense queries return zero results so the empty state can render", () => {
  assert.equal(rank("zzzzqqqxyw").length, 0);
  assert.equal(rank("").length, 0);
});
