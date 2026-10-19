// scripts/add-skip-links.mjs — AUD-019: insert a shared skip link before each page header.
// Idempotent: skips pages that already contain a skip-link.
import { readFileSync, writeFileSync } from "node:fs";
import { readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SKIP = (id) =>
  `<a class="skip-link" href="#${id}">Skip to main content</a>`;

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === ".git" || entry === "node_modules" || entry === "reports") continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (entry === "index.html") out.push(full);
  }
  return out;
}

let changed = 0;
for (const file of walk(root)) {
  let html = readFileSync(file, "utf8");
  if (html.includes('class="skip-link"')) continue;

  // Ensure <main> has an id we can target.
  let id = "main";
  if (!/<main[^>]*\bid="/.test(html)) {
    html = html.replace(/<main(\s|>)/, `<main id="${id}"$1`);
  } else {
    id = html.match(/<main[^>]*\bid="([^"]+)"/)[1];
  }

  const headerRe = /(\s*)(<header class="site-header">)/;
  if (!headerRe.test(html)) continue;
  html = html.replace(headerRe, `$1${SKIP(id)}$1$2`);

  writeFileSync(file, html);
  changed++;
}
console.log(`skip-link injected into ${changed} page(s)`);
