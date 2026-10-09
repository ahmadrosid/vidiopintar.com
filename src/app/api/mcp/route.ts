import { handleMcpRequest } from "@/lib/mcp/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const response = await handleMcpRequest(request);
  const headers = new Headers(response.headers);
  headers.set("access-control-allow-origin", "*");
  headers.set("access-control-allow-headers", "authorization, content-type, mcp-protocol-version, mcp-session-id, last-event-id");
  headers.set("access-control-allow-methods", "POST, GET, DELETE, OPTIONS");

  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "authorization, content-type, mcp-protocol-version, mcp-session-id, last-event-id",
      "access-control-allow-methods": "POST, GET, DELETE, OPTIONS",
      "access-control-max-age": "86400",
    },
  });
}
