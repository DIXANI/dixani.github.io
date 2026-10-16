// Validates the generated JSON-LD and the internal-link graph added in P2-A.
//
// Every assertion below is a guard against regressions that would either
// invalidate rich-result eligibility or re-introduce an orphan page.
//
// Run: node tests/schema.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();
const SKIP = new Set([".git", ".vscode", "node_modules", "reports", "tests", "downloads", "assets"]);
const isContentPage = (name) => !/^google[0-9a-f]+\.html$/i.test(name);

const PAGES = [];
(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (SKIP.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (entry === "index.html" && isContentPage(entry)) PAGES.push(full);
  }
})(ROOT);

const read = (f) => readFileSync(f, "utf8");
const rel = (f) => relative(ROOT, f).split(sep).join("/");
const routeOf = (f) => "/" + rel(f).replace(/index\.html$/, "");

const START = "<!-- schema:generated -->";
const END = "<!-- /schema:generated -->";
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Parse every JSON-LD block in a document.
const ldBlocks = (html) => {
  const out = [];
  for (const m of html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    out.push({ raw: m[1], parsed: JSON.parse(m[1]) });
  }
  return out;
};

// The generated region only (null when the page has none).
const regionOf = (html) => {
  const s = html.indexOf(START);
  const e = html.indexOf(END);
  return s === -1 || e === -1 ? null : html.slice(s, e);
};

const pages = PAGES.map((f) => ({ file: f, route: routeOf(f), html: read(f) }));
const startPages = pages.filter((p) => p.html.includes(START));
const endPages = pages.filter((p) => p.html.includes(END));

// ---------------------------------------------------------------------------
// Structure of the generated region
// ---------------------------------------------------------------------------

test("generated regions are balanced (every start marker has an end marker)", () => {
  assert.equal(startPages.length, endPages.length, "marker count mismatch");
  for (const p of pages) {
    const starts = (p.html.match(new RegExp(esc(START), "g")) || []).length;
    const ends = (p.html.match(new RegExp(esc(END), "g")) || []).length;
    assert.equal(starts, ends, `unbalanced markers in ${p.route}`);
    assert.ok(starts <= 1, `duplicate generated region in ${p.route}`);
  }
});

test("at least 50 pages receive generated markup", () => {
  assert.ok(startPages.length >= 50, `expected >= 50 generated pages, found ${startPages.length}`);
});

test("the homepage is not given a generated region (no duplicate Organization)", () => {
  const home = pages.find((p) => p.route === "/");
  assert.ok(home, "homepage not found");
  assert.ok(!home.html.includes(START), "homepage must not receive generated schema");
});

// ---------------------------------------------------------------------------
// JSON validity and claim safety
// ---------------------------------------------------------------------------

test("every JSON-LD block on every page parses as valid JSON", () => {
  for (const p of pages) {
    for (const b of ldBlocks(p.html)) {
      assert.ok(b.parsed && typeof b.parsed === "object", `unparseable JSON-LD in ${p.route}`);
    }
  }
});

test("no fabricated ratings, reviews, authors or dates are generated", () => {
  const banned = ["aggregateRating", "ratingValue", "reviewCount", "ratingCount", "datePublished", "dateModified"];
  const offenders = [];
  for (const p of pages) {
    const region = regionOf(p.html);
    if (!region) continue; // only audit what this phase generated
    for (const key of banned) if (region.includes(key)) offenders.push(`${p.route}: ${key}`);
  }
  assert.equal(offenders.length, 0, `fabricated schema claims:\n${offenders.join("\n")}`);
});

test("no FAQPage schema is generated in P2-A", () => {
  const offenders = pages.filter((p) => (regionOf(p.html) || "").includes("FAQPage")).map((p) => p.route);
  assert.equal(offenders.length, 0, `FAQPage must not be generated in P2-A:\n${offenders.join("\n")}`);
});

test("no HowTo or Product schema is generated", () => {
  const offenders = [];
  for (const p of pages) {
    const region = regionOf(p.html) || "";
    if (/"@type"\s*:\s*"(HowTo|Product)"/.test(region)) offenders.push(p.route);
  }
  assert.equal(offenders.length, 0, `unexpected schema type:\n${offenders.join("\n")}`);
});

// ---------------------------------------------------------------------------
// BreadcrumbList correctness
// ---------------------------------------------------------------------------

test("breadcrumb positions are contiguous and start at Home", () => {
  for (const p of pages) {
    const region = regionOf(p.html);
    if (!region) continue;
    for (const m of region.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
      const obj = JSON.parse(m[1]);
      if (obj["@type"] !== "BreadcrumbList") continue;

      const items = obj.itemListElement;
      assert.ok(Array.isArray(items) && items.length >= 2, `breadcrumb too short in ${p.route}`);
      items.forEach((it, i) => {
        assert.equal(it.position, i + 1, `non-contiguous position in ${p.route}`);
        assert.ok(it.name && it.item, `missing name/item in ${p.route}`);
      });
      assert.equal(items[0].item, "https://dixani.com/", `first crumb is not Home in ${p.route}`);
      assert.equal(
        items[items.length - 1].item,
        "https://dixani.com" + p.route,
        `last crumb is not the page itself in ${p.route}`
      );
    }
  }
});

test("no page declares more than one BreadcrumbList", () => {
  for (const p of pages) {
    const count = (p.html.match(/"@type"\s*:\s*"BreadcrumbList"/g) || []).length;
    assert.ok(count <= 1, `${count} BreadcrumbList blocks in ${p.route}`);
  }
});

test("no page declares more than one WebApplication", () => {
  for (const p of pages) {
    const count = (p.html.match(/"@type"\s*:\s*"(Web)?Application"/g) || []).length;
    assert.ok(count <= 1, `${count} application blocks in ${p.route}`);
  }
});

// ---------------------------------------------------------------------------
// WebApplication correctness
// ---------------------------------------------------------------------------

test("every generated WebApplication has the required, truthful properties", () => {
  for (const p of pages) {
    const region = regionOf(p.html);
    if (!region) continue;
    for (const m of region.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
      const obj = JSON.parse(m[1]);
      if (obj["@type"] !== "WebApplication") continue;

      assert.ok(obj.name, `missing name in ${p.route}`);
      assert.equal(obj.url, "https://dixani.com" + p.route, `url mismatch in ${p.route}`);
      assert.ok(obj.applicationCategory, `missing applicationCategory in ${p.route}`);
      assert.equal(obj.isAccessibleForFree, true, `isAccessibleForFree wrong in ${p.route}`);
      assert.equal(obj.offers["@type"], "Offer", `offers wrong in ${p.route}`);
      assert.equal(obj.offers.price, "0", `price wrong in ${p.route}`);
      assert.equal(obj.offers.priceCurrency, "USD", `priceCurrency wrong in ${p.route}`);

      // Properties that would be fabrication on a free tool with no reviews.
      assert.ok(!("aggregateRating" in obj), `aggregateRating present in ${p.route}`);
      assert.ok(!("softwareVersion" in obj), `softwareVersion present in ${p.route}`);
    }
  }
});

test("generated schema URLs match each page's canonical URL", () => {
  for (const p of pages) {
    const region = regionOf(p.html);
    if (!region) continue;
    const tag =
      (p.html.match(/<link[^>]*rel=["']canonical["'][^>]*>/i) || [])[0] ||
      (p.html.match(/<link[^>]*href=["'][^"']+["'][^>]*rel=["']canonical["'][^>]*>/i) || [])[0] ||
      "";
    const href = (tag.match(/href=["']([^"']+)["']/i) || [])[1];
    assert.ok(href, `no canonical in ${p.route}`);

    for (const m of region.matchAll(/"url"\s*:\s*"([^"]+)"/g)) {
      assert.equal(m[1], href, `schema url != canonical in ${p.route}`);
    }
  }
});

// ---------------------------------------------------------------------------
// Internal link integrity
// ---------------------------------------------------------------------------

test("every internal link resolves to an existing file", () => {
  const broken = [];
  for (const p of pages) {
    for (const m of p.html.matchAll(/href=["'](\/[^"'#?]*)["']/g)) {
      const target = m[1];
      if (/\.(png|jpg|jpeg|svg|ico|webp|gif|pdf|xml|txt|css|js|json)$/i.test(target)) continue;
      const clean = target.split("?")[0].split("#")[0];
      const candidates = clean.endsWith("/")
        ? [join(ROOT, clean, "index.html")]
        : [join(ROOT, clean), join(ROOT, clean, "index.html")];
      if (!candidates.some((c) => existsSync(c))) broken.push(`${p.route} -> ${target}`);
    }
  }
  assert.equal(broken.length, 0, `broken internal links:\n${broken.join("\n")}`);
});

test("the P2-A link targets are all reachable from content", () => {
  const targets = [
    "/categories/finance/simple-interest-calculator/",
    "/simulators/warehouse-shift-challenge/",
    "/templates/warehouse/packing-list/",
    "/templates/inventory/reorder-level-tracker/",
    "/templates/purchasing/purchase-order/",
    "/guides/abc-inventory-analysis/",
    "/guides/warehouse-space-utilization/",
    "/categories/business/profit-margin-calculator/",
  ];
  const counts = new Map(targets.map((t) => [t, 0]));
  for (const p of pages) {
    for (const [t] of counts) {
      if (p.html.includes(`href="${t}"`) || p.html.includes(`href='${t}'`)) counts.set(t, counts.get(t) + 1);
    }
  }
  for (const [t, n] of counts) assert.ok(n >= 1, `P2-A target has no inbound link: ${t}`);
});

test("no page is an orphan (every page has at least one inbound internal link)", () => {
  const allRoutes = new Set(pages.map((p) => p.route));
  const inbound = new Map([...allRoutes].map((r) => [r, 0]));
  for (const p of pages) {
    for (const m of p.html.matchAll(/href=["'](\/[^"'#?]*)["']/g)) {
      let t = m[1].split("?")[0].split("#")[0];
      if (/\.(png|jpg|jpeg|svg|ico|webp|gif|pdf|xml|txt|css|js|json)$/i.test(t)) continue;
      if (!t.endsWith("/")) t += "/";
      if (inbound.has(t) && t !== p.route) inbound.set(t, inbound.get(t) + 1);
    }
  }
  const orphans = [...inbound].filter(([, n]) => n === 0).map(([r]) => r);
  assert.equal(orphans.length, 0, `orphan pages:\n${orphans.join("\n")}`);
});

test("anchors use descriptive text, not bare URLs or empty labels", () => {
  const bad = [];
  for (const p of pages) {
    for (const m of p.html.matchAll(/<a\b[^>]*href=["'](\/[^"'#?]*)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
      const text = m[2].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
      if (/^https?:\/\//.test(text) || /^(click here|here|read more|link)$/i.test(text)) {
        bad.push(`${p.route} -> ${m[1]} ("${text}")`);
      }
    }
  }
  assert.equal(bad.length, 0, `non-descriptive anchors:\n${bad.join("\n")}`);
});

// ---------------------------------------------------------------------------
// Content and analytics must be untouched
// ---------------------------------------------------------------------------

test("analytics identifiers are unchanged on every page", () => {
  for (const p of pages) {
    const count = (re) => (p.html.match(re) || []).length;
    assert.equal(count(/googletagmanager\.com\/gtag\/js\?id=G-LQEH9L9TZ4/g), 1, `gtag wrong: ${p.route}`);
    assert.equal(count(/G-LQEH9L9TZ4/g), 2, `tag ID wrong: ${p.route}`);
    assert.equal(count(/static\.cloudflareinsights\.com/g), 1, `beacon wrong: ${p.route}`);
  }
});

test("every page keeps exactly one <h1> and one canonical", () => {
  for (const p of pages) {
    const h1 = (p.html.match(/<h1\b/gi) || []).length;
    assert.equal(h1, 1, `expected 1 <h1> in ${p.route}, found ${h1}`);
    const canon = (p.html.match(/rel=["']canonical["']/gi) || []).length;
    assert.equal(canon, 1, `expected 1 canonical in ${p.route}, found ${canon}`);
  }
});
