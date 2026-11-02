import { z } from "zod";
import { env } from "@/lib/env/server";
import { McpServiceError } from "@/lib/mcp/errors";
import {
  decodeHtmlEntities,
  type TranscriptApiResponse,
} from "@/lib/transcript-api";

// https://apify.com/dami_studio/youtube-transcript-bulk-scraper
// Picked on 2026-11-01 as the cheapest working actor: about $0.0009 per
// transcript on the Free plan, and failed videos are not charged.
const ACTOR_ID = "dami_studio~youtube-transcript-bulk-scraper";

const RUN_TIMEOUT_SECONDS = 90;

const itemSchema = z.object({
  ok: z.boolean().optional(),
  language: z.string().optional(),
  segments: z
    .array(
      z.object({ text: z.string(), start: z.number(), duration: z.number() }),
    )
    .optional(),
  title: z.string().optional(),
  channelName: z.string().optional(),
  channelUrl: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  errorCode: z.string().optional(),
  error: z.string().optional(),
  details: z.string().optional(),
});

type ApifyTranscriptItem = z.infer<typeof itemSchema>;

export function isApifyConfigured(): boolean {
  return Boolean(env.APIFY_API_TOKEN);
}

/** Language codes in priority order: the caller's choice, then en, then id. */
export function transcriptLanguages(preferred?: string): string[] {
  const codes = [preferred?.trim().toLowerCase(), "en", "id"].filter(
    (code): code is string => Boolean(code),
  );

  return [...new Set(codes)];
}

function apifyItemError(message: string): McpServiceError {
  // Account problems (e.g. "Proxy responded with 402 Payment Required:
  // Bandwidth limit reached") need an operator, not a retry.
  if (/payment required|bandwidth|upgrade|quota|credit/i.test(message)) {
    console.error(`Apify transcript account error: ${message}`);

    return new McpServiceError("SERVICE_MISCONFIGURED");
  }

  // Check captions first: "Transcript is unavailable" means the video plays
  // but has no captions, not that the video is gone.
  if (/transcript|caption|subtitle/i.test(message)) {
    return new McpServiceError("CAPTIONS_UNAVAILABLE");
  }

  if (
    /unavailable|private|removed|deleted|not.?found|not exist/i.test(message)
  ) {
    return new McpServiceError("VIDEO_UNAVAILABLE");
  }

  console.error(`Apify transcript run error: ${message}`);

  return new McpServiceError("TEMPORARY_PROVIDER_FAILURE", true, 30);
}

export function mapApifyItem(
  videoId: string,
  item: ApifyTranscriptItem | undefined,
): TranscriptApiResponse {
  if (item && (item.ok === false || item.error)) {
    throw apifyItemError(
      [item.errorCode, item.error, item.details].filter(Boolean).join(": "),
    );
  }

  const segments = item?.segments ?? [];

  if (!item?.language || segments.length === 0) {
    throw new McpServiceError("CAPTIONS_UNAVAILABLE");
  }

  return {
    video_id: videoId,
    language: item.language,
    transcript: segments.map(({ text, start, duration }) => ({
      text: decodeHtmlEntities(text),
      start,
      duration,
    })),
    metadata: {
      title: item.title,
      author_name: item.channelName,
      author_url: item.channelUrl,
      thumbnail_url: item.thumbnailUrl,
    },
  };
}

export async function fetchApifyTranscript(
  videoId: string,
  languages: string[],
): Promise<TranscriptApiResponse> {
  const url = new URL(
    `https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items`,
  );

  url.searchParams.set("timeout", String(RUN_TIMEOUT_SECONDS));

  let response: Response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.APIFY_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        videoUrls: [`https://www.youtube.com/watch?v=${videoId}`],
        languages,
        maxItems: 1,
      }),
      signal: AbortSignal.timeout((RUN_TIMEOUT_SECONDS + 10) * 1000),
      cache: "no-store",
    });
  } catch {
    throw new McpServiceError("TEMPORARY_PROVIDER_FAILURE", true, 30);
  }

  if (!response.ok) {
    console.error(
      `Apify transcript run failed: ${response.status} ${await response.text().catch(() => "")}`,
    );

    // 401/403: bad token. 402: out of credits. Both need an operator to fix.
    if ([401, 402, 403].includes(response.status)) {
      throw new McpServiceError("SERVICE_MISCONFIGURED");
    }

    throw new McpServiceError("TEMPORARY_PROVIDER_FAILURE", true, 30);
  }

  const items = z
    .array(itemSchema)
    .safeParse(await response.json().catch(() => null));

  if (!items.success) {
    throw new McpServiceError("TEMPORARY_PROVIDER_FAILURE", true, 30);
  }

  return mapApifyItem(videoId, items.data[0]);
}
