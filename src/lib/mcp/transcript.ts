import { and, eq, gt } from "drizzle-orm";
import { fetchTranscript, listLanguages } from "youtube-transcript-plus";
import { db } from "@/lib/db";
import { mcpTranscriptCache } from "@/lib/db/schema";
import {
  mapTranscriptSegments,
  mapVideoDetails,
  pickCaptionTrack,
  type TranscriptApiResponse,
} from "@/lib/transcript-api";
import { McpServiceError } from "./errors";
import { decodeCursor, encodeCursor, transcriptSnapshot } from "./cursor";
import { normalizeVideoReference } from "./video-reference";

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const PAGE_BYTES = 24_000;

export function paginateTranscript<T>(segments: T[], offset: number, maxBytes: number) {
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

export async function getTranscriptPage(input: {
  video?: string;
  language?: string;
  cursor?: string;
  token: string;
}): Promise<{ video_id: string; language: string; title?: string; metadata?: TranscriptApiResponse["metadata"]; transcript: TranscriptApiResponse["transcript"]; next_cursor?: string }> {
  const cursor = input.cursor ? decodeCursor(input.token, input.cursor) : undefined;
  const videoId = cursor?.videoId ?? normalizeVideoReference(input.video ?? "");
  let response: TranscriptApiResponse | undefined;

  if (cursor) {
    if (
      (input.video && normalizeVideoReference(input.video) !== cursor.videoId) ||
      (input.language && !cursor.language.toLowerCase().startsWith(input.language.toLowerCase()))
    ) {
      throw new McpServiceError("INVALID_CURSOR");
    }
    const cached = await db.query.mcpTranscriptCache.findFirst({
      where: and(
        eq(mcpTranscriptCache.videoId, videoId),
        eq(mcpTranscriptCache.language, cursor.language),
        gt(mcpTranscriptCache.expiresAt, new Date()),
      ),
    });
    if (!cached) throw new McpServiceError("INVALID_CURSOR");
    response = cached.response;
    if (transcriptSnapshot(response.transcript) !== cursor.snapshot) {
      throw new McpServiceError("INVALID_CURSOR");
    }
  } else {
    const tracks = await listLanguages(videoId, { retries: 2, retryDelay: 750 });
    const track = pickCaptionTrack(tracks, input.language);
    if (!track) throw new McpServiceError("CAPTIONS_UNAVAILABLE");
    const cached = await db.query.mcpTranscriptCache.findFirst({
      where: and(
        eq(mcpTranscriptCache.videoId, videoId),
        eq(mcpTranscriptCache.language, track.languageCode),
        gt(mcpTranscriptCache.expiresAt, new Date()),
      ),
    });
    response = cached?.response;
    if (!response) {
      const fetched = await fetchTranscript(videoId, {
        retries: 2,
        retryDelay: 750,
        lang: track.languageCode,
        videoDetails: true,
      });
      response = {
        video_id: videoId,
        language: track.languageCode,
        transcript: mapTranscriptSegments(fetched.segments),
        metadata: mapVideoDetails(fetched.videoDetails),
      };
      if (!response.transcript.length) throw new McpServiceError("CAPTIONS_UNAVAILABLE");
      await db.insert(mcpTranscriptCache).values({
        videoId,
        language: track.languageCode,
        response,
        expiresAt: new Date(Date.now() + CACHE_TTL_MS),
        updatedAt: new Date(),
      }).onConflictDoUpdate({
        target: [mcpTranscriptCache.videoId, mcpTranscriptCache.language],
        set: {
          response,
          expiresAt: new Date(Date.now() + CACHE_TTL_MS),
          updatedAt: new Date(),
        },
      });
    }
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
    next_cursor: end < response.transcript.length
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
