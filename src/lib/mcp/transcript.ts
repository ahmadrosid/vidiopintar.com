import { and, eq, gt } from "drizzle-orm";
import {
  fetchTranscript,
  listLanguages,
  YoutubeTranscriptNotAvailableError,
} from "youtube-transcript-plus";
import { db } from "@/lib/db";
import { mcpTranscriptCache } from "@/lib/db/schema";
import { fetchVideoFromOEmbed } from "@/lib/youtube";
import {
  fetchApifyTranscript,
  isApifyConfigured,
  transcriptLanguages,
} from "@/lib/apify-transcript";
import {
  mapTranscriptSegments,
  mapVideoDetails,
  pickCaptionTrack,
  type TranscriptApiResponse,
} from "@/lib/transcript-api";
import { McpServiceError } from "./errors";
import { toServiceError } from "./transcript-errors";
import { decodeCursor, encodeCursor, transcriptSnapshot } from "./cursor";
import { normalizeVideoReference } from "./video-reference";

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const PAGE_BYTES = 24_000;

export function paginateTranscript<T>(
  segments: T[],
  offset: number,
  maxBytes: number,
) {
  let end = offset;
  let bytes = 0;

  while (end < segments.length) {
    const nextBytes = Buffer.byteLength(JSON.stringify(segments[end]));

    if (bytes + nextBytes > maxBytes) break;
    bytes += nextBytes;
    end += 1;
  }

  return { segments: segments.slice(offset, end), nextOffset: end, bytes };
}

async function findCachedTranscript(
  videoId: string,
  language: string,
): Promise<TranscriptApiResponse | undefined> {
  const cached = await db.query.mcpTranscriptCache.findFirst({
    where: and(
      eq(mcpTranscriptCache.videoId, videoId),
      eq(mcpTranscriptCache.language, language),
      gt(mcpTranscriptCache.expiresAt, new Date()),
    ),
  });

  return cached?.response;
}

async function saveCachedTranscript(
  response: TranscriptApiResponse,
  language = response.language,
) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + CACHE_TTL_MS);

  await db
    .insert(mcpTranscriptCache)
    .values({
      videoId: response.video_id,
      language,
      response,
      expiresAt,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [mcpTranscriptCache.videoId, mcpTranscriptCache.language],
      set: { response, expiresAt, updatedAt: now },
    });
}

/** YouTube itself failed in a way Apify might get around (blocking, rate limits). */
class YoutubeBlockedError extends Error {
  constructor(readonly original: Error) {
    super(original.message);
  }
}

// Only wrap calls to YouTube here, so cache or DB errors never start a paid
// Apify run.
async function callYoutube<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    // From datacenter IPs (Vercel) YouTube answers with a "confirm you're
    // not a bot" page, which the library reports as NotAvailable. Videos
    // that really have no captions throw YoutubeTranscriptDisabledError.
    if (
      error instanceof YoutubeTranscriptNotAvailableError ||
      (error instanceof Error &&
        toServiceError(error).code === "TEMPORARY_PROVIDER_FAILURE")
    ) {
      throw new YoutubeBlockedError(error);
    }

    throw error;
  }
}

async function fetchFromYoutube(
  videoId: string,
  language?: string,
): Promise<TranscriptApiResponse> {
  const tracks = await callYoutube(() =>
    listLanguages(videoId, { retries: 2, retryDelay: 750 }),
  );

  const track = pickCaptionTrack(tracks, language);

  if (!track) throw new McpServiceError("CAPTIONS_UNAVAILABLE");

  const cached = await findCachedTranscript(videoId, track.languageCode);

  if (cached) return cached;

  const fetched = await callYoutube(() =>
    fetchTranscript(videoId, {
      retries: 2,
      retryDelay: 750,
      lang: track.languageCode,
      videoDetails: true,
    }),
  );

  const response: TranscriptApiResponse = {
    video_id: videoId,
    language: track.languageCode,
    transcript: mapTranscriptSegments(fetched.segments),
    metadata: mapVideoDetails(fetched.videoDetails),
  };

  if (!response.transcript.length) {
    throw new McpServiceError("CAPTIONS_UNAVAILABLE");
  }

  await saveCachedTranscript(response);

  return response;
}

async function fetchFromApify(
  videoId: string,
  language?: string,
): Promise<TranscriptApiResponse> {
  const languages = transcriptLanguages(language);
  const cached = await findCachedTranscript(videoId, languages[0]);

  if (cached) return cached;

  const response = await fetchApifyTranscript(videoId, languages);

  await saveCachedTranscript(response);

  // Apify may return a regional variant ("en-US" for "en"). Also cache it
  // under the requested code so the next lookup hits instead of starting
  // another paid run. Skip this when Apify fell back to another language,
  // or later requests for that code would get the wrong language.
  if (
    response.language !== languages[0] &&
    baseLanguage(response.language) === baseLanguage(languages[0])
  ) {
    await saveCachedTranscript(response, languages[0]);
  }

  return response;
}

function baseLanguage(code: string) {
  return code.toLowerCase().split(/[-_]/)[0];
}

export async function getTranscriptPage(input: {
  video: string;
  language?: string;
  cursor?: string;
  token: string;
}): Promise<{
  video_id: string;
  language: string;
  title?: string;
  metadata?: TranscriptApiResponse["metadata"];
  transcript: TranscriptApiResponse["transcript"];
  next_cursor?: string;
}> {
  const cursor = input.cursor
    ? decodeCursor(input.token, input.cursor)
    : undefined;

  const videoId = cursor?.videoId ?? normalizeVideoReference(input.video);
  let response: TranscriptApiResponse | undefined;

  if (cursor) {
    if (
      (input.video &&
        normalizeVideoReference(input.video) !== cursor.videoId) ||
      (input.language &&
        !cursor.language.toLowerCase().startsWith(input.language.toLowerCase()))
    ) {
      throw new McpServiceError("INVALID_CURSOR");
    }

    response = await findCachedTranscript(videoId, cursor.language);

    if (!response) throw new McpServiceError("INVALID_CURSOR");

    if (transcriptSnapshot(response.transcript) !== cursor.snapshot) {
      throw new McpServiceError("INVALID_CURSOR");
    }
  } else {
    try {
      response = await fetchFromYoutube(videoId, input.language);
    } catch (error) {
      // Fall back to the paid Apify actor only when YouTube is blocking or
      // rate-limiting us. Missing captions or videos won't change via Apify.
      if (!(error instanceof YoutubeBlockedError)) throw error;

      if (!isApifyConfigured()) throw error.original;
      response = await fetchFromApify(videoId, input.language);
    }
  }

  if (!response.metadata?.title) {
    try {
      const details = await fetchVideoFromOEmbed(videoId);
      response = {
        ...response,
        metadata: {
          ...response.metadata,
          title: details.title,
          author_name: details.channelTitle,
          thumbnail_url: details.thumbnails.high?.url,
        },
      };
      await db
        .update(mcpTranscriptCache)
        .set({ response, updatedAt: new Date() })
        .where(
          and(
            eq(mcpTranscriptCache.videoId, videoId),
            eq(mcpTranscriptCache.language, response.language),
          ),
        );
    } catch {}
  }

  const snapshot = transcriptSnapshot(response.transcript);
  const offset = cursor?.offset ?? 0;
  const page = paginateTranscript(response.transcript, offset, PAGE_BYTES);
  const end = page.nextOffset;

  if (end === offset && end < response.transcript.length) {
    throw new McpServiceError("SERVICE_MISCONFIGURED");
  }

  const title = response.metadata?.title;

  const metadata = response.metadata
    ? {
        author_name: response.metadata.author_name,
        author_url: response.metadata.author_url,
        thumbnail_url: response.metadata.thumbnail_url,
      }
    : undefined;

  return {
    video_id: videoId,
    language: response.language,
    title,
    metadata,
    transcript: page.segments,
    next_cursor:
      end < response.transcript.length
        ? encodeCursor(input.token, {
            videoId,
            language: response.language,
            snapshot,
            offset: end,
            expiresAt: Date.now() + 15 * 60 * 1000,
          })
        : undefined,
  };
}
