import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import { SITE_LAST_MODIFIED, SITE_URL } from "@/lib/geo/site";

const isProtectedRoute = createRouteMatcher([
  "/home(.*)",
  "/explore(.*)",
  "/library(.*)",
  "/notes(.*)",
  "/profile(.*)",
  "/admin(.*)",
]);

const MARKDOWN_PUBLIC_PREFIXES = [
  "/faq",
  "/blog",
  "/changelogs",
  "/privacy",
  "/terms",
];

function wantsMarkdown(request: NextRequest): boolean {
  const accept = request.headers.get("accept") || "";
  return accept.includes("text/markdown");
}

function isMarkdownEligiblePath(pathname: string): boolean {
  if (pathname === "/") return true;
  return MARKDOWN_PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function toMarkdownRewritePath(pathname: string): string | null {
  if (pathname === "/index.html.md" || pathname === "/index.md") {
    return "/md/index.html";
  }

  if (pathname.endsWith(".md")) {
    const withoutExt = pathname.slice(0, -3);
    if (withoutExt === "" || withoutExt === "/") {
      return "/md/index.html";
    }
    return `/md${withoutExt}`;
  }

  return null;
}

function markdownAlternateHref(pathname: string): string {
  if (pathname === "/") return `${SITE_URL}/index.html.md`;
  return `${SITE_URL}${pathname}.md`;
}

function applyGeoHeaders(
  request: NextRequest,
  response: NextResponse
): NextResponse {
  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/md/") ||
    pathname.endsWith(".md") ||
    pathname === "/llms.txt" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return response;
  }

  const links: string[] = [
    `<${SITE_URL}/llms.txt>; rel="describedby"; type="text/plain"`,
  ];

  if (isMarkdownEligiblePath(pathname)) {
    links.unshift(
      `<${markdownAlternateHref(pathname)}>; rel="alternate"; type="text/markdown"`
    );
  }

  const existing = response.headers.get("Link");
  response.headers.set(
    "Link",
    existing ? `${existing}, ${links.join(", ")}` : links.join(", ")
  );
  response.headers.set("Last-Modified", SITE_LAST_MODIFIED.toUTCString());

  return response;
}

export default clerkMiddleware(async (auth, req) => {
  const pathname = req.nextUrl.pathname;
  const mdRewrite = toMarkdownRewritePath(pathname);

  if (mdRewrite) {
    const url = req.nextUrl.clone();
    url.pathname = mdRewrite;
    return NextResponse.rewrite(url);
  }

  if (wantsMarkdown(req) && isMarkdownEligiblePath(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname =
      pathname === "/" ? "/md/index.html" : `/md${pathname}`;
    return NextResponse.rewrite(url);
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  return applyGeoHeaders(req, NextResponse.next());
});

export const config = {
  matcher: [
    // Omit html? so /index.html.md is not treated as a static asset
    "/((?!_next|[^?]*\\.(?:css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
