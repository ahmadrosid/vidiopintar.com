import { createYoutubeClient, type YoutubeClient } from "@/lib/youtube/client";
import type { RecommendedVideo } from "@/lib/recommended-videos";

const RESULTS_PER_QUERY = 6;
const MIN_DURATION_SECONDS = 180;

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

async function searchQuery(
  client: YoutubeClient,
  query: string,
): Promise<RecommendedVideo[]> {
  const search = await client.search.list({
    part: ["snippet"],
    q: query,
    type: ["video"],
    order: "relevance",
    relevanceLanguage: "en",
    safeSearch: "moderate",
    videoDuration: "medium",
    maxResults: RESULTS_PER_QUERY,
  });

  const items = (search.data.items ?? []).filter(
    (item) => item.id?.videoId && item.snippet?.title,
  );
  const ids = items.map((item) => item.id!.videoId!);
  const durations = await fetchDurationsByIds(client, ids);

  return items.flatMap((item) => {
    const youtubeId = item.id!.videoId!;
    const seconds = durations.get(youtubeId);
    if (seconds !== undefined && seconds < MIN_DURATION_SECONDS) {
      return [];
    }

    return [
      {
        youtubeId,
        title: item.snippet?.title ?? "Untitled",
        channelTitle: item.snippet?.channelTitle ?? "Unknown Channel",
        thumbnailUrl: pickThumbnail(item.snippet?.thumbnails),
        duration:
          seconds === undefined ? undefined : formatDurationSeconds(seconds),
      } satisfies RecommendedVideo,
    ];
  });
}

export async function searchRecommendedVideos(input: {
  queries: string[];
  excludeYoutubeIds: Set<string>;
  limit: number;
}): Promise<RecommendedVideo[]> {
  const client = createYoutubeClient();
  if (!client) return [];

  const batches = await Promise.all(
    input.queries.map(async (query) => {
      try {
        return await searchQuery(client, query);
      } catch (error) {
        console.error(
          `Recommendation YouTube search failed for "${query}":`,
          error,
        );
        return [] as RecommendedVideo[];
      }
    }),
  );

  const seen = new Set(input.excludeYoutubeIds);
  const videos: RecommendedVideo[] = [];

  for (const batch of batches) {
    for (const video of batch) {
      if (seen.has(video.youtubeId)) continue;
      seen.add(video.youtubeId);
      videos.push(video);
      if (videos.length >= input.limit) return videos;
    }
  }

  return videos;
}
