import { youtube, type youtube_v3 } from "@googleapis/youtube";
import { env } from "@/lib/env/server";

export type YoutubeClient = youtube_v3.Youtube;

export function getYoutubeApiKey(): string | undefined {
  return env.YOUTUBE_API_KEY ?? process.env.YOUTUBE_API_KEY;
}

export function createYoutubeClient(apiKey = getYoutubeApiKey()): YoutubeClient | null {
  if (!apiKey) return null;
  return youtube({ version: "v3", auth: apiKey });
}
