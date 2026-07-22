import { createYoutubeClient, type YoutubeClient } from "@/lib/youtube/client";
import type { RecommendedVideo } from "@/lib/recommended-videos";

const DEFAULT_VIDEO_LIMIT = 24;
const DEFAULT_CHANNEL_LIMIT = 12;
const MIN_DURATION_SECONDS = 180;
const MIN_SUBSCRIBER_COUNT = 1_000;
/** Fetch extra video candidates so Shorts filtering still leaves a full page. */
const VIDEO_CANDIDATE_MULTIPLIER = 2;
/** Fetch extra channel candidates so subscriber filtering still leaves results. */
const CHANNEL_CANDIDATE_MULTIPLIER = 2;

export type YoutubeSearchChannel = {
  channelId: string;
  title: string;
  thumbnailUrl: string;
  subscriberCount: number;
};

export type YoutubeSearchResult = {
  videos: RecommendedVideo[];
  channels: YoutubeSearchChannel[];
};

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

type ChannelDetails = {
  title: string;
  thumbnailUrl: string;
  subscriberCount: number;
};

async function fetchChannelDetailsByIds(
  client: YoutubeClient,
  channelIds: string[],
): Promise<Map<string, ChannelDetails>> {
  const details = new Map<string, ChannelDetails>();
  const uniqueIds = [...new Set(channelIds.filter(Boolean))];
  if (uniqueIds.length === 0) return details;

  const response = await client.channels.list({
    part: ["snippet", "statistics"],
    id: uniqueIds,
    maxResults: uniqueIds.length,
  });

  for (const item of response.data.items ?? []) {
    if (!item.id) continue;
    const subscriberCount = Number(item.statistics?.subscriberCount ?? NaN);
    if (!Number.isFinite(subscriberCount)) continue;

    details.set(item.id, {
      title: item.snippet?.title ?? "Unknown Channel",
      thumbnailUrl: pickThumbnail(item.snippet?.thumbnails),
      subscriberCount,
    });
  }

  return details;
}

async function searchVideos(
  client: YoutubeClient,
  query: string,
  maxResults: number,
): Promise<RecommendedVideo[]> {
  const fetchCount = Math.min(maxResults * VIDEO_CANDIDATE_MULTIPLIER, 50);

  // Do not pass videoDuration — YouTube's "medium" is only 4–20 min and
  // drops most long-form learning videos. Filter Shorts after fetch instead.
  const search = await client.search.list({
    part: ["snippet"],
    q: query,
    type: ["video"],
    order: "relevance",
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
}

async function searchChannels(
  client: YoutubeClient,
  query: string,
  maxResults: number,
): Promise<YoutubeSearchChannel[]> {
  const fetchCount = Math.min(maxResults * CHANNEL_CANDIDATE_MULTIPLIER, 50);

  const search = await client.search.list({
    part: ["snippet"],
    q: query,
    type: ["channel"],
    order: "relevance",
    safeSearch: "moderate",
    maxResults: fetchCount,
  });

  const channelIds = (search.data.items ?? [])
    .map((item) => item.id?.channelId ?? item.snippet?.channelId)
    .filter((id): id is string => Boolean(id));

  const details = await fetchChannelDetailsByIds(client, channelIds);

  const channels: YoutubeSearchChannel[] = [];
  for (const channelId of channelIds) {
    if (channels.length >= maxResults) break;

    const detail = details.get(channelId);
    if (!detail || detail.subscriberCount < MIN_SUBSCRIBER_COUNT) {
      continue;
    }

    channels.push({
      channelId,
      title: detail.title,
      thumbnailUrl: detail.thumbnailUrl,
      subscriberCount: detail.subscriberCount,
    });
  }

  return channels;
}

export async function searchYoutube(input: {
  query: string;
  maxVideos?: number;
  maxChannels?: number;
}): Promise<YoutubeSearchResult> {
  const query = input.query.trim();
  if (!query) return { videos: [], channels: [] };

  const client = createYoutubeClient();
  if (!client) return { videos: [], channels: [] };

  const maxVideos = Math.min(
    Math.max(input.maxVideos ?? DEFAULT_VIDEO_LIMIT, 0),
    50,
  );
  const maxChannels = Math.min(
    Math.max(input.maxChannels ?? DEFAULT_CHANNEL_LIMIT, 0),
    50,
  );

  const [videos, channels] = await Promise.all([
    maxVideos > 0
      ? searchVideos(client, query, maxVideos).catch((error) => {
          console.error("YouTube video search failed:", error);
          return [] as RecommendedVideo[];
        })
      : Promise.resolve([] as RecommendedVideo[]),
    maxChannels > 0
      ? searchChannels(client, query, maxChannels).catch((error) => {
          console.error("YouTube channel search failed:", error);
          return [] as YoutubeSearchChannel[];
        })
      : Promise.resolve([] as YoutubeSearchChannel[]),
  ]);

  return { videos, channels };
}

/** @deprecated Prefer searchYoutube — kept for callers that only need videos. */
export async function searchYoutubeVideos(input: {
  query: string;
  maxResults?: number;
}): Promise<RecommendedVideo[]> {
  const result = await searchYoutube({
    query: input.query,
    maxVideos: input.maxResults,
    maxChannels: 0,
  });
  return result.videos;
}
