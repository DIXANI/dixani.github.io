// Structural validator for guide pages.
//
// Catches the class of defect that tag-count balancing misses: content that
// appears after </html>, duplicated page skeletons, closed <main>/<article>
// with content still following, and guides that drift from the shared
// stylesheet + section contract.
//
// Usage: node tests/check-guide-structure.mjs [file ...]
//        (no args = every guides/<slug>/index.html)

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const REQUIRED_CSS = [
  "/assets/css/templates.css",
  "/assets/css/guides.css",
  "/assets/css/site-consistency.css",
];

// Sections every guide is expected to carry, matching the older guides.
const REQUIRED_CLASSES = [
  "guide-hero",
  "guide-badge",
  "article-shell",
  "article-body",
  "article-aside",
  "toc",
  "formula-box",
  "checklist",
  "check-item",
  "guide-author",
  "faq-list",
  "example-box",
  "action-box",
];

function guidesFromDisk() {
  const dir = join(ROOT, "guides");
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => join(dir, d.name, "index.html"))
    .filter((f) => existsSync(f));
}

function check(file) {
  const html = readFileSync(file, "utf8");
  const rel = file.replace(ROOT + "\\", "").replace(ROOT + "/", "");
  const problems = [];

  // 1. Trailing content after </html>
  const closeHtml = html.lastIndexOf("</html>");
  if (closeHtml === -1) {
    problems.push("missing </html>");
  } else {
    const trailing = html.slice(closeHtml + "</html>".length).trim();
    if (trailing.length > 0) {
      problems.push(
        `${trailing.length} chars of content after </html> (orphaned content)`
      );
    }
  }

  // 2. Page skeleton must appear exactly once
  const counts = {
    "</head>": (html.match(/<\/head>/g) || []).length,
    "<body>": (html.match(/<body>/g) || []).length,
    "</body>": (html.match(/<\/body>/g) || []).length,
    "</html>": (html.match(/<\/html>/g) || []).length,
    '<main id="main">': (html.match(/<main id="main">/g) || []).length,
    '<article class="article-body">': (
      html.match(/<article class="article-body">/g) || []
    ).length,
  };
  for (const [tag, n] of Object.entries(counts)) {
    if (n !== 1) problems.push(`expected exactly one ${tag}, found ${n}`);
  }

  // 3. Ordering: nothing may follow the closing main/article in the document
  const closeMain = html.indexOf("</main>");
  const closeArticle = html.indexOf("</article>");
  const closeBody = html.indexOf("</body>");
  if (closeArticle > -1 && closeMain > -1 && closeArticle > closeMain) {
    problems.push("</article> appears after </main>");
  }
  if (closeMain > -1 && closeBody > -1 && closeMain > closeBody) {
    problems.push("</main> appears after </body>");
  }

  // 4. Stylesheet contract
  const css = [...html.matchAll(/<link[^>]*rel="stylesheet"[^>]*>/g)].map(
    (m) => m[0]
  );
  for (const sheet of REQUIRED_CSS) {
    if (!css.some((l) => l.includes(sheet))) {
      problems.push(`missing required stylesheet ${sheet}`);
    }
  }
  if (css.some((l) => l.includes("/assets/css/style.css"))) {
    problems.push("loads /assets/css/style.css (calculator sheet) instead of the guide sheets");
  }

  // 5. Required class contract
  const missing = REQUIRED_CLASSES.filter(
    (c) => !new RegExp(`class="[^"]*\\b${c}\\b[^"]*"`).test(html)
  );
  if (missing.length) {
    problems.push(`missing standard classes: ${missing.join(", ")}`);
  }

  return { rel, problems };
}

const targets = process.argv.slice(2).length
  ? process.argv.slice(2)
  : guidesFromDisk();

let failures = 0;
for (const file of targets) {
  const { rel, problems } = check(file);
  if (problems.length === 0) {
    console.log(`ok    ${rel}`);
  } else {
    failures++;
    console.log(`FAIL  ${rel}`);
    for (const p of problems) console.log(`        - ${p}`);
  }
}

console.log(
  `\n${targets.length - failures}/${targets.length} guides structurally valid`
);
process.exit(failures ? 1 : 0);
