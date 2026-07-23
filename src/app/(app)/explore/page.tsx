import { Suspense } from "react";
import { desc, eq } from "drizzle-orm";
import { ExploreContent } from "@/components/explore/explore-content";
import { ExplorePageSkeleton } from "@/components/explore/explore-page-skeleton";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db/index";
import { userVideos } from "@/lib/db/schema/videos";
import { buildPageMetadata } from "@/lib/geo/metadata";
import { getRecommendedVideosForUser } from "@/lib/recommendations/get-recommended-videos";
import { getChannelsFromVideoIds } from "@/lib/youtube/channels-from-videos";
import { getExplorePageData } from "@/lib/youtube/explore";

export const metadata = buildPageMetadata({
  title: "Explore",
  description: "Explore learning content on Vidiopintar.",
  path: "/explore",
  noIndex: true,
});

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

async function ExplorePageContent() {
  const user = await getCurrentUser();
  const [explore, recommendedVideos, watchedYoutubeIds] = await Promise.all([
    getExplorePageData(),
    getRecommendedVideosForUser(user.id),
    getRecentWatchedYoutubeIds(user.id),
  ]);

  const channels = await getChannelsFromVideoIds([
    ...watchedYoutubeIds,
    ...recommendedVideos.map((video) => video.youtubeId),
    ...explore.trendingVideos.map((video) => video.youtubeId),
  ]);

  return (
    <ExploreContent
      trendingVideos={explore.trendingVideos}
      recommendedVideos={recommendedVideos}
      channels={channels}
      defaultFilterId={explore.defaultFilterId}
    />
  );
}

export default function ExplorePage() {
  return (
    <div className="w-full space-y-8 px-4 pb-12 pt-4 md:px-8 md:pt-6">
      <Suspense fallback={<ExplorePageSkeleton />}>
        <ExplorePageContent />
      </Suspense>
    </div>
  );
}
