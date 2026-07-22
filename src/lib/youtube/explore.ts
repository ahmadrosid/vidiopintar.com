import { unstable_cache } from "next/cache";
import {
  DEFAULT_EXPLORE_FILTER_ID,
  EXPLORE_CATEGORIES,
  EXPLORE_TRENDING_VIDEOS,
  type ExploreCategoryId,
  type ExploreFilterId,
  type ExploreTrendingVideo,
} from "@/lib/explore-content";
import { createYoutubeClient, type YoutubeClient } from "@/lib/youtube/client";

type CategoryFetchConfig =
  | { mode: "popular"; videoCategoryId: string }
  | { mode: "search"; query: string };

const CATEGORY_FETCH: Record<ExploreCategoryId, CategoryFetchConfig> = {
  technology: { mode: "popular", videoCategoryId: "28" },
  business: { mode: "search", query: "business entrepreneurship productivity" },
  programming: { mode: "search", query: "programming coding tutorial" },
  "ai-ml": { mode: "search", query: "artificial intelligence machine learning" },
  design: { mode: "search", query: "UI UX design tutorial" },
};

const MAX_PER_CATEGORY = 8;
/** Fetch extra candidates so Shorts filtering still leaves a full row. */
const FETCH_PER_CATEGORY = 20;
/** YouTube Shorts max length — exclude these from Trending. */
const MIN_TRENDING_DURATION_SECONDS = 180;
const REGION_CODE = "US";

export type ExplorePageData = {
  trendingVideos: ExploreTrendingVideo[];
  defaultFilterId: ExploreFilterId;
  source: "youtube" | "static";
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

function formatIso8601Duration(iso?: string | null): string | undefined {
  const totalSeconds = parseIso8601DurationSeconds(iso);
  if (totalSeconds === undefined) return undefined;
  return formatDurationSeconds(totalSeconds);
}

function isLongFormVideo(isoDuration?: string | null): boolean {
  const seconds = parseIso8601DurationSeconds(isoDuration);
  // Keep videos with unknown duration; drop known Shorts-length clips.
  if (seconds === undefined) return true;
  return seconds >= MIN_TRENDING_DURATION_SECONDS;
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

async function fetchVideoDetailsByIds(
  client: YoutubeClient,
  ids: string[],
): Promise<Map<string, { duration?: string; categoryId?: string }>> {
  const details = new Map<string, { duration?: string; categoryId?: string }>();
  if (ids.length === 0) return details;

  const response = await client.videos.list({
    part: ["contentDetails", "snippet"],
    id: ids,
    maxResults: ids.length,
  });

  for (const item of response.data.items ?? []) {
    if (!item.id) continue;
    details.set(item.id, {
      duration: formatIso8601Duration(item.contentDetails?.duration),
      categoryId: item.snippet?.categoryId ?? undefined,
    });
  }

  return details;
}

async function fetchPopularForCategory(
  client: YoutubeClient,
  categoryId: ExploreCategoryId,
  videoCategoryId: string,
): Promise<ExploreTrendingVideo[]> {
  const response = await client.videos.list({
    part: ["snippet", "contentDetails"],
    chart: "mostPopular",
    regionCode: REGION_CODE,
    videoCategoryId,
    maxResults: FETCH_PER_CATEGORY,
  });

  return (response.data.items ?? [])
    .filter(
      (item) =>
        Boolean(item.id && item.snippet?.title) &&
        isLongFormVideo(item.contentDetails?.duration),
    )
    .slice(0, MAX_PER_CATEGORY)
    .map((item) => ({
      youtubeId: item.id as string,
      title: item.snippet?.title ?? "Untitled",
      channelTitle: item.snippet?.channelTitle ?? "Unknown Channel",
      thumbnailUrl: pickThumbnail(item.snippet?.thumbnails),
      categoryId,
      duration: formatIso8601Duration(item.contentDetails?.duration),
    }));
}

async function fetchSearchForCategory(
  client: YoutubeClient,
  categoryId: ExploreCategoryId,
  query: string,
): Promise<ExploreTrendingVideo[]> {
  const search = await client.search.list({
    part: ["snippet"],
    q: query,
    type: ["video"],
    order: "relevance",
    relevanceLanguage: "en",
    safeSearch: "moderate",
    // YouTube API: "short" = <4 min (includes Shorts). Prefer medium+.
    videoDuration: "medium",
    maxResults: FETCH_PER_CATEGORY,
  });

  const items = (search.data.items ?? []).filter(
    (item) => item.id?.videoId && item.snippet?.title,
  );
  const ids = items.map((item) => item.id!.videoId!);
  const details = await fetchVideoDetailsByIds(client, ids);

  return items
    .slice(0, MAX_PER_CATEGORY)
    .map((item) => {
      const youtubeId = item.id!.videoId!;
      const detail = details.get(youtubeId);
      return {
        youtubeId,
        title: item.snippet?.title ?? "Untitled",
        channelTitle: item.snippet?.channelTitle ?? "Unknown Channel",
        thumbnailUrl: pickThumbnail(item.snippet?.thumbnails),
        categoryId,
        duration: detail?.duration,
      };
    });
}

async function fetchAllCategories(
  client: YoutubeClient,
): Promise<ExploreTrendingVideo[]> {
  const results = await Promise.all(
    EXPLORE_CATEGORIES.map(async (category) => {
      const config = CATEGORY_FETCH[category.id];
      try {
        if (config.mode === "popular") {
          return await fetchPopularForCategory(
            client,
            category.id,
            config.videoCategoryId,
          );
        }
        return await fetchSearchForCategory(client, category.id, config.query);
      } catch (error) {
        console.error(`Explore YouTube fetch failed for ${category.id}:`, error);
        return [] as ExploreTrendingVideo[];
      }
    }),
  );

  const seen = new Set<string>();
  const videos: ExploreTrendingVideo[] = [];
  for (const batch of results) {
    for (const video of batch) {
      if (seen.has(video.youtubeId)) continue;
      seen.add(video.youtubeId);
      videos.push(video);
    }
  }
  return videos;
}

function staticExploreData(): ExplorePageData {
  return {
    trendingVideos: EXPLORE_TRENDING_VIDEOS,
    defaultFilterId: DEFAULT_EXPLORE_FILTER_ID,
    source: "static",
  };
}

async function fetchExploreFromYoutube(): Promise<ExplorePageData> {
  const client = createYoutubeClient();
  if (!client) return staticExploreData();

  const trendingVideos = await fetchAllCategories(client);
  if (trendingVideos.length === 0) return staticExploreData();

  return {
    trendingVideos,
    defaultFilterId: DEFAULT_EXPLORE_FILTER_ID,
    source: "youtube",
  };
}

const getCachedExploreFromYoutube = unstable_cache(
  fetchExploreFromYoutube,
  ["explore-page-youtube-v2"],
  { revalidate: 3600 },
);

export async function getExplorePageData(): Promise<ExplorePageData> {
  if (!createYoutubeClient()) {
    return staticExploreData();
  }
  return getCachedExploreFromYoutube();
}
