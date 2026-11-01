import { z } from "zod";
import { env } from "@/lib/env/server";
import { McpServiceError } from "@/lib/mcp/errors";
import type { TranscriptApiResponse } from "@/lib/transcript-api";

// https://apify.com/supreme_coder/youtube-transcript-scraper
const ACTOR_ID = "supreme_coder~youtube-transcript-scraper";

const RUN_TIMEOUT_SECONDS = 90;

const itemSchema = z.object({
  languageCode: z.string().optional(),
  transcript: z
    .array(
      z.object({ text: z.string(), start: z.number(), duration: z.number() }),
    )
    .optional(),
  videoDetails: z
    .object({
      title: z.string().optional(),
      author: z.string().optional(),
      channelId: z.string().optional(),
      thumbnail: z
        .object({
          thumbnails: z.array(z.object({ url: z.string() })).optional(),
        })
        .optional(),
    })
    .optional(),
  error: z.string().optional(),
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

  if (/unavailable|private|removed|not exist/i.test(message)) {
    return new McpServiceError("VIDEO_UNAVAILABLE");
  }

  if (/transcript|caption|subtitle/i.test(message)) {
    return new McpServiceError("CAPTIONS_UNAVAILABLE");
  }

  console.error(`Apify transcript run error: ${message}`);

  return new McpServiceError("TEMPORARY_PROVIDER_FAILURE", true, 30);
}

export function mapApifyItem(
  videoId: string,
  item: ApifyTranscriptItem | undefined,
): TranscriptApiResponse {
  if (item?.error) {
    throw apifyItemError(item.error);
  }

  const segments = item?.transcript ?? [];

  if (!item?.languageCode || segments.length === 0) {
    throw new McpServiceError("CAPTIONS_UNAVAILABLE");
  }

  const details = item.videoDetails;
  const thumbnails = details?.thumbnail?.thumbnails;

  return {
    video_id: videoId,
    language: item.languageCode,
    transcript: segments.map(({ text, start, duration }) => ({
      text,
      start,
      duration,
    })),
    metadata: details
      ? {
          title: details.title,
          author_name: details.author,
          author_url: details.channelId
            ? `https://www.youtube.com/channel/${details.channelId}`
            : undefined,
          thumbnail_url: thumbnails?.at(-1)?.url,
        }
      : undefined,
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
        urls: [{ url: `https://www.youtube.com/watch?v=${videoId}` }],
        outputFormat: "json",
        languages,
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
