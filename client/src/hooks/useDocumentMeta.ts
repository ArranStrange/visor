import { useEffect } from "react";
import { ENV_CONFIG } from "@/config/environment";

/**
 * Sets the document title and the description / Open Graph / Twitter meta tags
 * for the current route.
 *
 * Zero-dependency by decision (ratified Q4): react-helmet-async would add a
 * provider, a dependency and a render-phase side-effect model for what is four
 * DOM writes in an effect. The whole hook is below.
 *
 * IMPORTANT, and recorded honestly rather than glossed over: these tags are
 * written by JavaScript after the app boots. Social scrapers that do not run
 * JS — Facebook, Twitter/X, Slack, iMessage, LinkedIn — fetch index.html and
 * see only the static defaults there, so a shared preset link still previews
 * as the generic site card. Making real per-recipe share previews work needs
 * prerendered or server-rendered HTML, which is deferred; this hook is worth
 * having in the meantime for browser tabs, bookmarks, history, and the
 * crawlers that do execute JS (Googlebot).
 */

const SITE_NAME = ENV_CONFIG.APP_NAME;

/** Restored when a route with per-page metadata unmounts. */
const DEFAULTS = {
  title: SITE_NAME,
  description:
    "VISOR – A platform to share Lightroom presets, film simulations, and photographic inspiration.",
};

interface DocumentMetaOptions {
  /** Page title. The site name is appended unless the title already is it. */
  title?: string;
  description?: string;
  /** Absolute URL of the share image. Pass a Cloudinary URL through socialImageUrl first. */
  image?: string;
  /** Absolute canonical URL. Defaults to the current location. */
  url?: string;
}

const setMeta = (
  selectorAttribute: "name" | "property",
  key: string,
  content: string | undefined
) => {
  const selector = `meta[${selectorAttribute}="${key}"]`;
  const existing = document.head.querySelector<HTMLMetaElement>(selector);

  if (!content) {
    // Only remove tags this hook created. A default declared in index.html is
    // left in place, so clearing a page's image falls back to the site card
    // rather than to no image at all.
    if (existing?.dataset.visorMeta === "true") existing.remove();
    return;
  }

  if (existing) {
    existing.setAttribute("content", content);
    return;
  }

  const element = document.createElement("meta");
  element.setAttribute(selectorAttribute, key);
  element.setAttribute("content", content);
  element.dataset.visorMeta = "true";
  document.head.appendChild(element);
};

const setCanonical = (url: string | undefined) => {
  const existing = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]'
  );

  if (!url) {
    if (existing?.dataset.visorMeta === "true") existing.remove();
    return;
  }

  if (existing) {
    existing.href = url;
    return;
  }

  const link = document.createElement("link");
  link.rel = "canonical";
  link.href = url;
  link.dataset.visorMeta = "true";
  document.head.appendChild(link);
};

export const documentTitleFor = (title: string | undefined) => {
  if (!title) return DEFAULTS.title;
  return title === SITE_NAME ? SITE_NAME : `${title} · ${SITE_NAME}`;
};

export function useDocumentMeta({
  title,
  description,
  image,
  url,
}: DocumentMetaOptions) {
  useEffect(() => {
    // Nothing to say yet (the query is still loading): leave whatever is there
    // rather than flashing the page title to the bare site name and back.
    if (!title && !description && !image) return;

    const fullTitle = documentTitleFor(title);
    const canonical =
      url ??
      (typeof window !== "undefined"
        ? `${window.location.origin}${window.location.pathname}`
        : undefined);

    document.title = fullTitle;
    setMeta("name", "description", description ?? DEFAULTS.description);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description ?? DEFAULTS.description);
    setMeta("property", "og:type", "article");
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("property", "og:url", canonical);
    setMeta("property", "og:image", image);
    setMeta(
      "name",
      "twitter:card",
      image ? "summary_large_image" : "summary"
    );
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description ?? DEFAULTS.description);
    setMeta("name", "twitter:image", image);
    setCanonical(canonical);

    return () => {
      document.title = DEFAULTS.title;
      setMeta("name", "description", DEFAULTS.description);
      setMeta("property", "og:image", undefined);
      setMeta("name", "twitter:image", undefined);
      setCanonical(undefined);
    };
  }, [title, description, image, url]);
}
