// Generates page-specific JSON-LD (BreadcrumbList + WebApplication) from the
// site's own HTML, injected into a marked region so the generator stays
// deterministic and idempotent.
//
// Design rules (P2-A):
//   * Only markup that is visible and verifiable on the page is emitted.
//   * Never fabricate ratings, reviews, authors, dates or capabilities.
//   * Never duplicate schema a page already declares.
//   * FAQPage is deliberately NOT generated here (that is a P2-B decision).
//
// The generated block lives between two HTML comments so re-running the build
// replaces it rather than appending a second copy:
//
//   <!-- schema:generated -->
//   <script type="application/ld+json"> ... </script>
//   <!-- /schema:generated -->
//
// Run:    node tests/build-schema.mjs
// Check:  node tests/build-schema.mjs --check   (fails if any page is stale)
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();
const WRITE = !process.argv.includes("--check");
const ORIGIN = "https://dixani.com";

// Tooling and non-content directories, matching build-search-index.mjs.
const SKIP = new Set([".git", ".vscode", "node_modules", "reports", "tests", "downloads", "assets"]);

// Search-engine verification tokens are not content pages.
const isContentPage = (name) => !/^google[0-9a-f]+\.html$/i.test(name);

const START = "<!-- schema:generated -->";
const END = "<!-- /schema:generated -->";

// ---------------------------------------------------------------------------
// 1. Discover pages.
// ---------------------------------------------------------------------------
const files = [];
(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (SKIP.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (entry === "index.html" && isContentPage(entry)) files.push(full);
  }
})(ROOT);

const decode = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&mdash;/g, "\u2014")
    .replace(/&ndash;/g, "\u2013")
    .replace(/&rarr;/g, "\u2192")
    .replace(/\s+/g, " ")
    .trim();

const stripTags = (s) => decode(s.replace(/<[^>]+>/g, ""));

// Attribute-order-independent: read the whole tag, then pull the attribute.
const attrOf = (tag, name) => {
  if (!tag) return "";
  const m = tag.match(new RegExp(name + "\\s*=\\s*[\"']([^\"']*)[\"']", "i"));
  return m ? m[1] : "";
};

const routeOf = (file) =>
  "/" + relative(ROOT, file).split(sep).join("/").replace(/index\.html$/, "");

// ---------------------------------------------------------------------------
// 2. Hierarchy model.
//
// Breadcrumbs must reflect a hierarchy the URL structure genuinely has, and
// every intermediate step must be a page that really exists as a crawlable
// hub -- otherwise the breadcrumb advertises a 404.
// ---------------------------------------------------------------------------
const HUB_NAME = {
  "/categories/": "Categories",
  "/categories/business/": "Business Calculators",
  "/categories/converters/": "Converters",
  "/categories/finance/": "Finance Calculators",
  "/categories/inventory/": "Inventory Calculators",
  "/categories/logistics/": "Logistics Calculators",
  "/guides/": "Guides",
  "/templates/": "Templates",
  "/templates/inventory/": "Inventory Templates",
  "/templates/purchasing/": "Purchasing Templates",
  "/templates/warehouse/": "Warehouse Templates",
};

// Pages skipped entirely -- the homepage already declares Organization +
// WebSite, and these four have no meaningful breadcrumb hierarchy.
const SKIP_PAGES = new Set([
  "/",
  "/privacy/",
  "/terms/",
  "/contact/",
  "/about/",
  "/ai-operations-assistant/",
]);

// ---------------------------------------------------------------------------
// 3. Genuine interactive tools only. Every entry is a page whose primary
//    content is a working client-side calculator or generator -- verified by
//    reading the page, not inferred from its folder name.
// ---------------------------------------------------------------------------
const TOOLS = {
  "/logistics/pallet-calculator/": "BusinessApplication",
  "/logistics/container-loading-calculator/": "BusinessApplication",
  "/logistics/cbm-calculator/": "BusinessApplication",
  "/logistics/warehouse-space-calculator/": "BusinessApplication",
  "/inventory/eoq-calculator/": "BusinessApplication",
  "/inventory/reorder-point/": "BusinessApplication",
  "/inventory/safety-stock/": "BusinessApplication",
  "/inventory/dio-calculator/": "BusinessApplication",
  "/inventory/inventory-turnover/": "BusinessApplication",
  "/inventory/cycle-count-planner/": "BusinessApplication",
  "/inventory/inventory-accuracy-analyzer/": "BusinessApplication",
  "/inventory/variance-report/": "BusinessApplication",
  "/inventory-control-toolkit/": "BusinessApplication",
  "/categories/business/markup-calculator/": "BusinessApplication",
  "/categories/business/profit-margin-calculator/": "BusinessApplication",
  "/categories/business/working-hours-calculator/": "BusinessApplication",
  "/categories/finance/break-even-calculator/": "BusinessApplication",
  "/categories/finance/compound-interest-calculator/": "BusinessApplication",
  "/categories/finance/discount-calculator/": "BusinessApplication",
  "/categories/finance/loan-payment-calculator/": "BusinessApplication",
  "/categories/finance/simple-interest-calculator/": "BusinessApplication",
  "/categories/finance/vat-calculator/": "BusinessApplication",
  "/categories/converters/unit-converter/": "UtilitiesApplication",
  "/categories/converters/volumetric-weight-calculator/": "UtilitiesApplication",
};

// ---------------------------------------------------------------------------
// 4. Breadcrumb trail construction.
//
// The trail mirrors the page's real folder path, using only hubs that exist.
// The final crumb is the page itself, named from its own visible <h1>.
// ---------------------------------------------------------------------------
const buildTrail = (route, name) => {
  const parts = route.split("/").filter(Boolean);
  const trail = [{ name: "Home", item: ORIGIN + "/" }];

  if (parts[0] === "categories" && parts.length >= 2) {
    trail.push({ name: HUB_NAME["/categories/"], item: ORIGIN + "/categories/" });
    const hub = `/categories/${parts[1]}/`;
    // Only add the category hub when the page sits *below* it.
    if (parts.length > 2 && HUB_NAME[hub]) trail.push({ name: HUB_NAME[hub], item: ORIGIN + hub });
  } else if (parts[0] === "guides" && parts.length >= 2) {
    trail.push({ name: HUB_NAME["/guides/"], item: ORIGIN + "/guides/" });
  } else if (parts[0] === "inventory" && parts.length >= 2) {
    trail.push({ name: HUB_NAME["/categories/inventory/"], item: ORIGIN + "/categories/inventory/" });
  } else if (parts[0] === "logistics" && parts.length >= 2) {
    trail.push({ name: HUB_NAME["/categories/logistics/"], item: ORIGIN + "/categories/logistics/" });
  } else if (parts[0] === "templates" && parts.length >= 2) {
    trail.push({ name: HUB_NAME["/templates/"], item: ORIGIN + "/templates/" });
    const hub = `/templates/${parts[1]}/`;
    if (parts.length > 2 && HUB_NAME[hub]) trail.push({ name: HUB_NAME[hub], item: ORIGIN + hub });
  }

  trail.push({ name, item: ORIGIN + route });
  return trail;
};

// ---------------------------------------------------------------------------
// 5. Deterministic serialisation. Objects are built literally so key order is
//    fixed and the output is byte-stable across runs and platforms.
// ---------------------------------------------------------------------------
const json = (value) => JSON.stringify(value, null, 2);

const breadcrumbBlock = (route, name) => {
  const trail = buildTrail(route, name);
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: step.name,
      item: step.item,
    })),
  };
};

// Only properties that are true and verifiable for a free browser tool.
// Deliberately omitted: aggregateRating, review, author, datePublished,
// dateModified, softwareVersion, offers.availability, priceValidUntil.
const toolBlock = (route, name, description, category) => {
  const block = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    url: ORIGIN + route,
    applicationCategory: category,
    operatingSystem: "Any",
    isAccessibleForFree: true,
  };
  if (description) block.description = description;
  block.offers = { "@type": "Offer", price: "0", priceCurrency: "USD" };
  return block;
};

// ---------------------------------------------------------------------------
// 6. Read every page and decide what it needs.
// ---------------------------------------------------------------------------
const records = [];

for (const file of files) {
  const html = readFileSync(file, "utf8");
  const route = routeOf(file);

  const h1 = stripTags((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || "");
  const descTag = (html.match(/<meta[^>]*name=["']description["'][^>]*>/i) || [])[0] || "";
  const description = decode(attrOf(descTag, "content"));

  // Attribute order varies across the site (<link href rel> vs <link rel href>).
  const canonicalTag =
    (html.match(/<link[^>]*rel=["']canonical["'][^>]*>/i) || [])[0] ||
    (html.match(/<link[^>]*href=["'][^"']+["'][^>]*rel=["']canonical["'][^>]*>/i) || [])[0] ||
    "";

  // Types already declared in the page's own hand-written JSON-LD.
  const existingTypes = new Set();
  for (const m of html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    for (const t of m[1].matchAll(/"@type"\s*:\s*"([^"]+)"/g)) existingTypes.add(t[1]);
  }

  const skip = SKIP_PAGES.has(route);
  const name = h1 || route;
  const blocks = [];

  // BreadcrumbList -- when the page does not already declare one.
  if (!skip && !existingTypes.has("BreadcrumbList")) {
    blocks.push(breadcrumbBlock(route, name));
  }

  // WebApplication -- genuine tools that do not already declare one.
  if (
    !skip &&
    TOOLS[route] &&
    !existingTypes.has("WebApplication") &&
    !existingTypes.has("SoftwareApplication")
  ) {
    blocks.push(toolBlock(route, name, description, TOOLS[route]));
  }

  const rendered = blocks.length
    ? `${START}\n${blocks
        .map((b) => `<script type="application/ld+json">\n${json(b)}\n</script>`)
        .join("\n")}\n${END}`
    : "";

  records.push({
    file,
    route,
    html,
    canonicalTag,
    name,
    existingTypes,
    blocks,
    rendered,
    skip,
  });
}

// ---------------------------------------------------------------------------
// 7. Write (or verify) the marked region. Idempotent: an existing region is
//    replaced in place, so repeated runs converge on the same bytes.
// ---------------------------------------------------------------------------
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const REGION = new RegExp(esc(START) + "[\\s\\S]*?" + esc(END));

let written = 0;
let unchanged = 0;
const touched = [];
const stale = [];
const problems = [];

for (const rec of records) {
  if (!rec.rendered) continue;

  const original = readFileSync(rec.file, "utf8");
  let updated;

  if (REGION.test(original)) {
    updated = original.replace(REGION, rec.rendered);
  } else {
    // First run: insert immediately before </head>. Nothing else is touched.
    const idx = original.search(/<\/head>/i);
    if (idx === -1) {
      problems.push(`no </head> found in ${rec.route}`);
      continue;
    }
    updated = original.slice(0, idx) + rec.rendered + "\n" + original.slice(idx);
  }

  if (updated === original) {
    unchanged++;
    continue;
  }

  if (WRITE) {
    writeFileSync(rec.file, updated, "utf8");
    written++;
    touched.push(rec);
  } else {
    stale.push(rec.route);
  }
}

// ---------------------------------------------------------------------------
// 8. Report.
// ---------------------------------------------------------------------------
const breadcrumbCount = records.filter((r) => r.blocks.some((b) => b["@type"] === "BreadcrumbList")).length;
const toolCount = records.filter((r) => r.blocks.some((b) => b["@type"] === "WebApplication")).length;

console.log(`Pages scanned          : ${records.length}`);
console.log(`BreadcrumbList emitted : ${breadcrumbCount}`);
console.log(`WebApplication emitted : ${toolCount}`);
console.log(`Pages receiving markup : ${records.filter((r) => r.rendered).length}`);

if (problems.length) {
  console.error(`\nERROR (${problems.length}):\n${problems.map((p) => "  " + p).join("\n")}`);
  process.exitCode = 1;
}

if (WRITE) {
  console.log(`Pages modified         : ${written}`);
  console.log(`Pages already current  : ${unchanged}`);
  if (touched.length) {
    console.log(`\nupdated:\n${touched.map((t) => `  ${t.route} (${t.blocks.length} block(s))`).join("\n")}`);
  }
} else if (stale.length) {
  console.error(`\nFAIL: ${stale.length} page(s) have stale generated schema.`);
  console.error(`Run: node tests/build-schema.mjs\n${stale.map((s) => "  " + s).join("\n")}`);
  process.exitCode = 1;
} else {
  console.log("\nOK: all generated schema is current.");
}
