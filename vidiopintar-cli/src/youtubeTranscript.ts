import { fetchTranscript } from 'youtube-transcript-plus';

/**
 * Decodes HTML entities in a string
 * Handles both named entities and numeric entities (decimal and hex)
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

  // First pass: decode named entities
  let decoded = text.replace(/&(?:amp|lt|gt|quot|apos|nbsp|#39);/g, (match) => entities[match] || match);

  // Second pass: decode numeric entities (decimal &#123; and hex &#x1A;)
  decoded = decoded.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));
  decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)));

  // Handle double-encoded entities (e.g., &amp;gt; -> &gt; -> >)
  // Keep decoding until no more changes
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

  // If no pattern matches, assume the input is already a video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }

  return null;
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
    const transcriptResult = await fetchTranscript(videoId);

    if (!transcriptResult || transcriptResult.length === 0) {
      throw new Error('No transcript available for this video. The video may not have captions enabled.');
    }

    // Join all transcript segments into a single text, decoding HTML entities
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
