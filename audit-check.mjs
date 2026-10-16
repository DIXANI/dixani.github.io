// READ-ONLY audit helper. Does not modify any site files.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();
const pages = [];
(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (entry === ".git" || entry === ".vscode" || entry === "node_modules") continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full);
    else if (entry === "index.html") pages.push(full);
  }
})(ROOT);

const toUrlPath = (file) => {
  let r = relative(ROOT, file).split(sep).join("/");
  r = r.replace(/index\.html$/, "");
  return "/" + r;
};

const results = [];
const titles = new Map();
const descs = new Map();
const h1s = new Map();
const issues = [];
const allInternalLinks = [];

for (const file of pages) {
  const html = readFileSync(file, "utf8");
  const urlPath = toUrlPath(file);
  const rel = relative(ROOT, file).split(sep).join("/");

  const titleMatches = [...html.matchAll(/<title[^>]*>([\s\S]*?)<\/title>/gi)];
  const descMatches = [...html.matchAll(/<meta[^>]*name=["']description["'][^>]*>/gi)];
  const canonMatches = [...html.matchAll(/<link[^>]*rel=["']canonical["'][^>]*>/gi)];
  const h1Matches = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
  const h2Matches = [...html.matchAll(/<h2[^>]*>/gi)];
  const ldjson = [...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)];
  const hasGA = /G-LQEH9L9TZ4/.test(html);
  const hasCF = /cloudflareinsights\.com\/beacon/.test(html);
  const hasViewport = /name=["']viewport["']/.test(html);
  const hasLang = /<html[^>]*lang=/i.test(html);
  const hasRobotsMeta = /name=["']robots["']/i.test(html);
  const hasOgImage = /property=["']og:image["']/i.test(html);
  const imgTags = [...html.matchAll(/<img\b[^>]*>/gi)];
  const imgsNoAlt = imgTags.filter((m) => !/\balt=/i.test(m[0]));
  const imgsNoDims = imgTags.filter((m) => !/\bwidth=/i.test(m[0]) || !/\bheight=/i.test(m[0]));
  const scripts = [...html.matchAll(/<script\b[^>]*src=["']([^"']+)["'][^>]*>/gi)];
  const blockingScripts = scripts.filter((m) => !/\b(async|defer|type=["']module["'])/i.test(m[0]));
  const breadcrumbInLd = /BreadcrumbList/.test(html);
  const faqInLd = /FAQPage/.test(html);
  const rawEntities = [...html.matchAll(/&rarr;|&larr;|&nbsp;/gi)];

  const titleText = titleMatches.map((m) => m[1].replace(/\s+/g, " ").trim()).join(" || ");
  const descText = descMatches
    .map((m) => {
      const cm = m[0].match(/content=["']([\s\S]*?)["']/i);
      return cm ? cm[1].replace(/\s+/g, " ").trim() : "";
    })
    .join(" || ");
  const canText = canonMatches
    .map((m) => {
      const hm = m[0].match(/href=["']([^"']+)["']/i);
      return hm ? hm[1] : "";
    })
    .join(" || ");
  const h1Text = h1Matches.map((m) => m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()).join(" || ");

  if (titleMatches.length !== 1) issues.push(`${rel}: <title> count = ${titleMatches.length}`);
  if (descMatches.length !== 1) issues.push(`${rel}: description count = ${descMatches.length}`);
  if (canonMatches.length !== 1) issues.push(`${rel}: canonical count = ${canonMatches.length}`);
  if (h1Matches.length !== 1) issues.push(`${rel}: <h1> count = ${h1Matches.length}`);
  if (!hasViewport) issues.push(`${rel}: missing viewport meta`);
  if (!hasLang) issues.push(`${rel}: missing <html lang>`);
  if (!hasRobotsMeta) issues.push(`${rel}: missing robots meta`);
  if (!hasGA) issues.push(`${rel}: missing GA4 tag`);
  if (!hasCF) issues.push(`${rel}: missing Cloudflare beacon`);
  if (!hasOgImage) issues.push(`${rel}: missing og:image`);
  if (imgsNoAlt.length) issues.push(`${rel}: ${imgsNoAlt.length} <img> without alt`);
  if (blockingScripts.length) issues.push(`${rel}: ${blockingScripts.length} render-blocking script(s)`);
  if (rawEntities.length) issues.push(`${rel}: raw HTML entity: ${[...new Set(rawEntities.map((m) => m[0]))].join(",")}`);
  if (canText && !canText.startsWith("https://dixani.com")) {
    issues.push(`${rel}: canonical not absolute on dixani.com -> ${canText}`);
  }

  titles.set(rel, titleText);
  descs.set(rel, descText);
  h1s.set(rel, h1Text);

  for (const m of html.matchAll(/href=["'](\/[^"'#?]*)["']/g)) allInternalLinks.push(m[1]);

  results.push({
    rel, urlPath, title: titleText, titleLen: titleText.length,
    desc: descText, descLen: descText.length, canonical: canText, h1: h1Text,
    h2Count: h2Matches.length, ldjsonCount: ldjson.length, breadcrumbInLd, faqInLd,
    imgCount: imgTags.length, imgsNoAlt: imgsNoAlt.length, imgsNoDims: imgsNoDims.length,
    scripts: scripts.length, blockingScripts: blockingScripts.length, hasGA, hasCF,
  });
}

const dup = (map, label) => {
  const byVal = new Map();
  for (const [k, v] of map) {
    if (!v) continue;
    if (!byVal.has(v)) byVal.set(v, []);
    byVal.get(v).push(k);
  }
  for (const [v, list] of byVal) {
    if (list.length > 1) console.log(`DUP ${label}: "${v}" in ${list.join(" | ")}`);
  }
};

console.log("========== PAGE INVENTORY ==========");
console.log(`Total pages: ${pages.length}`);
console.log("\n========== ISSUES ==========");
if (issues.length === 0) console.log("None");
issues.forEach((i) => console.log(" - " + i));

console.log("\n========== DUPLICATES ==========");
dup(titles, "TITLE");
dup(descs, "DESCRIPTION");
dup(h1s, "H1");

console.log("\n========== INTERNAL LINK RESOLUTION ==========");
const existing = new Set();
for (const file of pages) existing.add(toUrlPath(file));
const brokenMissing = new Set();
for (const l of allInternalLinks) {
  if (/\.(css|js|png|jpg|jpeg|svg|pdf|xlsx|ico|txt|xml|webp)$/i.test(l)) {
    if (!existsSync(join(ROOT, l.replace(/^\//, "")))) brokenMissing.add("ASSET " + l);
  } else {
    let p = l;
    if (!p.endsWith("/")) p += "/";
    if (!existing.has(p)) brokenMissing.add("PAGE " + l);
  }
}
if (brokenMissing.size === 0) console.log("All internal links resolve.");
else [...brokenMissing].sort().forEach((b) => console.log(" - " + b));

console.log("\n========== TITLE / DESC LENGTH OUTLIERS ==========");
for (const r of results) {
  const tFlag = r.titleLen === 0 ? "NO-TITLE" : r.titleLen > 60 ? "LONG-TITLE" : r.titleLen < 30 ? "SHORT-TITLE" : "";
  const dFlag = r.descLen === 0 ? "NO-DESC" : r.descLen > 160 ? "LONG-DESC" : r.descLen < 70 ? "SHORT-DESC" : "";
  if (tFlag || dFlag) console.log(` - ${r.rel}: title=${r.titleLen} ${tFlag} desc=${r.descLen} ${dFlag}`);
}

console.log("\n========== STRUCTURED DATA COVERAGE ==========");
console.log(`Pages with ld+json: ${results.filter((r) => r.ldjsonCount > 0).length}/${results.length}`);
console.log(`Pages with BreadcrumbList: ${results.filter((r) => r.breadcrumbInLd).length}`);
console.log(`Pages with FAQPage: ${results.filter((r) => r.faqInLd).length}`);

console.log("\n========== IMG WITHOUT DIMENSIONS ==========");
for (const r of results) {
  if (r.imgsNoDims > 0) console.log(` - ${r.rel}: ${r.imgsNoDims}/${r.imgCount}`);
}

console.log("\n========== PER-PAGE SUMMARY ==========");
for (const r of results) {
  console.log(
    `${r.rel}`.padEnd(58) +
      ` ld=${r.ldjsonCount} h2=${r.h2Count} js=${r.scripts} block=${r.blockingScripts} img=${r.imgCount}`
  );
}
