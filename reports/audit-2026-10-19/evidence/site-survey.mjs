import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..", "..");

function walk(directory, files = []) {
  for (const name of readdirSync(directory)) {
    if (name === ".git" || name === "reports") continue;
    const path = join(directory, name);
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path, files);
    else files.push(path);
  }
  return files;
}

function textBetween(html, pattern) {
  return html.match(pattern)?.[1]?.replace(/\s+/g, " ").trim() ?? "";
}

function attr(html, name) {
  return html.match(new RegExp(`${name}="([^"]*)"`, "i"))?.[1] ?? "";
}

function decode(value) {
  return value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

function metaContent(html, name) {
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    if (attr(match[0], "name").toLowerCase() === name || attr(match[0], "property").toLowerCase() === name) {
      return attr(match[0], "content");
    }
  }
  return "";
}

const pages = walk(root)
  .filter((path) => path.endsWith(`${sep}index.html`))
  .sort();

const routeOf = (path) => {
  const rel = relative(root, path).split(sep).join("/");
  return rel === "index.html" ? "/" : `/${rel.replace(/index\.html$/, "")}`;
};

const routes = new Set(pages.map(routeOf));
const records = pages.map((path) => {
  const html = readFileSync(path, "utf8");
  const title = decode(textBetween(html, /<title[^>]*>([\s\S]*?)<\/title>/i));
  const metaDescription = decode(metaContent(html, "description"));
  const canonical = [...html.matchAll(/<link\b[^>]*>/gi)]
    .map((match) => match[0])
    .find((tag) => /\brel="canonical"/i.test(tag))
    ?.match(/\bhref="([^"]*)"/i)?.[1] ?? "";
  const robots = metaContent(html, "robots");
  const lang = html.match(/<html[^>]*\blang="([^"]*)"/i)?.[1] ?? "";
  const h1s = [...html.matchAll(/<h1\b[^>]*>/gi)].length;
  const h2s = [...html.matchAll(/<h2\b[^>]*>/gi)].length;
  const h3s = [...html.matchAll(/<h3\b[^>]*>/gi)].length;
  const images = [...html.matchAll(/<img\b([^>]*)>/gi)].map((m) => m[1]);
  const missingAlt = images.filter((attrs) => !/\balt=/.test(attrs)).length;
  const links = [...html.matchAll(/<a\b[^>]*href="([^"]+)"/gi)].map((m) => m[1]);
  const internal = links.filter((href) => href.startsWith("/") && !href.startsWith("//"));
  const broken = internal.filter((href) => {
    const pathPart = href.split(/[?#]/)[0];
    if (pathPart === "/") return false;
    const normalized = pathPart.endsWith("/") ? pathPart : `${pathPart}/`;
    return !routes.has(normalized) && !pathPart.match(/\.(pdf|xlsx|csv|png|txt|xml|js|css)$/);
  });
  const scripts = [...html.matchAll(/<script\b([^>]*)>/gi)].map((m) => m[1]);
  const localScripts = scripts.filter((attrs) => /src="(?:\/|\.)/.test(attrs) && !/src="https?:/.test(attrs)).length;
  const blockingScripts = scripts.filter((attrs) => /src="(?:\/|\.)/.test(attrs) && !/\b(?:async|defer|type="module")/.test(attrs)).length;
  const externalScripts = scripts.filter((attrs) => /src="https?:/.test(attrs)).length;
  const jsonLd = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
  let invalidJsonLd = 0;
  for (const match of jsonLd) {
    try { JSON.parse(match[1]); } catch { invalidJsonLd++; }
  }
  const forms = [...html.matchAll(/<form\b[^>]*>/gi)].length;
  const inputs = [...html.matchAll(/<(input|select|textarea)\b([^>]*)>/gi)].map((m) => m[2]);
  const labelledIds = new Set([...html.matchAll(/<label\b[^>]*\bfor="([^"]+)"/gi)].map((m) => m[1]));
  const unlabeledInputs = inputs.filter((attrs) => {
    const id = attrs.match(/\bid="([^"]+)"/i)?.[1] ?? "";
    return !id || (!labelledIds.has(id) && !/\baria-label=/.test(attrs));
  }).length;
  return {
    route: routeOf(path), file: relative(root, path).split(sep).join("/"), title, titleLength: title.length,
    metaDescription, descriptionLength: metaDescription.length, canonical, robots, lang,
    h1s, h2s, h3s, images: images.length, missingAlt, internalLinks: internal.length, brokenInternalLinks: [...new Set(broken)],
    localScripts, blockingScripts, externalScripts, jsonLdBlocks: jsonLd.length, invalidJsonLd,
    forms, unlabeledInputs,
  };
});

const sitemap = readFileSync(join(root, "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const sitemapRoutes = new Set(sitemapUrls.map((url) => new URL(url).pathname));
const group = (items, key) => {
  const map = new Map();
  for (const item of items) {
    if (!map.has(item[key])) map.set(item[key], []);
    map.get(item[key]).push(item);
  }
  return [...map.entries()].filter(([, values]) => values.length > 1);
};
const duplicateTitles = group(records, "title");
const duplicateDescriptions = group(records, "metaDescription");
const report = {
  inspectedAt: new Date().toISOString(),
  pages: records.length,
  sitemapUrls: sitemapUrls.length,
  missingFromSitemap: [...routes].filter((route) => !sitemapRoutes.has(route)).sort(),
  sitemapMissingOnDisk: [...sitemapRoutes].filter((route) => !routes.has(route)).sort(),
  records,
  duplicateTitles: duplicateTitles.map(([title, items]) => ({ title, routes: items.map((item) => item.route) })),
  duplicateDescriptions: duplicateDescriptions.map(([description, items]) => ({ description, routes: items.map((item) => item.route) })),
};

writeFileSync(join(here, "site-survey.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify({
  pages: report.pages, sitemapUrls: report.sitemapUrls, missingFromSitemap: report.missingFromSitemap,
  sitemapMissingOnDisk: report.sitemapMissingOnDisk, duplicateTitles: report.duplicateTitles.length,
  duplicateDescriptions: report.duplicateDescriptions.length,
  pagesWithMissingAlt: records.filter((item) => item.missingAlt).map((item) => item.route),
  pagesWithoutLang: records.filter((item) => !item.lang).map((item) => item.route),
  pagesWithBrokenInternalLinks: records.filter((item) => item.brokenInternalLinks.length).map((item) => ({ route: item.route, links: item.brokenInternalLinks })),
  invalidJsonLdPages: records.filter((item) => item.invalidJsonLd).map((item) => item.route),
  pagesWithMultipleH1: records.filter((item) => item.h1s !== 1).map((item) => ({ route: item.route, h1s: item.h1s })),
  totalBlockingScripts: records.reduce((sum, item) => sum + item.blockingScripts, 0),
}, null, 2));
