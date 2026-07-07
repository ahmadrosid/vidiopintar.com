import { env } from "@/lib/env/server";

const TRANSCRIPT_API_URL = "https://transcriptapi.com/api/v2/youtube/transcript";

export interface TranscriptApiSegment {
  text: string;
  start: number;
  duration: number;
}

interface TranscriptApiResponse {
  video_id?: string;
  language?: string;
  transcript?: TranscriptApiSegment[];
}

export async function fetchTranscriptFromApi(
  videoUrlOrId: string,
  apiKey: string = env.TRANSCRIPT_API_KEY,
): Promise<TranscriptApiSegment[]> {
  const url = new URL(TRANSCRIPT_API_URL);
  url.searchParams.set("video_url", videoUrlOrId);
  url.searchParams.set("format", "json");

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Failed to fetch transcript: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`,
    );
  }

  const data = (await response.json()) as TranscriptApiResponse | TranscriptApiSegment[];
  const segments = Array.isArray(data) ? data : data.transcript;

  if (!segments || segments.length === 0) {
    throw new Error("No transcript content available");
  }

  return segments;
}
