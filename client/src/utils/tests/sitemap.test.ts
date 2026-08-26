import { describe, expect, it } from "vitest";
import {
  escapeXml,
  isoDate,
  renderSitemap,
  STATIC_ROUTES,
  SITE_URL,
} from "../../../scripts/generate-sitemap.mjs";

// A malformed sitemap fails silently: search engines reject it and nobody
// notices, because the build succeeded. These pin the output shape.

describe("sitemap rendering", () => {
  it("produces a well-formed urlset", () => {
    const xml = renderSitemap([
      { path: "/preset/muted-greens", lastmod: "2026-01-02", priority: "0.8" },
    ]);

    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain(
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    );
    expect(xml).toContain(`<loc>${SITE_URL}/preset/muted-greens</loc>`);
    expect(xml).toContain("<lastmod>2026-01-02</lastmod>");
    expect(xml.trimEnd().endsWith("</urlset>")).toBe(true);
  });

  it("omits optional elements rather than emitting empty ones", () => {
    const xml = renderSitemap([{ path: "/" }]);

    expect(xml).not.toContain("<lastmod>");
    expect(xml).not.toContain("<priority>");
    expect(xml).not.toContain("<changefreq>");
  });

  it("escapes the characters that would break the document", () => {
    expect(escapeXml("a&b<c>d'e\"f")).toBe(
      "a&amp;b&lt;c&gt;d&apos;e&quot;f"
    );
  });

  it("escapes a slug containing an ampersand", () => {
    // A slug is user-derived; an unescaped & makes the whole file invalid XML.
    expect(renderSitemap([{ path: "/preset/black&white" }])).toContain(
      "/preset/black&amp;white"
    );
  });

  it("normalises a millisecond timestamp and an ISO string alike", () => {
    expect(isoDate("2026-01-02T03:04:05.000Z")).toBe("2026-01-02");
    expect(isoDate("1767322845000")).toBe(isoDate(1767322845000));
  });

  it("drops an unusable date instead of emitting Invalid Date", () => {
    expect(isoDate(undefined)).toBeUndefined();
    expect(isoDate(null)).toBeUndefined();
    expect(isoDate("not a date")).toBeUndefined();
  });

  it("lists only routes an anonymous visitor can actually see", () => {
    // Anything behind a session is in robots.txt's Disallow list; a sitemap
    // entry for it would ask crawlers to index a redirect.
    const paths = STATIC_ROUTES.map(
      (route: { path: string }) => route.path
    );

    expect(paths).toEqual([
      "/",
      "/browse-lists",
      "/discussions",
      "/terms",
      "/privacy",
    ]);
    for (const gated of [
      "/settings/account",
      "/admin/reports",
      "/upload",
      "/login",
      "/search",
    ]) {
      expect(paths).not.toContain(gated);
    }
  });
});
