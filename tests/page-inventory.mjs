// Enumerates every index.html page: route, title, meta description and h1.
// Used by tests/meta-outliers.mjs and other analysis scripts.
// Run: node tests/page-inventory.mjs
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();
const SKIP = new Set([".git", ".vscode", "node_modules", "reports", "tests", "downloads", "assets"]);

const dec = (s) =>
  String(s || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const attr = (tag, name) => {
  const m = tag.match(new RegExp(name + "\\s*=\\s*[\"']([^\"']*)[\"']", "i"));
  return m ? m[1] : "";
};

const out = [];
(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (SKIP.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (entry === "index.html") {
      const h = readFileSync(full, "utf8");
      const title = dec((h.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "");
      const descTag = (h.match(/<meta\b[^>]*>/gi) || []).find((t) => attr(t, "name").toLowerCase() === "description") || "";
      const desc = dec(attr(descTag, "content"));
      const h1 = dec(((h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || "").replace(/<[^>]+>/g, ""));
      out.push([relative(ROOT, full).split(sep).join("/"), title, h1, desc]);
    }
  }
})(ROOT);

out.sort((a, b) => a[0].localeCompare(b[0]));
writeFileSync(join(ROOT, "tests", "_page-inventory.json"), JSON.stringify(out, null, 1), "utf8");
console.log(`Wrote ${out.length} pages to tests/_page-inventory.json`);
