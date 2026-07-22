import { ExploreContent } from "@/components/explore/explore-content";
import { buildPageMetadata } from "@/lib/geo/metadata";
import { getExplorePageData } from "@/lib/youtube/explore";

export const metadata = buildPageMetadata({
  title: "Explore",
  description: "Explore learning content on Vidiopintar.",
  path: "/explore",
  noIndex: true,
});

export default async function ExplorePage() {
  const explore = await getExplorePageData();

  return (
    <div className="w-full space-y-8 px-4 pb-12 pt-4 md:px-8 md:pt-6">
      <ExploreContent
        trendingVideos={explore.trendingVideos}
        defaultFilterId={explore.defaultFilterId}
      />
    </div>
  );
}
