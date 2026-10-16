// READ-ONLY helper: reports title/description length outliers across all pages.
// Run: node tests/meta-outliers.mjs
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();
const SKIP = new Set([".git", ".vscode", "node_modules", "reports", "tests", "downloads"]);
const pages = [];
(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (SKIP.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (entry === "index.html") pages.push(full);
  }
})(ROOT);

const norm = (s) => s.replace(/\s+/g, " ").trim();
// Attribute-order-independent: find the tag, then read the attribute from it.
const attr = (tag, name) => {
  const m = (tag || "").match(new RegExp(name + "\\s*=\\s*[\"']([^\"']*)[\"']", "i"));
  return m ? m[1] : "";
};
const metaByName = (html, name) =>
  (html.match(/<meta\b[^>]*>/gi) || []).find((t) => attr(t, "name").toLowerCase() === name.toLowerCase()) || "";

const rows = [];
for (const file of pages) {
  const html = readFileSync(file, "utf8");
  const rel = relative(ROOT, file).split(sep).join("/");
  const title = norm((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "");
  const desc = norm(attr(metaByName(html, "description"), "content"));
  rows.push({ rel, title, tl: title.length, desc, dl: desc.length });
}

const long = rows.filter((r) => r.tl > 60);
const short = rows.filter((r) => r.tl < 30);
const longD = rows.filter((r) => r.dl > 160);
const shortD = rows.filter((r) => r.dl < 70);

console.log(`TOTAL PAGES: ${rows.length}\n`);
const show = (label, list, get) => {
  console.log(`===== ${label} (${list.length}) =====`);
  for (const r of list.sort((a, b) => get(b).length - get(a).length)) {
    console.log(`${String(get(r).length).padStart(4)}  ${r.rel}`);
    console.log(`      ${get(r)}`);
  }
  console.log();
};
show("TITLES > 60", long, (r) => r.title);
show("TITLES < 30", short, (r) => r.title);
show("DESCRIPTIONS > 160", longD, (r) => r.desc);
show("DESCRIPTIONS < 70", shortD, (r) => r.desc);
