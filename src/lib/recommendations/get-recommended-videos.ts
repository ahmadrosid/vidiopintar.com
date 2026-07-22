import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/index";
import { userVideos, videos } from "@/lib/db/schema/videos";
import { RecommendationRepository } from "@/lib/db/repository/recommendations";
import {
  RECOMMENDED_VIDEOS,
  type RecommendedVideo,
} from "@/lib/recommended-videos";
import { generateRecommendationSearchQueries } from "@/lib/recommendations/generate-queries";
import { getRecommendationPeriodKey } from "@/lib/recommendations/period";
import { searchRecommendedVideos } from "@/lib/recommendations/search-youtube";

const RECENT_WATCHED_LIMIT = 10;
const RECOMMENDATION_LIMIT = 12;

async function getRecentWatchedVideos(userId: string) {
  return db
    .select({
      youtubeId: userVideos.youtubeId,
      title: videos.title,
      description: videos.description,
      channelTitle: videos.channelTitle,
    })
    .from(userVideos)
    .innerJoin(videos, eq(userVideos.youtubeId, videos.youtubeId))
    .where(eq(userVideos.userId, userId))
    .orderBy(desc(userVideos.createdAt))
    .limit(RECENT_WATCHED_LIMIT);
}

async function generateAndStoreRecommendations(input: {
  userId: string;
  periodKey: string;
}): Promise<RecommendedVideo[]> {
  const watched = await getRecentWatchedVideos(input.userId);

  if (watched.length === 0) {
    await RecommendationRepository.upsertForPeriod({
      userId: input.userId,
      periodKey: input.periodKey,
      videos: RECOMMENDED_VIDEOS,
      searchQueries: [],
    });
    return RECOMMENDED_VIDEOS;
  }

  let queries: string[] = [];
  try {
    queries = await generateRecommendationSearchQueries({
      userId: input.userId,
      videos: watched.map((video) => ({
        title: video.title,
        description: video.description,
        channelTitle: video.channelTitle,
      })),
    });
  } catch (error) {
    console.error("Failed to generate recommendation search queries:", error);
  }

  if (queries.length === 0) {
    await RecommendationRepository.upsertForPeriod({
      userId: input.userId,
      periodKey: input.periodKey,
      videos: RECOMMENDED_VIDEOS,
      searchQueries: [],
    });
    return RECOMMENDED_VIDEOS;
  }

  const excludeYoutubeIds = new Set(watched.map((video) => video.youtubeId));
  const videosFromSearch = await searchRecommendedVideos({
    queries,
    excludeYoutubeIds,
    limit: RECOMMENDATION_LIMIT,
  });

  const finalVideos =
    videosFromSearch.length > 0 ? videosFromSearch : RECOMMENDED_VIDEOS;

  await RecommendationRepository.upsertForPeriod({
    userId: input.userId,
    periodKey: input.periodKey,
    videos: finalVideos,
    searchQueries: queries,
  });

  return finalVideos;
}

/**
 * On-demand personalized recommendations.
 * Cached once per day; cache key resets at 08:00 Asia/Jakarta.
 */
export async function getRecommendedVideosForUser(
  userId: string,
): Promise<RecommendedVideo[]> {
  const periodKey = getRecommendationPeriodKey();

  const cached = await RecommendationRepository.getByUserAndPeriod(
    userId,
    periodKey,
  );
  if (cached) {
    return cached.videos;
  }

  try {
    return await generateAndStoreRecommendations({ userId, periodKey });
  } catch (error) {
    console.error("Failed to generate recommended videos:", error);
    return RECOMMENDED_VIDEOS;
  }
}
