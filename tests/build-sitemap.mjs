// Synchronises <lastmod> on every URL in sitemap.xml using each page's real
// last-modified date (from the page's visible "Last updated" metadata,
// article:modified_time, or git commit history).
//
// Run:    node tests/build-sitemap.mjs
// Check:  node tests/build-sitemap.mjs --check
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
const WRITE = !process.argv.includes("--check");
const SITEMAP_PATH = join(ROOT, "sitemap.xml");

const MONTHS = {
  january: "01",
  february: "02",
  march: "03",
  april: "04",
  may: "05",
  june: "06",
  july: "07",
  august: "08",
  september: "09",
  october: "10",
  november: "11",
  december: "12",
};

function parseHumanDate(str) {
  const m = String(str || "").match(/([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})/);
  if (!m) return null;
  const mm = MONTHS[m[1].toLowerCase()];
  if (!mm) return null;
  const dd = String(m[2]).padStart(2, "0");
  return `${m[3]}-${mm}-${dd}`;
}

const SITEWIDE_SWEEPS = new Set([
  "1fcf063", "741004b", "4111028", "c8cb57e", "b06ec14",
  "3144c4d", "b0ecc17", "4535788", "4225730", "2b25d3b",
  "61a56a4", "7657354",
]);

const CONTENT_IN_0F99E7A = new Set([
  "categories/converters/volumetric-weight-calculator/index.html",
  "logistics/cbm-calculator/index.html",
  "templates/inventory/stock-variance-report/index.html",
  "templates/purchasing/request-for-quotation/index.html",
  "templates/warehouse/picking-list/index.html",
  "templates/purchasing/purchase-requisition/index.html",
  "inventory/dio-calculator/index.html",
  "guides/inventory-accuracy-percentage/index.html",
  "templates/index.html",
]);

const CONTENT_IN_1FCF063 = new Set([
  "disclaimer/index.html",
  "author/dinesh-madushanka/index.html",
  "about/index.html",
  "contact/index.html",
]);

function realLastModForPage(relPath) {
  const full = join(ROOT, relPath);
  if (!existsSync(full)) throw new Error(`Missing page on disk for sitemap URL: ${relPath}`);
  const html = readFileSync(full, "utf8");

  // 1. Check visible "Last updated:" in .guide-meta or prose
  const visibleMatch =
    html.match(/<strong>\s*(?:Last updated|Updated):\s*<\/strong>\s*([A-Za-z]+\s+\d{1,2},\s*\d{4})/i) ||
    html.match(/Last updated:\s*([A-Za-z]+\s+\d{1,2},\s*\d{4})/i);
  const visibleIso = visibleMatch ? parseHumanDate(visibleMatch[1]) : null;

  // 2. Check article:modified_time
  const artMod = (html.match(/property="article:modified_time"\s+content="(\d{4}-\d{2}-\d{2})"/) || [])[1];

  // 3. Check git commit history for substantive page edits
  const logLines = execSync(`git log --format="%h %cs" -- "${relPath}"`).toString().trim().split("\n").filter(Boolean);
  let gitMod = logLines.length ? logLines[logLines.length - 1].split(" ")[1] : "2026-11-22";
  for (const line of logLines) {
    const [hash, date] = line.split(" ");
    if (hash === "1fcf063" && !CONTENT_IN_1FCF063.has(relPath)) continue;
    if (hash === "0f99e7a" && !CONTENT_IN_0F99E7A.has(relPath)) continue;
    if (SITEWIDE_SWEEPS.has(hash)) continue;
    gitMod = date;
    break;
  }

  const candidates = [visibleIso, artMod, gitMod].filter(Boolean).sort();
  return visibleIso || candidates[candidates.length - 1];
}

const original = readFileSync(SITEMAP_PATH, "utf8");
let urlCount = 0;
let updatedCount = 0;

const updated = original.replace(/^[ \t]*<url>\s*([\s\S]*?)\s*<\/url>/gm, (whole, inner) => {
  urlCount++;
  const locMatch = inner.match(/<loc>\s*(https:\/\/dixani\.com\/[^<]*)\s*<\/loc>/);
  if (!locMatch) throw new Error(`Malformed <url> block without <loc>: ${whole}`);
  const loc = locMatch[1].trim();
  const pathname = new URL(loc).pathname;
  const relPath = (pathname === "/" ? "index.html" : pathname.slice(1) + "index.html").replace(/\\/g, "/");
  const lastmod = realLastModForPage(relPath);

  const freqMatch = inner.match(/<changefreq>([^<]+)<\/changefreq>/);
  const prioMatch = inner.match(/<priority>([^<]+)<\/priority>/);

  const lines = [
    "  <url>",
    `    <loc>${loc}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
  ];
  if (freqMatch) lines.push(`    <changefreq>${freqMatch[1].trim()}</changefreq>`);
  if (prioMatch) lines.push(`    <priority>${prioMatch[1].trim()}</priority>`);
  lines.push("  </url>");

  const next = lines.join("\n");
  if (next.trim() !== whole.trim()) updatedCount++;
  return next;
});

const normLf = (s) => s.replace(/\r\n/g, "\n");

if (WRITE && normLf(updated) !== normLf(original)) {
  writeFileSync(SITEMAP_PATH, normLf(updated), "utf8");
}

console.log(`Sitemap URLs scanned : ${urlCount}`);
console.log(`URLs with <lastmod>  : ${(updated.match(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g) || []).length}`);
console.log(`Entries reformatted  : ${updatedCount}${WRITE ? "" : " (dry run)"}`);

if (!WRITE && normLf(updated) !== normLf(original)) {
  console.error("FAIL: sitemap.xml is out of sync. Run: node tests/build-sitemap.mjs");
  process.exitCode = 1;
} else if (!WRITE) {
  console.log("OK: sitemap.xml is current and all URLs have <lastmod>.");
}
