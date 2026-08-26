/**
 * Build-time sitemap generator.
 *
 * FAIL-SOFT BY DESIGN. This runs inside the client build, and the GraphQL API
 * it queries lives on a separate host that sleeps when idle and restarts on
 * deploy. A sitemap is a nice-to-have; a client build that cannot ship because
 * the backend was mid-restart is an outage. So every failure path here ends in
 * a warning and exit code 0:
 *
 *   - API unreachable, slow or erroring  -> keep the sitemap already in
 *                                           public/, or write a static-routes-
 *                                           only one if there is none
 *   - malformed response                 -> same
 *
 * The only thing that would make this exit non-zero is a bug in this file, and
 * the top-level catch covers that too.
 *
 * Usage: node scripts/generate-sitemap.mjs
 * Environment:
 *   VITE_SITE_URL     public origin, default https://visor-c51a1.web.app
 *   VITE_GRAPHQL_URI  API endpoint, default https://visor-backend.onrender.com/graphql
 *   SITEMAP_TIMEOUT_MS  per-request timeout, default 15000
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(HERE, "..", "public");
const OUTPUT = join(PUBLIC_DIR, "sitemap.xml");

const SITE_URL = (
  process.env.VITE_SITE_URL ?? "https://visor-c51a1.web.app"
).replace(/\/$/, "");
const GRAPHQL_URI =
  process.env.VITE_GRAPHQL_URI ??
  "https://visor-backend.onrender.com/graphql";
const TIMEOUT_MS = Number(process.env.SITEMAP_TIMEOUT_MS ?? 15000);

// Only pages that render something for an anonymous visitor. Everything behind
// a session is in robots.txt's Disallow list and must not appear here.
const STATIC_ROUTES = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/browse-lists", priority: "0.6", changefreq: "daily" },
  { path: "/discussions", priority: "0.6", changefreq: "daily" },
  { path: "/terms", priority: "0.2", changefreq: "yearly" },
  { path: "/privacy", priority: "0.2", changefreq: "yearly" },
];

const PAGE_SIZE = 100;
const MAX_PAGES = 50; // 5,000 entries: well inside the 50,000 sitemap limit.

const QUERY = `
  query SitemapEntries($page: Int!, $limit: Int!) {
    listPresets(page: $page, limit: $limit, sort: NEWEST) {
      hasNextPage
      presets { slug updatedAt }
    }
    listFilmSims(page: $page, limit: $limit, sort: NEWEST) {
      hasNextPage
      filmSims { slug updatedAt }
    }
  }
`;

const warn = (message, detail) => {
  console.warn(`[sitemap] ${message}`);
  if (detail) console.warn(`[sitemap]   ${detail}`);
};

const escapeXml = (value) =>
  String(value).replace(/[<>&'"]/g, (character) => {
    switch (character) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      default:
        return "&quot;";
    }
  });

/** ISO date, or undefined when the value is missing or unparseable. */
const isoDate = (value) => {
  if (!value) return undefined;
  const timestamp = Number.isNaN(Number(value)) ? value : Number(value);
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime())
    ? undefined
    : date.toISOString().slice(0, 10);
};

const urlEntry = ({ path, lastmod, changefreq, priority }) =>
  [
    "  <url>",
    `    <loc>${escapeXml(`${SITE_URL}${path}`)}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : null,
    priority ? `    <priority>${priority}</priority>` : null,
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");

const renderSitemap = (entries) =>
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(urlEntry),
    "</urlset>",
    "",
  ].join("\n");

const fetchPage = async (page) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(GRAPHQL_URI, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        query: QUERY,
        variables: { page, limit: PAGE_SIZE },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const body = await response.json();
    if (body.errors?.length) {
      throw new Error(body.errors.map((error) => error.message).join("; "));
    }
    if (!body.data?.listPresets || !body.data?.listFilmSims) {
      throw new Error("response did not contain both lists");
    }

    return body.data;
  } finally {
    clearTimeout(timer);
  }
};

const collectContentEntries = async () => {
  const entries = [];
  let page = 1;

  for (; page <= MAX_PAGES; page += 1) {
    const data = await fetchPage(page);

    for (const preset of data.listPresets.presets ?? []) {
      if (!preset?.slug) continue;
      entries.push({
        path: `/preset/${encodeURIComponent(preset.slug)}`,
        lastmod: isoDate(preset.updatedAt),
        changefreq: "weekly",
        priority: "0.8",
      });
    }

    for (const filmSim of data.listFilmSims.filmSims ?? []) {
      if (!filmSim?.slug) continue;
      entries.push({
        path: `/filmsim/${encodeURIComponent(filmSim.slug)}`,
        lastmod: isoDate(filmSim.updatedAt),
        changefreq: "weekly",
        priority: "0.8",
      });
    }

    if (!data.listPresets.hasNextPage && !data.listFilmSims.hasNextPage) {
      return entries;
    }
  }

  warn(
    `stopped at ${MAX_PAGES} pages; the sitemap may be incomplete. Raise MAX_PAGES or split into a sitemap index.`
  );
  return entries;
};

/** What to leave behind when the API cannot be reached. */
const keepPreviousOrStaticOnly = () => {
  if (existsSync(OUTPUT)) {
    const previous = readFileSync(OUTPUT, "utf8");
    warn(
      `keeping the existing sitemap (${previous.split("<url>").length - 1} URLs). It is stale, not wrong.`
    );
    return;
  }

  mkdirSync(PUBLIC_DIR, { recursive: true });
  writeFileSync(OUTPUT, renderSitemap(STATIC_ROUTES));
  warn(
    `no previous sitemap to keep; wrote a static-routes-only one (${STATIC_ROUTES.length} URLs).`
  );
};

const run = async () => {
  let contentEntries;

  try {
    contentEntries = await collectContentEntries();
  } catch (error) {
    warn(
      "could not reach the GraphQL API, so the sitemap was not regenerated.",
      error instanceof Error ? error.message : String(error)
    );
    warn(`endpoint: ${GRAPHQL_URI}`);
    keepPreviousOrStaticOnly();
    return;
  }

  const entries = [...STATIC_ROUTES, ...contentEntries];
  mkdirSync(PUBLIC_DIR, { recursive: true });
  writeFileSync(OUTPUT, renderSitemap(entries));

  console.log(
    `[sitemap] wrote ${entries.length} URLs to public/sitemap.xml (${contentEntries.length} from the API).`
  );
};

// Only run when invoked as a script, so the helpers below can be unit-tested
// without the test suite hitting the network.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  run().catch((error) => {
    // A bug in this file must not fail the client build either.
    warn(
      "the generator itself threw; leaving the sitemap as it was.",
      error instanceof Error ? error.stack : String(error)
    );
    try {
      keepPreviousOrStaticOnly();
    } catch {
      warn("could not even write a fallback sitemap; continuing regardless.");
    }
  });
}

export { escapeXml, isoDate, renderSitemap, STATIC_ROUTES, SITE_URL };
