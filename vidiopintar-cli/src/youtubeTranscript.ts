const TRANSCRIPT_API_URL = "https://transcriptapi.com/api/v2/youtube/transcript";

interface TranscriptApiSegment {
  text: string;
  start: number;
  duration: number;
}

interface TranscriptApiResponse {
  video_id?: string;
  language?: string;
  transcript?: TranscriptApiSegment[];
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

async function fetchTranscriptFromApi(videoUrlOrId: string): Promise<TranscriptApiSegment[]> {
  const apiKey = process.env.TRANSCRIPT_API_KEY;
  if (!apiKey) {
    throw new Error('TRANSCRIPT_API_KEY environment variable is required');
  }

  const url = new URL(TRANSCRIPT_API_URL);
  url.searchParams.set('video_url', videoUrlOrId);
  url.searchParams.set('format', 'json');

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(
      `Failed to fetch transcript: ${response.status} ${response.statusText}${body ? ` - ${body}` : ''}`,
    );
  }

  const data = (await response.json()) as TranscriptApiResponse | TranscriptApiSegment[];
  const segments = Array.isArray(data) ? data : data.transcript;

  if (!segments || segments.length === 0) {
    throw new Error('No transcript available for this video. The video may not have captions enabled.');
  }

  return segments;
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
    const videoUrl = videoUrlOrId.includes('youtube.com') || videoUrlOrId.includes('youtu.be')
      ? videoUrlOrId
      : `https://www.youtube.com/watch?v=${videoId}`;

    const transcriptResult = await fetchTranscriptFromApi(videoUrl);

    const transcriptText = transcriptResult
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
