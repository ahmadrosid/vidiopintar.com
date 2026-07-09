import { getMarkdownForPath, normalizePath } from "@/lib/geo/markdown-pages";
import { SITE_LAST_MODIFIED } from "@/lib/geo/site";

export const dynamic = "force-static";

type RouteContext = {
  params: Promise<{ path?: string[] }>;
};

function markdownResponse(body: string) {
  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "Last-Modified": SITE_LAST_MODIFIED.toUTCString(),
      Vary: "Accept",
    },
  });
}

export async function GET(_request: Request, context: RouteContext) {
  const { path: segments = [] } = await context.params;
  const joined = segments.join("/");

  // Support /index.html.md and /index.md for the homepage
  if (joined === "index.html" || joined === "index") {
    const body = getMarkdownForPath("/");
    if (!body) {
      return new Response("Not found", { status: 404 });
    }
    return markdownResponse(body);
  }

  const path = normalizePath(joined);
  const body = getMarkdownForPath(path);
  if (!body) {
    return new Response("Not found", { status: 404 });
  }

  return markdownResponse(body);
}
