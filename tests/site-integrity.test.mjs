// Site-wide integrity checks: title uniqueness, canonical correctness,
// internal link resolution, robots coverage, OG/Twitter completeness and
// analytics integrity. Guards the P0 fixes while P1 changes are applied.
//
// Run: node tests/site-integrity.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, sep, dirname, resolve } from "node:path";

const ROOT = process.cwd();
const SKIP = new Set([".git", ".vscode", "node_modules", "reports", "tests", "downloads"]);

// Non-content HTML: search-engine verification tokens etc.
const isContentPage = (name) => !/^google[0-9a-f]+\.html$/i.test(name);

const PAGES = [];
(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (SKIP.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (entry.endsWith(".html") && isContentPage(entry)) PAGES.push(full);
  }
})(ROOT);

const read = (f) => readFileSync(f, "utf8");
const rel = (f) => relative(ROOT, f).split(sep).join("/");

// Attribute-order-independent extraction: grab the whole tag, then pull the
// attribute out of it. Avoids `<link href rel>` vs `<link rel href>` mismatches.
const attr = (tag, name) => {
  if (!tag) return "";
  const m = tag.match(new RegExp(name + "\\s*=\\s*[\"']([^\"']*)[\"']", "i"));
  return m ? m[1] : "";
};
const allTags = (html, tagName) => html.match(new RegExp("<" + tagName + "\\b[^>]*>", "gi")) || [];
const tagsWhere = (html, tagName, attrName, attrValue) =>
  allTags(html, tagName).filter((t) => attr(t, attrName).toLowerCase() === attrValue.toLowerCase());
const metaByName = (html, name) => tagsWhere(html, "meta", "name", name);
const metaByProp = (html, prop) => tagsWhere(html, "meta", "property", prop);
const canonicalTag = (html) => tagsWhere(html, "link", "rel", "canonical")[0] || "";
const titleOf = (html) => ((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "").trim();

test("all pages are discoverable", () => {
  assert.ok(PAGES.length >= 64, `expected >= 64 html pages, found ${PAGES.length}`);
});

test("every page has a unique, non-empty <title>", () => {
  const seen = new Map();
  for (const f of PAGES) {
    const t = titleOf(read(f));
    assert.ok(t.length > 0, `empty or missing <title>: ${rel(f)}`);
    assert.ok(!seen.has(t), `duplicate title "${t}" in ${rel(f)} and ${seen.get(t)}`);
    seen.set(t, rel(f));
  }
});

test("every page has a meta description and a robots directive", () => {
  for (const f of PAGES) {
    const h = read(f);
    assert.ok(metaByName(h, "description").length > 0, `missing meta description: ${rel(f)}`);
    assert.ok(metaByName(h, "robots").length > 0, `missing robots meta: ${rel(f)}`);
  }
});

test("canonical URLs match the page's own path and are unique", () => {
  const seen = new Map();
  for (const f of PAGES) {
    const tag = canonicalTag(read(f));
    assert.ok(tag, `missing canonical: ${rel(f)}`);
    const url = attr(tag, "href");
    assert.ok(url.startsWith("https://dixani.com/"), `bad canonical href in ${rel(f)}: ${url}`);

    const expected = "/" + rel(f).replace(/index\.html$/, "");
    const actual = new URL(url).pathname;
    assert.equal(actual, expected, `canonical/path mismatch in ${rel(f)}`);

    assert.ok(!seen.has(actual), `duplicate canonical ${actual}: ${rel(f)} and ${seen.get(actual)}`);
    seen.set(actual, rel(f));
  }
});

test("every internal link resolves to a file that exists", () => {
  const broken = [];
  for (const f of PAGES) {
    for (const m of read(f).matchAll(/href=["'](\/[^"'#?]*)["']/g)) {
      const target = m[1];
      if (/\.(png|jpg|jpeg|svg|ico|webp|gif|pdf|xml|txt|css|js|json)$/i.test(target)) continue;
      const clean = target.split("?")[0].split("#")[0];
      const candidates = clean.endsWith("/")
        ? [join(ROOT, clean, "index.html")]
        : [join(ROOT, clean), join(ROOT, clean, "index.html")];
      if (!candidates.some((c) => existsSync(c))) broken.push(`${rel(f)} -> ${target}`);
    }
  }
  assert.equal(broken.length, 0, `broken internal links:\n${broken.join("\n")}`);
});

test("relative asset/style/script URLs resolve on disk", () => {
  const broken = [];
  for (const f of PAGES) {
    const dir = dirname(f);
    for (const m of read(f).matchAll(/(?:href|src)=["']((?:\.\.?\/)[^"'#?]+)["']/g)) {
      const clean = m[1].split("?")[0].split("#")[0];
      if (!existsSync(resolve(dir, clean))) broken.push(`${rel(f)} -> ${m[1]}`);
    }
  }
  assert.equal(broken.length, 0, `broken relative asset references:\n${broken.join("\n")}`);
});

test("every page carries exactly one OG image and a full Twitter card", () => {
  const props = ["og:image", "og:title", "og:description", "og:url", "og:type"];
  const names = ["twitter:card", "twitter:title", "twitter:description", "twitter:image"];
  for (const f of PAGES) {
    const h = read(f);
    for (const p of props) assert.equal(metaByProp(h, p).length, 1, `${p} count wrong: ${rel(f)}`);
    for (const n of names) assert.equal(metaByName(h, n).length, 1, `${n} count wrong: ${rel(f)}`);
  }
});

test("og:url matches the page canonical on every page", () => {
  for (const f of PAGES) {
    const h = read(f);
    const canon = attr(canonicalTag(h), "href");
    const ogUrl = attr(metaByProp(h, "og:url")[0] || "", "content");
    assert.ok(canon && ogUrl, `missing canonical/og:url on ${rel(f)}`);
    assert.equal(ogUrl, canon, `og:url != canonical on ${rel(f)}`);
  }
});

test("analytics wiring is intact on every page (tag IDs untouched)", () => {
  for (const f of PAGES) {
    const h = read(f);
    const count = (re) => (h.match(re) || []).length;
    assert.equal(count(/googletagmanager\.com\/gtag\/js\?id=G-LQEH9L9TZ4/g), 1, `gtag include count wrong: ${rel(f)}`);
    assert.equal(count(/G-LQEH9L9TZ4/g), 2, `tag ID reference count wrong: ${rel(f)}`);
    assert.equal(count(/static\.cloudflareinsights\.com/g), 1, `Cloudflare beacon count wrong: ${rel(f)}`);
  }
});

test("no raw HTML arrow entities remain in visible labels", () => {
  const offenders = [];
  for (const f of PAGES) {
    for (const m of read(f).matchAll(/>[^<]{0,200}&(rarr|larr);[^<]{0,200}</g)) {
      offenders.push(`${rel(f)}: ${m[0].trim()}`);
    }
  }
  assert.equal(offenders.length, 0, `raw arrow entities:\n${offenders.join("\n")}`);
});

test("meta descriptions stay within sane search-snippet lengths", () => {
  const dec = (s) =>
    s.replace(/&amp;/g, "&").replace(/&mdash;/g, "\u2014").replace(/&ndash;/g, "\u2013").replace(/&quot;/g, '"');
  const tooLong = [];
  for (const f of PAGES) {
    const content = attr(metaByName(read(f), "description")[0] || "", "content");
    if (!content) continue;
    const len = dec(content).length;
    if (len > 165) tooLong.push(`${rel(f)} (${len})`);
  }
  assert.equal(tooLong.length, 0, `descriptions still too long:\n${tooLong.join("\n")}`);
});
