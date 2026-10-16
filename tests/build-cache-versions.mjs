// Stamps a deterministic content hash onto every local <script src> reference
// so browsers and the CDN pick up new JavaScript immediately after a deploy.
//
// Why: GitHub Pages serves /assets/** with `Cache-Control: max-age=14400`
// (4 hours) and no version parameter. After a deploy, returning visitors keep
// executing the previously cached file for up to 4 hours.
//
// The hash is SHA-256 of the file's exact bytes, truncated to 10 hex chars.
// Same content -> same hash (stable). Changed content -> new hash (cache miss).
//
// Run: node tests/build-cache-versions.mjs
// Order: after `node tests/build-search-index.mjs` and after any JS edit,
//        but BEFORE `git commit` and `git push`.
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, relative, sep, dirname, resolve } from "node:path";

const ROOT = process.cwd();
const WRITE = !process.argv.includes("--check");
const HASH_LEN = 10;

// Only site content is scanned; tooling and assets directories are excluded.
const SKIP = new Set([".git", ".vscode", "node_modules", "reports", "tests", "downloads"]);

// Non-content HTML (search-engine verification tokens) must not be touched.
const isContentPage = (name) => !/^google[0-9a-f]+\.html$/i.test(name);

const pages = [];
(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (SKIP.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (entry.endsWith(".html") && isContentPage(entry)) pages.push(full);
  }
})(ROOT);

const rel = (f) => relative(ROOT, f).split(sep).join("/");

// ---- 1. Resolve every local <script src> to a file on disk ----------------
// Both "/assets/js/main.js" (root-absolute) and "../../assets/js/x.js"
// (page-relative) forms appear in the site, so resolve against the page dir.
const resolveLocal = (pageDir, src) => {
  if (/^(https?:)?\/\//i.test(src) || /^data:/i.test(src)) return null; // third-party
  const clean = src.split("?")[0].split("#")[0];
  if (!clean) return null;
  const abs = clean.startsWith("/") ? join(ROOT, clean) : resolve(pageDir, clean);
  return existsSync(abs) && statSync(abs).isFile() ? abs : null;
};

// ---- 2. Hash the raw bytes of each referenced script ---------------------
// IMPORTANT: `core.autocrlf=true` on Windows means the same file is LF in git
// (e.g. 4804 bytes) but CRLF on disk (4956 bytes). Hashing raw disk bytes would
// therefore produce a different version after a fresh `git checkout` even though
// the tracked content never changed. Text line endings are normalised to LF
// first so the version is a function of the *tracked* content only.
const hashCache = new Map();
const hashOf = (abs) => {
  if (!hashCache.has(abs)) {
    const bytes = readFileSync(abs);
    const canonical = Buffer.from(bytes.toString("utf8").replace(/\r\n/g, "\n"), "utf8");
    hashCache.set(abs, createHash("sha256").update(canonical).digest("hex").slice(0, HASH_LEN));
  }
  return hashCache.get(abs);
};

// ---- 3. Rewrite the src attribute, preserving everything else ------------
// Only the src attribute is touched: no reformatting, no attribute reordering,
// no changes to inline scripts, type="module", async, or third-party tags.
const SCRIPT_SRC = /(<script\b[^>]*?\ssrc=")([^"]+)(")/g;

let scannedTags = 0;
let localTags = 0;
let stamped = 0;
let unchanged = 0;
let missing = [];
const touchedFiles = [];
const seen = new Set(); // de-dupe: each (page, file) documented once

for (const page of pages) {
  const original = readFileSync(page, "utf8");
  const pageDir = dirname(page);
  let changed = false;

  const updated = original.replace(SCRIPT_SRC, (whole, pre, src, post) => {
    scannedTags++;
    const abs = resolveLocal(pageDir, src);
    if (!abs) {
      if (!/^(https?:)?\/\//i.test(src) && !/^data:/i.test(src)) missing.push(`${rel(page)} -> ${src}`);
      return whole;
    }
    localTags++;
    const version = hashOf(abs);
    const bare = src.split("?")[0].split("#")[0];
    const next = `${bare}?v=${version}`;
    if (next === src) {
      unchanged++;
    } else {
      stamped++;
      changed = true;
    }
    return pre + next + post;
  });

  if (changed) {
    touchedFiles.push(rel(page));
    if (WRITE) writeFileSync(page, updated, "utf8");
  }

  // Record referenced files once for reporting.
  for (const m of original.matchAll(SCRIPT_SRC)) {
    const abs = resolveLocal(pageDir, m[2]);
    if (abs) seen.add(abs);
  }
}

// ---- 4. Report -----------------------------------------------------------
const versioned = [...seen].sort().map((abs) => `  ${hashOf(abs)}  ${rel(abs)}`);
console.log(`HTML pages scanned : ${pages.length}`);
console.log(`<script src> tags  : ${scannedTags} (${localTags} local, ${scannedTags - localTags} third-party left untouched)`);
console.log(`local JS files     : ${seen.size}`);
console.log(`refs updated       : ${stamped}`);
console.log(`refs already fresh : ${unchanged}`);
console.log(`pages modified     : ${touchedFiles.length}${WRITE ? "" : " (dry run)"}`);
console.log(`\ncontent hashes (?v=...):\n${versioned.join("\n")}`);

if (missing.length) {
  console.error(`\nERROR: unresolved local <script src> (${missing.length}):\n${missing.map((m) => "  " + m).join("\n")}`);
  process.exitCode = 1;
}

if (!WRITE && stamped > 0) {
  console.error(`\nFAIL: ${stamped} cache-version reference(s) are stale. Run: node tests/build-cache-versions.mjs`);
  process.exitCode = 1;
}

if (!WRITE && stamped === 0) {
  console.log("\nOK: all cache versions are current.");
}
