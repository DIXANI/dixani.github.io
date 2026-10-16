// Cache-versioning guards.
//
// GitHub Pages serves /assets/** with `Cache-Control: max-age=14400` (4 hours).
// Without a content-derived version parameter, a returning visitor can keep
// executing the previous JavaScript for up to 4 hours after a deploy.
//
// Run: node tests/cache-version.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, relative, sep, dirname, resolve } from "node:path";

const ROOT = process.cwd();
const SKIP = new Set([".git", ".vscode", "node_modules", "reports", "tests", "downloads"]);
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

const rel = (f) => relative(ROOT, f).split(sep).join("/");

// Line endings are normalised to LF: `core.autocrlf=true` means these files are
// LF in git but CRLF on a Windows working copy, and the version must depend on
// the tracked content only (otherwise a fresh checkout changes every hash).
const hashOf = (abs) => {
  const canonical = Buffer.from(readFileSync(abs).toString("utf8").replace(/\r\n/g, "\n"), "utf8");
  return createHash("sha256").update(canonical).digest("hex").slice(0, 10);
};

const resolveLocal = (pageDir, src) => {
  if (/^(https?:)?\/\//i.test(src) || /^data:/i.test(src)) return null;
  const clean = src.split("?")[0].split("#")[0];
  if (!clean) return null;
  const abs = clean.startsWith("/") ? join(ROOT, clean) : resolve(pageDir, clean);
  return existsSync(abs) && statSync(abs).isFile() ? abs : null;
};

const SCRIPT_SRC = /<script\b[^>]*?\ssrc="([^"]+)"/g;

// Collect every local script reference with its declared version.
const refs = [];
for (const page of PAGES) {
  const html = readFileSync(page, "utf8");
  const pageDir = dirname(page);
  for (const m of html.matchAll(SCRIPT_SRC)) {
    const abs = resolveLocal(pageDir, m[1]);
    if (!abs) continue;
    const q = m[1].match(/[?&]v=([^&#]+)/);
    refs.push({ page: rel(page), src: m[1], abs, version: q ? q[1] : "" });
  }
}

test("every local <script src> carries a ?v= content version", () => {
  const bare = refs.filter((r) => !r.version).map((r) => `${r.page} -> ${r.src}`);
  assert.equal(bare.length, 0, `scripts without a cache version:\n${bare.join("\n")}`);
  assert.ok(refs.length >= 90, `expected >= 90 local script refs, found ${refs.length}`);
});

test("each declared version equals the SHA-256 prefix of the file on disk", () => {
  const wrong = [];
  for (const r of refs) {
    const expected = hashOf(r.abs);
    if (r.version !== expected) wrong.push(`${r.page} -> ${r.src} (expected ?v=${expected})`);
  }
  assert.equal(wrong.length, 0, `stale cache versions - run: node tests/build-cache-versions.mjs\n${wrong.join("\n")}`);
});

test("the same file is never referenced with two different versions", () => {
  const byFile = new Map();
  for (const r of refs) {
    if (!byFile.has(r.abs)) byFile.set(r.abs, new Set());
    byFile.get(r.abs).add(r.version);
  }
  const split = [...byFile].filter(([, v]) => v.size > 1).map(([f, v]) => `${rel(f)}: ${[...v].join(", ")}`);
  assert.equal(split.length, 0, `inconsistent versions for one file:\n${split.join("\n")}`);
});

test("version derivation is deterministic (same bytes -> same hash, changed bytes -> new hash)", () => {
  const target = join(ROOT, "assets", "js", "main.js");
  assert.ok(existsSync(target), "assets/js/main.js must exist");

  const base = hashOf(target);
  assert.equal(base, hashOf(target), "hashing the same bytes twice must be stable");
  assert.match(base, /^[0-9a-f]{10}$/, "hash must be 10 lowercase hex chars");

  // Simulate a content change without touching the real file.
  const modified = createHash("sha256")
    .update(readFileSync(target))
    .update("// change")
    .digest("hex")
    .slice(0, 10);
  assert.notEqual(base, modified, "different content must produce a different version");
});

test("no runtime-generated cache busting (no Date.now / Math.random in tags)", () => {
  const offenders = [];
  for (const page of PAGES) {
    const html = readFileSync(page, "utf8");
    for (const m of html.matchAll(/<script\b[^>]*?src="([^"]+)"/g)) {
      if (/[?&]v=(Date\.now|Math\.random|\d{13})/i.test(m[1])) offenders.push(`${rel(page)} -> ${m[1]}`);
    }
  }
  assert.equal(offenders.length, 0, `non-deterministic cache busting:\n${offenders.join("\n")}`);
});

test("third-party scripts are never rewritten", () => {
  const ours = refs.filter((r) => /^https?:/i.test(r.src));
  assert.equal(ours.length, 0, `external URLs must not be versioned: ${ours.map((r) => r.src).join(", ")}`);

  // The analytics + beacon tags must remain byte-identical to their canonical form.
  for (const page of PAGES) {
    const html = readFileSync(page, "utf8");
    assert.equal(
      (html.match(/src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-LQEH9L9TZ4"/g) || []).length,
      1,
      `gtag src altered: ${rel(page)}`
    );
    assert.ok(
      /src="https:\/\/static\.cloudflareinsights\.com\/beacon\.min\.js"/.test(html),
      `cloudflare beacon src altered: ${rel(page)}`
    );
  }
});

test("search-index.js still precedes main.js on the homepage", () => {
  const html = readFileSync(join(ROOT, "index.html"), "utf8");
  const idx = html.indexOf("/assets/js/search-index.js");
  const main = html.indexOf("/assets/js/main.js");
  assert.ok(idx > -1, "homepage must load search-index.js");
  assert.ok(main > -1, "homepage must load main.js");
  assert.ok(idx < main, "search-index.js must load before main.js");
});

test("no duplicate local script loading on any page", () => {
  const dupes = [];
  for (const page of PAGES) {
    const html = readFileSync(page, "utf8");
    const seen = new Map();
    for (const m of html.matchAll(/<script\b[^>]*?\ssrc="([^"]+)"/g)) {
      if (/^(https?:)?\/\//i.test(m[1]) || /^data:/i.test(m[1])) continue;
      seen.set(m[1], (seen.get(m[1]) || 0) + 1);
    }
    for (const [src, n] of seen) if (n > 1) dupes.push(`${rel(page)} -> ${src} (x${n})`);
  }
  assert.equal(dupes.length, 0, `duplicate script loads:\n${dupes.join("\n")}`);
});
