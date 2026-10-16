// Adds the established OG/Twitter meta block to pages that have none.
// Values are derived from each page's OWN <title>, meta description and
// canonical URL — nothing is invented, and the shared social preview image
// already used by the rest of the site is reused.
//
// Idempotent: pages that already have any og: tag are skipped.
// Run: node tests/add-social-meta.mjs
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();
const SOCIAL_IMAGE = "https://dixani.com/assets/images/dixani-social-preview.png";
const SKIP = new Set([".git", ".vscode", "node_modules", "reports", "tests", "downloads", "assets"]);

const dec = (s) =>
  String(s || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&rarr;/g, "→")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/\s+/g, " ")
    .trim();

const enc = (s) =>
  dec(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const files = [];
(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (SKIP.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (entry === "index.html") files.push(full);
  }
})(ROOT);

files.sort();
let changed = 0;
const skipped = [];

for (const file of files) {
  let html = readFileSync(file, "utf8");
  if (/property=["']og:/.test(html)) {
    skipped.push(relative(ROOT, file));
    continue;
  }

  const title = dec((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "");
  const descTag = html.match(/<meta[^>]*name=["']description["'][^>]*>/i);
  let desc = descTag ? dec((descTag[0].match(/content=["']([\s\S]*?)["']/i) || [])[1] || "") : "";
  const canon = (html.match(/<link[^>]*rel=["']canonical["'][^>]*>/i) || [])[0];
  if (!title || !canon) {
    console.error(`SKIP (missing title/canonical): ${relative(ROOT, file)}`);
    continue;
  }
  const url = dec((canon.match(/href=["']([^"']+)["']/i) || [])[1] || "");
  if (!desc) desc = `Free ${title.replace(/\s*\|\s*DIXANI\s*$/, "")} from DIXANI.`;

  const block =
    `\n<meta property="og:type" content="website"/>` +
    `\n<meta property="og:site_name" content="DIXANI"/>` +
    `\n<meta property="og:title" content="${enc(title)}"/>` +
    `\n<meta property="og:description" content="${enc(desc)}"/>` +
    `\n<meta property="og:url" content="${enc(url)}"/>` +
    `\n<meta property="og:image" content="${SOCIAL_IMAGE}"/>` +
    `\n<meta property="og:locale" content="en_US"/>` +
    `\n<meta name="twitter:card" content="summary_large_image"/>` +
    `\n<meta name="twitter:title" content="${enc(title)}"/>` +
    `\n<meta name="twitter:description" content="${enc(desc)}"/>` +
    `\n<meta name="twitter:image" content="${SOCIAL_IMAGE}"/>`;

  // Insert directly after the canonical link, before the first stylesheet.
  html = html.replace(canon, canon + block);
  writeFileSync(file, html, "utf8");
  changed++;
}

console.log(`Added social meta to ${changed} page(s); ${skipped.length} already had it.`);
