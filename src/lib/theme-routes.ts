const FORCED_DARK_EXACT = new Set(["/"]);

const FORCED_DARK_PREFIXES = [
  "/faq",
  "/privacy",
  "/terms",
  "/changelogs",
  "/blog",
  "/admin",
  "/payment",
  "/shared",
  "/sign-in",
  "/sign-up",
] as const;

/**
 * Routes that always render dark regardless of user preference.
 * Exact `/` only — never prefix-match, or `/home` would be forced dark.
 */
export function isForcedDarkPath(pathname: string | null): boolean {
  if (!pathname) return false;
  if (FORCED_DARK_EXACT.has(pathname)) return true;
  return FORCED_DARK_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
