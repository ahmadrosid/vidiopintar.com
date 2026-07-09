export const SITE_URL = "https://vidiopintar.com";
export const SITE_NAME = "Vidiopintar";
export const OG_IMAGE = `${SITE_URL}/images/vidiopintar-og.jpeg`;

/** Shared freshness signal for static marketing pages */
export const SITE_LAST_MODIFIED = new Date("2026-07-08T00:00:00.000Z");

export const PUBLIC_MARKDOWN_PATHS = [
  "/",
  "/faq",
  "/blog",
  "/changelogs",
  "/privacy",
  "/terms",
] as const;

export function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  if (path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function markdownUrlFor(path: string): string {
  if (path === "/" || path === "") return `${SITE_URL}/index.html.md`;
  return `${absoluteUrl(path)}.md`;
}

export function truncateDescription(text: string, max = 155): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  const sliced = normalized.slice(0, max - 1);
  const lastSpace = sliced.lastIndexOf(" ");
  return `${(lastSpace > 80 ? sliced.slice(0, lastSpace) : sliced).trimEnd()}…`;
}
