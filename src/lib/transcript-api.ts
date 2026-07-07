import { env } from "@/lib/env/server";

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
  available_languages?: string[];
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
  const languageAttempts = buildLanguageAttempts(options.language);
  let lastError = "No transcript content available";

  for (const language of languageAttempts) {
    const url = buildTranscriptUrl(videoUrlOrId, options, language);
    const response = await fetchWithRetry(url.toString(), apiKey);

    if (response.ok) {
      const data = (await response.json()) as TranscriptApiResponse;
      if (data.transcript?.length) {
        return data;
      }
      continue;
    }

    const body = await response.text().catch(() => "");
    lastError = parseTranscriptError(body, response.status, response.statusText);

    if (response.status === 404) {
      const parsed = parseTranscriptErrorBody(body);
      if (parsed?.available_languages?.length) {
        const availableAttempt = parsed.available_languages.join(",");
        if (!languageAttempts.includes(availableAttempt)) {
          languageAttempts.push(availableAttempt);
        }
      }
      continue;
    }

    throw new Error(lastError);
  }

  throw new Error(lastError);
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
