import { z } from "zod";
import { McpServiceError, type McpErrorCode } from "@/lib/mcp/errors";
import {
  authenticateApiKey,
  runTranscriptCall,
  serviceErrorBody,
  type TranscriptResult,
} from "@/lib/mcp/transcript-call";

export const runtime = "nodejs";

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, content-type",
  "access-control-allow-methods": "GET, POST, OPTIONS",
};

const inputSchema = z.object({
  video: z.string().max(2048).optional(),
  language: z.string().min(2).max(20).optional(),
  cursor: z.string().max(2048).optional(),
});

const statusByCode: Record<McpErrorCode, number> = {
  INVALID_REQUEST: 400,
  INVALID_VIDEO_REFERENCE: 400,
  INVALID_CURSOR: 400,
  INVALID_CREDENTIALS: 401,
  PLAN_REQUIRED: 402,
  CAPTIONS_UNAVAILABLE: 404,
  VIDEO_UNAVAILABLE: 404,
  USAGE_LIMIT_EXCEEDED: 429,
  SERVICE_MISCONFIGURED: 500,
  TEMPORARY_PROVIDER_FAILURE: 503,
};

type TranscriptInput = z.infer<typeof inputSchema>;

function json(
  body: TranscriptResult | ReturnType<typeof serviceErrorBody>,
  status: number,
  headers: Record<string, string> = {},
) {
  return Response.json(body, {
    status,
    headers: { ...corsHeaders, "cache-control": "no-store", ...headers },
  });
}

function errorResponse(error: McpServiceError) {
  const headers: Record<string, string> = {};

  if (error.retryAfter) headers["retry-after"] = String(error.retryAfter);

  if (error.code === "INVALID_CREDENTIALS") {
    headers["www-authenticate"] = 'Bearer realm="vidiopintar-api"';
  }

  return json(serviceErrorBody(error), statusByCode[error.code], headers);
}

/** Reads query params (GET) or a JSON body (POST). Null when invalid. */
async function readInput(request: Request): Promise<TranscriptInput | null> {
  let raw;

  if (request.method === "GET") {
    const params = new URL(request.url).searchParams;
    raw = {
      video: params.get("video") || undefined,
      language: params.get("language") || undefined,
      cursor: params.get("cursor") || undefined,
    };
  } else {
    try {
      raw = await request.json();
    } catch {
      return null;
    }
  }

  const parsed = inputSchema.safeParse(raw);

  return parsed.success ? parsed.data : null;
}

async function handle(request: Request) {
  let identity;

  try {
    identity = await authenticateApiKey(request);
  } catch (error) {
    if (error instanceof McpServiceError) return errorResponse(error);

    return errorResponse(
      new McpServiceError("SERVICE_MISCONFIGURED", true, 30),
    );
  }

  if (!identity)
    return errorResponse(new McpServiceError("INVALID_CREDENTIALS"));

  const input = await readInput(request);

  if (!input) return errorResponse(new McpServiceError("INVALID_REQUEST"));

  const outcome = await runTranscriptCall(identity, input, (result) =>
    Buffer.byteLength(JSON.stringify(result)),
  );

  if (!outcome.ok) return errorResponse(outcome.error);

  return json(outcome.result, 200);
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: { ...corsHeaders, "access-control-max-age": "86400" },
  });
}
