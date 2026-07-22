import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/index";
import { userVideos } from "@/lib/db/schema/videos";
import { getRecommendedVideosForUser } from "@/lib/recommendations/get-recommended-videos";
import { getChannelsFromVideoIds } from "@/lib/youtube/channels-from-videos";
import { getExplorePageData } from "@/lib/youtube/explore";
import type { YoutubeSearchChannel } from "@/lib/youtube/search";

const WATCHED_CHANNEL_SOURCE_LIMIT = 20;

async function getRecentWatchedYoutubeIds(userId: string): Promise<string[]> {
  const rows = await db
    .select({ youtubeId: userVideos.youtubeId })
    .from(userVideos)
    .where(eq(userVideos.userId, userId))
    .orderBy(desc(userVideos.createdAt))
    .limit(WATCHED_CHANNEL_SOURCE_LIMIT);

  return rows.map((row) => row.youtubeId);
}

/** Channels derived from watched + recommended + trending videos. */
export async function getExploreChannelsForUser(
  userId: string,
): Promise<YoutubeSearchChannel[]> {
  const [explore, recommendedVideos, watchedYoutubeIds] = await Promise.all([
    getExplorePageData(),
    getRecommendedVideosForUser(userId),
    getRecentWatchedYoutubeIds(userId),
  ]);

  const channelSourceIds = [
    ...watchedYoutubeIds,
    ...recommendedVideos.map((video) => video.youtubeId),
    ...explore.trendingVideos.map((video) => video.youtubeId),
  ];

  return getChannelsFromVideoIds(channelSourceIds);
}
