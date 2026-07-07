import { env } from "@/lib/env/server";

const TRANSCRIPT_API_URL = "https://transcriptapi.com/api/v2/youtube/transcript";

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

export async function fetchTranscriptFromApi(
  videoUrlOrId: string,
  apiKey: string = env.TRANSCRIPT_API_KEY,
): Promise<TranscriptApiSegment[]> {
  const response = await fetchTranscriptResponse(videoUrlOrId, apiKey);
  return response.transcript;
}

export async function fetchTranscriptResponse(
  videoUrlOrId: string,
  apiKey: string = env.TRANSCRIPT_API_KEY,
): Promise<TranscriptApiResponse> {
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

  const data = (await response.json()) as TranscriptApiResponse;

  if (!data.transcript || data.transcript.length === 0) {
    throw new Error("No transcript content available");
  }

  return data;
}
