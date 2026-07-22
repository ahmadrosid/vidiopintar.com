import { ExploreRecommendedContent } from "@/components/explore/explore-recommended-content";
import { getCurrentUser } from "@/lib/auth";
import { buildPageMetadata } from "@/lib/geo/metadata";
import { getRecommendedVideosForUser } from "@/lib/recommendations/get-recommended-videos";

export const metadata = buildPageMetadata({
  title: "Recommended videos",
  description: "Browse all recommended videos on Vidiopintar.",
  path: "/explore/recommended",
  noIndex: true,
});

export default async function ExploreRecommendedPage() {
  const user = await getCurrentUser();
  const recommendedVideos = await getRecommendedVideosForUser(user.id);

  return (
    <div className="w-full space-y-8 px-4 pb-12 pt-4 md:px-8 md:pt-6">
      <ExploreRecommendedContent recommendedVideos={recommendedVideos} />
    </div>
  );
}
