import { env } from "@/lib/env/server";
import { TranscriptCacheRepository, TranscriptRepository } from "@/lib/db/repository";
import {
  storedSegmentsToTranscriptApi,
  transcriptApiSegmentsToStored,
} from "@/lib/transcript-segments";
import { extractVideoId } from "@/lib/utils";

const TRANSCRIPT_API_BASE = "https://transcriptapi.com/api/v2";
const RETRYABLE_STATUSES = new Set([408, 429, 503]);
const MAX_RETRIES = 3;

export interface TranscriptApiSegment {
  text: string;
  start: number;
  duration: number;
}

export interface TranscriptApiMetadata {
  title?: string;
  author_name?: string;
  author_url?: string;
  thumbnail_url?: string;
}

export interface TranscriptApiLanguage {
  code: string;
  name?: string;
}

export interface TranscriptApiVideoInfoResponse {
  video_id: string;
  metadata: TranscriptApiMetadata;
  available_languages: TranscriptApiLanguage[];
}

export interface TranscriptApiResponse {
  video_id: string;
  language: string;
  transcript: TranscriptApiSegment[];
  metadata?: TranscriptApiMetadata;
}

export interface FetchTranscriptOptions {
  /** Preferred language code; fallbacks are tried automatically */
  language?: string;
  sendMetadata?: boolean;
  includeTimestamp?: boolean;
}

interface TranscriptApiErrorBody {
  detail?: string;
  code?: string;
  available_languages?: Array<string | TranscriptApiLanguage>;
}

export async function fetchVideoInfoFromApi(
  videoUrlOrId: string,
  apiKey: string = env.TRANSCRIPT_API_KEY,
): Promise<TranscriptApiVideoInfoResponse> {
  const url = new URL(`${TRANSCRIPT_API_BASE}/youtube/info`);
  url.searchParams.set("video_url", videoUrlOrId);

  const response = await fetchWithRetry(url.toString(), apiKey);

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Failed to fetch video info: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`,
    );
  }

  return (await response.json()) as TranscriptApiVideoInfoResponse;
}

export async function fetchTranscriptFromApi(
  videoUrlOrId: string,
  options: FetchTranscriptOptions = {},
  apiKey: string = env.TRANSCRIPT_API_KEY,
): Promise<TranscriptApiSegment[]> {
  const response = await fetchTranscriptResponse(videoUrlOrId, options, apiKey);
  return response.transcript;
}

export async function fetchTranscriptResponse(
  videoUrlOrId: string,
  options: FetchTranscriptOptions = {},
  apiKey: string = env.TRANSCRIPT_API_KEY,
): Promise<TranscriptApiResponse> {
  const videoId = normalizeVideoId(videoUrlOrId);
  const cached = await getCachedTranscriptResponse(videoId);
  if (cached) {
    return cached;
  }

  const queue = buildLanguageAttempts(options.language);
  const attempted = new Set<string>();
  let lastError = "No transcript content available";

  while (queue.length > 0) {
    const language = queue.shift()!;
    if (attempted.has(language)) continue;
    attempted.add(language);

    const url = buildTranscriptUrl(videoId, options, language);
    const response = await fetchWithRetry(url.toString(), apiKey);

    if (response.ok) {
      const data = (await response.json()) as TranscriptApiResponse;
      if (data.transcript?.length) {
        await cacheTranscriptResponse(videoId, data);
        return data;
      }
      continue;
    }

    const body = await response.text().catch(() => "");
    lastError = parseTranscriptError(body, response.status, response.statusText);

    if (response.status === 404) {
      const parsed = parseTranscriptErrorBody(body);
      if (parsed?.available_languages?.length) {
        const availableAttempt = extractLanguageCodes(parsed.available_languages).join(",");
        if (!attempted.has(availableAttempt)) {
          queue.push(availableAttempt);
        }
      }
      continue;
    }

    throw new Error(lastError);
  }

  await TranscriptCacheRepository.markUnavailable(videoId);
  throw new Error(lastError);
}

function normalizeVideoId(videoUrlOrId: string): string {
  return extractVideoId(videoUrlOrId) ?? videoUrlOrId;
}

async function getCachedTranscriptResponse(
  videoId: string,
): Promise<TranscriptApiResponse | null> {
  const cached = await TranscriptCacheRepository.get(videoId);
  if (cached?.unavailable) {
    throw new Error("No transcript available for this video");
  }
  if (cached?.response?.transcript?.length) {
    return cached.response;
  }

  const storedSegments = await TranscriptRepository.getByVideoId(videoId);
  if (storedSegments.length === 0) {
    return null;
  }

  const response = storedSegmentsToTranscriptApi(
    videoId,
    storedSegments.map((segment) => ({
      start: segment.start,
      end: segment.end,
      text: segment.text,
      isChapterStart: segment.isChapterStart,
    })),
  );
  await TranscriptCacheRepository.saveResponse(videoId, response);
  return response;
}

async function cacheTranscriptResponse(
  videoId: string,
  response: TranscriptApiResponse,
): Promise<void> {
  await TranscriptCacheRepository.saveResponse(videoId, response);
  await TranscriptRepository.upsertSegments(
    videoId,
    transcriptApiSegmentsToStored(response.transcript),
  );
}

function buildLanguageAttempts(preferred?: string): string[] {
  const attempts: string[] = [];

  if (preferred) {
    attempts.push(`${preferred},en,id,asr`);
    attempts.push(`${preferred},asr`);
  } else {
    attempts.push("en,id,asr");
  }

  attempts.push("asr");

  return attempts;
}

function buildTranscriptUrl(
  videoUrlOrId: string,
  options: FetchTranscriptOptions,
  language?: string,
) {
  const url = new URL(`${TRANSCRIPT_API_BASE}/youtube/transcript`);
  url.searchParams.set("video_url", videoUrlOrId);
  url.searchParams.set("format", "json");
  url.searchParams.set("include_timestamp", String(options.includeTimestamp ?? true));

  if (options.sendMetadata) {
    url.searchParams.set("send_metadata", "true");
  }

  if (language) {
    url.searchParams.set("language", language);
  }

  return url;
}

function parseTranscriptErrorBody(body: string): TranscriptApiErrorBody | null {
  try {
    return JSON.parse(body) as TranscriptApiErrorBody;
  } catch {
    return null;
  }
}

function extractLanguageCodes(
  languages: Array<string | TranscriptApiLanguage>,
): string[] {
  return languages.map((language) =>
    typeof language === "string" ? language : language.code,
  );
}

function parseTranscriptError(body: string, status: number, statusText: string): string {
  const parsed = parseTranscriptErrorBody(body);

  if (parsed?.code === "no_transcript_for_requested_languages") {
    if (!parsed.available_languages?.length) {
      return "No transcript available for this video";
    }
    return parsed.detail ?? "No transcript available for the requested languages";
  }

  return `Failed to fetch transcript: ${status} ${statusText}${body ? ` - ${body}` : ""}`;
}

async function fetchWithRetry(url: string, apiKey: string): Promise<Response> {
  let lastResponse: Response | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (response.ok || !RETRYABLE_STATUSES.has(response.status)) {
      return response;
    }

    lastResponse = response;

    if (attempt < MAX_RETRIES - 1) {
      const retryAfter = response.headers.get("Retry-After");
      const delayMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : (attempt + 1) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return lastResponse!;
}
