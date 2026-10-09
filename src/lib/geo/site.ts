export const SITE_URL = "https://vidiopintar.com";

export const SITE_NAME = "Vidiopintar";

export const OG_IMAGE = `${SITE_URL}/images/vidiopintar-og.jpeg`;

/** Shared freshness signal for static marketing pages */
export const SITE_LAST_MODIFIED = new Date("2026-07-08T00:00:00.000Z");

export function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;

  if (path === "/") return SITE_URL;

  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function markdownUrlFor(path: string): string {
  if (path === "/" || path === "") return `${SITE_URL}/index.html.md`;

  return `${absoluteUrl(path)}.md`;
}

