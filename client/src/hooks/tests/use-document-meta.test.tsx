// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import {
  documentTitleFor,
  useDocumentMeta,
} from "../useDocumentMeta";

const SITE_DESCRIPTION =
  "VISOR – A platform to share Lightroom presets, film simulations, and photographic inspiration.";

function Page(props: {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}) {
  useDocumentMeta(props);
  return null;
}

const meta = (attribute: "name" | "property", key: string) =>
  document.head
    .querySelector(`meta[${attribute}="${key}"]`)
    ?.getAttribute("content");

const canonical = () =>
  document.head
    .querySelector('link[rel="canonical"]')
    ?.getAttribute("href");

describe("useDocumentMeta", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
    document.title = "VISOR";
  });

  afterEach(cleanup);

  it("appends the site name to a page title", () => {
    expect(documentTitleFor("Muted Greens")).toBe("Muted Greens · VISOR");
  });

  it("does not append the site name to itself", () => {
    expect(documentTitleFor("VISOR")).toBe("VISOR");
    expect(documentTitleFor(undefined)).toBe("VISOR");
  });

  it("sets the title, description and OG tags", () => {
    render(
      <Page title="Muted Greens" description="Soft rolling highlights" />
    );

    expect(document.title).toBe("Muted Greens · VISOR");
    expect(meta("name", "description")).toBe("Soft rolling highlights");
    expect(meta("property", "og:title")).toBe("Muted Greens · VISOR");
    expect(meta("property", "og:description")).toBe("Soft rolling highlights");
    expect(meta("name", "twitter:title")).toBe("Muted Greens · VISOR");
  });

  it("uses a large card when there is an image and a small one otherwise", () => {
    const { unmount } = render(<Page title="With photo" image="https://i/1.jpg" />);
    expect(meta("name", "twitter:card")).toBe("summary_large_image");
    expect(meta("property", "og:image")).toBe("https://i/1.jpg");
    unmount();

    render(<Page title="No photo" />);
    expect(meta("name", "twitter:card")).toBe("summary");
    expect(meta("property", "og:image")).toBeUndefined();
  });

  it("falls back to the site description when a page has none", () => {
    render(<Page title="Untitled recipe" />);
    expect(meta("name", "description")).toBe(SITE_DESCRIPTION);
  });

  it("writes a canonical URL without the query string", () => {
    window.history.replaceState({}, "", "/preset/muted-greens?from=search");

    render(<Page title="Muted Greens" />);

    expect(canonical()).toBe(
      `${window.location.origin}/preset/muted-greens`
    );
  });

  it("prefers an explicit canonical URL", () => {
    render(<Page title="Muted Greens" url="https://visor.test/preset/x" />);
    expect(canonical()).toBe("https://visor.test/preset/x");
    expect(meta("property", "og:url")).toBe("https://visor.test/preset/x");
  });

  it("leaves the document alone while the query is still loading", () => {
    // Called with nothing on the first render, before the query resolves.
    // Writing the bare site name here would flash the tab title and, worse,
    // blank the static OG defaults that a JS-executing crawler might read.
    document.title = "Previous page · VISOR";

    render(<Page />);

    expect(document.title).toBe("Previous page · VISOR");
    expect(document.head.querySelector("meta")).toBeNull();
  });

  it("restores the defaults when the route unmounts", () => {
    const { unmount } = render(
      <Page title="Muted Greens" description="Soft" image="https://i/1.jpg" />
    );

    unmount();

    expect(document.title).toBe("VISOR");
    expect(meta("name", "description")).toBe(SITE_DESCRIPTION);
    expect(meta("property", "og:image")).toBeUndefined();
    expect(canonical()).toBeUndefined();
  });

  it("leaves an index.html default in place rather than deleting it", () => {
    // The static tags are what non-JS scrapers see. Clearing a page's image
    // must fall back to the site card, not to no image at all.
    document.head.innerHTML =
      '<meta property="og:image" content="/og-default.png">';

    const { unmount } = render(<Page title="No photo" />);
    unmount();

    expect(meta("property", "og:image")).toBe("/og-default.png");
  });
});
