import { ExploreContent } from "@/components/explore/explore-content";
import { getCurrentUser } from "@/lib/auth";
import { buildPageMetadata } from "@/lib/geo/metadata";
import { getRecommendedVideosForUser } from "@/lib/recommendations/get-recommended-videos";
import { getExplorePageData } from "@/lib/youtube/explore";

export const metadata = buildPageMetadata({
  title: "Explore",
  description: "Explore learning content on Vidiopintar.",
  path: "/explore",
  noIndex: true,
});

export default async function ExplorePage() {
  const user = await getCurrentUser();
  const [explore, recommendedVideos] = await Promise.all([
    getExplorePageData(),
    getRecommendedVideosForUser(user.id),
  ]);

  return (
    <div className="w-full space-y-8 px-4 pb-12 pt-4 md:px-8 md:pt-6">
      <ExploreContent
        trendingVideos={explore.trendingVideos}
        recommendedVideos={recommendedVideos}
        defaultFilterId={explore.defaultFilterId}
      />
    </div>
  );
}
