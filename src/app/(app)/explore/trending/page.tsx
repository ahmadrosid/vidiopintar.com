import { ExploreTrendingContent } from "@/components/explore/explore-trending-content";
import {
  DEFAULT_EXPLORE_FILTER_ID,
  EXPLORE_CATEGORIES,
  type ExploreFilterId,
} from "@/lib/explore-content";
import { buildPageMetadata } from "@/lib/geo/metadata";
import { getExplorePageData } from "@/lib/youtube/explore";

export const metadata = buildPageMetadata({
  title: "Trending videos",
  description: "Browse all trending videos on Vidiopintar.",
  path: "/explore/trending",
  noIndex: true,
});

function parseFilterId(value: string | undefined): ExploreFilterId {
  if (value === "all") return "all";
  const category = EXPLORE_CATEGORIES.find((item) => item.id === value);
  return category?.id ?? DEFAULT_EXPLORE_FILTER_ID;
}

type ExploreTrendingPageProps = {
  searchParams: Promise<{ category?: string }>;
};

export default async function ExploreTrendingPage({
  searchParams,
}: ExploreTrendingPageProps) {
  const [{ category }, explore] = await Promise.all([
    searchParams,
    getExplorePageData(),
  ]);

  return (
    <div className="w-full space-y-8 px-4 pb-12 pt-4 md:px-8 md:pt-6">
      <ExploreTrendingContent
        trendingVideos={explore.trendingVideos}
        defaultFilterId={parseFilterId(category)}
      />
    </div>
  );
}
