const TRANSCRIPT_API_BASE = "https://transcriptapi.com/api/v2";
const RETRYABLE_STATUSES = new Set([408, 429, 503]);
const MAX_RETRIES = 3;

interface TranscriptApiSegment {
  text: string;
  start: number;
  duration: number;
}

interface TranscriptApiResponse {
  video_id: string;
  language: string;
  transcript: TranscriptApiSegment[];
  metadata?: {
    title?: string;
    author_name?: string;
    author_url?: string;
    thumbnail_url?: string;
  };
}

interface FetchTranscriptOptions {
  language?: string;
  sendMetadata?: boolean;
  includeTimestamp?: boolean;
}

/**
 * Decodes HTML entities in a string
 */
function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': "'",
    '&#39;': "'",
    '&nbsp;': ' ',
  };

  let decoded = text.replace(/&(?:amp|lt|gt|quot|apos|nbsp|#39);/g, (match) => entities[match] || match);
  decoded = decoded.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));
  decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)));

  let prev = '';
  while (prev !== decoded) {
    prev = decoded;
    decoded = decoded.replace(/&(?:amp|lt|gt|quot|apos|nbsp|#39);/g, (match) => entities[match] || match);
    decoded = decoded.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));
    decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
  }

  return decoded;
}

/**
 * Extracts video ID from various YouTube URL formats
 */
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }

  return null;
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
      const retryAfter = response.headers.get('Retry-After');
      const delayMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : (attempt + 1) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return lastResponse!;
}

async function fetchTranscriptResponse(
  videoUrlOrId: string,
  options: FetchTranscriptOptions = {},
): Promise<TranscriptApiResponse> {
  const apiKey = process.env.TRANSCRIPT_API_KEY;
  if (!apiKey) {
    throw new Error('TRANSCRIPT_API_KEY environment variable is required');
  }

  const queue = buildLanguageAttempts(options.language);
  const attempted = new Set<string>();
  let lastError = 'No transcript available for this video. The video may not have captions enabled.';

  while (queue.length > 0) {
    const language = queue.shift()!;
    if (attempted.has(language)) continue;
    attempted.add(language);

    const url = buildTranscriptUrl(videoUrlOrId, options, language);
    const response = await fetchWithRetry(url.toString(), apiKey);

    if (response.ok) {
      const data = (await response.json()) as TranscriptApiResponse;
      if (data.transcript?.length) {
        return data;
      }
      continue;
    }

    const body = await response.text().catch(() => '');
    lastError = parseTranscriptError(body, response.status, response.statusText);

    if (response.status === 404) {
      const parsed = parseTranscriptErrorBody(body);
      if (parsed?.available_languages?.length) {
        const availableAttempt = parsed.available_languages
          .map((language) => (typeof language === 'string' ? language : language.code))
          .join(',');
        if (!attempted.has(availableAttempt)) {
          queue.push(availableAttempt);
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
    attempts.push('en,id,asr');
  }

  attempts.push('asr');
  return attempts;
}

function buildTranscriptUrl(
  videoUrlOrId: string,
  options: FetchTranscriptOptions,
  language?: string,
) {
  const url = new URL(`${TRANSCRIPT_API_BASE}/youtube/transcript`);
  url.searchParams.set('video_url', videoUrlOrId);
  url.searchParams.set('format', 'json');
  url.searchParams.set('include_timestamp', String(options.includeTimestamp ?? true));

  if (options.sendMetadata) {
    url.searchParams.set('send_metadata', 'true');
  }

  if (language) {
    url.searchParams.set('language', language);
  }

  return url;
}

interface TranscriptApiLanguage {
  code: string;
  name?: string;
}

interface TranscriptApiErrorBody {
  detail?: string;
  code?: string;
  available_languages?: Array<string | TranscriptApiLanguage>;
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

  if (parsed?.code === 'no_transcript_for_requested_languages') {
    if (!parsed.available_languages?.length) {
      return 'No transcript available for this video. The video may not have captions enabled.';
    }
    return parsed.detail ?? 'No transcript available for the requested languages';
  }

  return `Failed to fetch transcript: ${status} ${statusText}${body ? ` - ${body}` : ''}`;
}

/**
 * Fetches transcript from a YouTube video URL or video ID
 */
export async function fetchYoutubeTranscript(videoUrlOrId: string): Promise<string> {
  const videoId = extractVideoId(videoUrlOrId);

  if (!videoId) {
    throw new Error(`Invalid YouTube URL or video ID: ${videoUrlOrId}`);
  }

  try {
    const transcriptResponse = await fetchTranscriptResponse(videoId, {
      sendMetadata: true,
    });

    const transcriptText = transcriptResponse.transcript
      .map((item) => decodeHtmlEntities(item.text))
      .filter((text) => text && text !== 'N/A')
      .join(' ');

    if (!transcriptText.trim()) {
      throw new Error('Transcript is empty or contains no valid content.');
    }

    return transcriptText;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch transcript: ${error.message}`);
    }
    throw new Error('Failed to fetch transcript: Unknown error');
  }
}

/**
 * Returns video title from transcript metadata when available
 */
export async function fetchYoutubeTranscriptWithMetadata(videoUrlOrId: string): Promise<{
  transcript: string;
  title?: string;
}> {
  const videoId = extractVideoId(videoUrlOrId);
  if (!videoId) {
    throw new Error(`Invalid YouTube URL or video ID: ${videoUrlOrId}`);
  }

  const transcriptResponse = await fetchTranscriptResponse(videoId, {
    sendMetadata: true,
  });

  const transcript = transcriptResponse.transcript
    .map((item) => decodeHtmlEntities(item.text))
    .filter((text) => text && text !== 'N/A')
    .join(' ');

  if (!transcript.trim()) {
    throw new Error('Transcript is empty or contains no valid content.');
  }

  return {
    transcript,
    title: transcriptResponse.metadata?.title,
  };
}
