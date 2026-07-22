import { createYoutubeClient, type YoutubeClient } from "@/lib/youtube/client";
import type { YoutubeSearchChannel } from "@/lib/youtube/search";

const MAX_VIDEO_IDS = 50;
const MAX_CHANNELS = 12;

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

async function fetchChannelIdsByVideoIds(
  client: YoutubeClient,
  youtubeIds: string[],
): Promise<string[]> {
  const uniqueIds = [...new Set(youtubeIds.filter(Boolean))].slice(
    0,
    MAX_VIDEO_IDS,
  );
  if (uniqueIds.length === 0) return [];

  const response = await client.videos.list({
    part: ["snippet"],
    id: uniqueIds,
    maxResults: uniqueIds.length,
  });

  const channelIds: string[] = [];
  const seen = new Set<string>();

  // Preserve input order: map videos back through uniqueIds order.
  const idToChannel = new Map<string, string>();
  for (const item of response.data.items ?? []) {
    const videoId = item.id;
    const channelId = item.snippet?.channelId;
    if (!videoId || !channelId) continue;
    idToChannel.set(videoId, channelId);
  }

  for (const videoId of uniqueIds) {
    const channelId = idToChannel.get(videoId);
    if (!channelId || seen.has(channelId)) continue;
    seen.add(channelId);
    channelIds.push(channelId);
  }

  return channelIds;
}

async function fetchChannelDetailsByIds(
  client: YoutubeClient,
  channelIds: string[],
): Promise<YoutubeSearchChannel[]> {
  const uniqueIds = [...new Set(channelIds.filter(Boolean))];
  if (uniqueIds.length === 0) return [];

  const response = await client.channels.list({
    part: ["snippet", "statistics"],
    id: uniqueIds,
    maxResults: uniqueIds.length,
  });

  const details = new Map<string, YoutubeSearchChannel>();
  for (const item of response.data.items ?? []) {
    if (!item.id) continue;
    const subscriberCount = Number(item.statistics?.subscriberCount ?? NaN);
    if (!Number.isFinite(subscriberCount)) continue;

    details.set(item.id, {
      channelId: item.id,
      title: item.snippet?.title ?? "Unknown Channel",
      thumbnailUrl: pickThumbnail(item.snippet?.thumbnails),
      subscriberCount,
    });
  }

  const channels: YoutubeSearchChannel[] = [];
  for (const channelId of uniqueIds) {
    if (channels.length >= MAX_CHANNELS) break;
    const channel = details.get(channelId);
    if (!channel) continue;
    channels.push(channel);
  }

  return channels;
}

/**
 * Resolve unique YouTube channels from a list of video IDs.
 * Order of youtubeIds is preserved for channel ranking (first wins).
 */
export async function getChannelsFromVideoIds(
  youtubeIds: string[],
): Promise<YoutubeSearchChannel[]> {
  if (youtubeIds.length === 0) return [];

  const client = createYoutubeClient();
  if (!client) return [];

  try {
    const channelIds = await fetchChannelIdsByVideoIds(client, youtubeIds);
    if (channelIds.length === 0) return [];
    return await fetchChannelDetailsByIds(client, channelIds);
  } catch (error) {
    console.error("Failed to resolve channels from videos:", error);
    return [];
  }
}
