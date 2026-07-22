import { createYoutubeClient, type YoutubeClient } from "@/lib/youtube/client";
import type { RecommendedVideo } from "@/lib/recommended-videos";
import type { YoutubeSearchChannel } from "@/lib/youtube/search";

const LATEST_VIDEO_LIMIT = 10;
const MIN_DURATION_SECONDS = 180;
/** Fetch extra candidates so Shorts filtering still leaves ~10 videos. */
const VIDEO_CANDIDATE_MULTIPLIER = 2;

function pickThumbnail(
  thumbnails?: {
    medium?: { url?: string | null } | null;
    high?: { url?: string | null } | null;
    default?: { url?: string | null } | null;
  } | null,
): string {
  return (
    thumbnails?.medium?.url ||
    thumbnails?.high?.url ||
    thumbnails?.default?.url ||
    ""
  );
}

function parseIso8601DurationSeconds(iso?: string | null): number | undefined {
  if (!iso) return undefined;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return undefined;
  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);
  return hours * 3600 + minutes * 60 + seconds;
}

function formatDurationSeconds(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

async function fetchDurationsByIds(
  client: YoutubeClient,
  ids: string[],
): Promise<Map<string, number | undefined>> {
  const durations = new Map<string, number | undefined>();
  if (ids.length === 0) return durations;

  const response = await client.videos.list({
    part: ["contentDetails"],
    id: ids,
    maxResults: ids.length,
  });

  for (const item of response.data.items ?? []) {
    if (!item.id) continue;
    durations.set(
      item.id,
      parseIso8601DurationSeconds(item.contentDetails?.duration),
    );
  }

  return durations;
}

export async function getChannelById(
  channelId: string,
): Promise<YoutubeSearchChannel | null> {
  const id = channelId.trim();
  if (!id) return null;

  const client = createYoutubeClient();
  if (!client) return null;

  try {
    const response = await client.channels.list({
      part: ["snippet", "statistics"],
      id: [id],
      maxResults: 1,
    });

    const item = response.data.items?.[0];
    if (!item?.id) return null;

    const subscriberCount = Number(item.statistics?.subscriberCount ?? NaN);
    if (!Number.isFinite(subscriberCount)) return null;

    return {
      channelId: item.id,
      title: item.snippet?.title ?? "Unknown Channel",
      thumbnailUrl: pickThumbnail(item.snippet?.thumbnails),
      subscriberCount,
    };
  } catch (error) {
    console.error(`Failed to fetch channel ${id}:`, error);
    return null;
  }
}

export async function getLatestVideosForChannel(
  channelId: string,
  limit = LATEST_VIDEO_LIMIT,
): Promise<RecommendedVideo[]> {
  const id = channelId.trim();
  if (!id) return [];

  const client = createYoutubeClient();
  if (!client) return [];

  const maxResults = Math.min(Math.max(limit, 1), 50);
  const fetchCount = Math.min(maxResults * VIDEO_CANDIDATE_MULTIPLIER, 50);

  try {
    const search = await client.search.list({
      part: ["snippet"],
      channelId: id,
      type: ["video"],
      order: "date",
      safeSearch: "moderate",
      maxResults: fetchCount,
    });

    const items = (search.data.items ?? []).filter(
      (item) => item.id?.videoId && item.snippet?.title,
    );
    const ids = items.map((item) => item.id!.videoId!);
    const durations = await fetchDurationsByIds(client, ids);

    const videos: RecommendedVideo[] = [];
    for (const item of items) {
      if (videos.length >= maxResults) break;

      const youtubeId = item.id!.videoId!;
      const seconds = durations.get(youtubeId);
      if (seconds !== undefined && seconds < MIN_DURATION_SECONDS) {
        continue;
      }

      videos.push({
        youtubeId,
        title: item.snippet?.title ?? "Untitled",
        channelTitle: item.snippet?.channelTitle ?? "Unknown Channel",
        thumbnailUrl: pickThumbnail(item.snippet?.thumbnails),
        duration:
          seconds === undefined ? undefined : formatDurationSeconds(seconds),
      });
    }

    return videos;
  } catch (error) {
    console.error(`Failed to fetch videos for channel ${id}:`, error);
    return [];
  }
}
