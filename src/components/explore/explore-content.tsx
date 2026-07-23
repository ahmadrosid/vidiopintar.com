"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { ExploreBrowseSections } from "@/components/explore/explore-browse-sections";
import { ExploreSearchResults } from "@/components/explore/explore-search-results";
import {
  RECOMMENDED_VIDEOS,
  type RecommendedVideo,
} from "@/lib/recommended-videos";
import {
  DEFAULT_EXPLORE_FILTER_ID,
  EXPLORE_CATEGORIES,
  EXPLORE_TRENDING_VIDEOS,
  type ExploreCategory,
  type ExploreFilterId,
  type ExploreTrendingVideo,
} from "@/lib/explore-content";
import type { YoutubeSearchChannel } from "@/lib/youtube/search";

const TRENDING_PREVIEW_COUNT = 8;
const RECOMMENDED_PREVIEW_COUNT = 8;
const CHANNELS_PREVIEW_COUNT = 8;
const SEARCH_DEBOUNCE_MS = 300;
const MIN_SEARCH_LENGTH = 2;
const EMPTY_CHANNELS: YoutubeSearchChannel[] = [];

type ExploreContentProps = {
  categories?: ExploreCategory[];
  trendingVideos?: ExploreTrendingVideo[];
  recommendedVideos?: RecommendedVideo[];
  channels?: YoutubeSearchChannel[];
  defaultFilterId?: ExploreFilterId;
};

export function ExploreContent({
  categories = EXPLORE_CATEGORIES,
  trendingVideos = EXPLORE_TRENDING_VIDEOS,
  recommendedVideos = RECOMMENDED_VIDEOS,
  channels = EMPTY_CHANNELS,
  defaultFilterId = DEFAULT_EXPLORE_FILTER_ID,
}: ExploreContentProps) {
  const t = useTranslations("explore");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilterId, setSelectedFilterId] =
    useState<ExploreFilterId>(defaultFilterId);
  const [searchVideos, setSearchVideos] = useState<RecommendedVideo[]>([]);
  const [searchChannels, setSearchChannels] = useState<YoutubeSearchChannel[]>(
    [],
  );
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const filterOptions = useMemo<ExploreFilterId[]>(
    () => ["all", ...categories.map((category) => category.id)],
    [categories],
  );

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const isSearching = normalizedQuery.length >= MIN_SEARCH_LENGTH;

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < MIN_SEARCH_LENGTH) {
      setSearchVideos([]);
      setSearchChannels([]);
      setSearchLoading(false);
      setSearchError(null);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      setSearchLoading(true);
      setSearchError(null);
      try {
        const res = await fetch(
          `/api/youtube/search?q=${encodeURIComponent(q)}`,
          { signal: controller.signal },
        );
        if (!res.ok) {
          throw new Error(`youtube_search_failed_${res.status}`);
        }
        const data = (await res.json()) as {
          videos?: RecommendedVideo[];
          channels?: YoutubeSearchChannel[];
        };
        if (!isMounted) return;
        setSearchVideos(data.videos ?? []);
        setSearchChannels(data.channels ?? []);
      } catch {
        if (!isMounted) return;
        setSearchVideos([]);
        setSearchChannels([]);
        setSearchError(t("searchError"));
      } finally {
        if (isMounted) {
          setSearchLoading(false);
        }
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      isMounted = false;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery, t]);

  const trendingPreview = useMemo(() => {
    const filtered =
      selectedFilterId === "all"
        ? trendingVideos
        : trendingVideos.filter(
            (video) => video.categoryId === selectedFilterId,
          );
    return filtered.slice(0, TRENDING_PREVIEW_COUNT);
  }, [selectedFilterId, trendingVideos]);

  const trendingViewAllHref =
    selectedFilterId === "all"
      ? "/explore/trending"
      : `/explore/trending?category=${selectedFilterId}`;

  const recommendedPreview = useMemo(
    () => recommendedVideos.slice(0, RECOMMENDED_PREVIEW_COUNT),
    [recommendedVideos],
  );

  const channelsPreview = useMemo(
    () => channels.slice(0, CHANNELS_PREVIEW_COUNT),
    [channels],
  );

  return (
    <div className="w-full space-y-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground md:text-base">
          {t("subtitle")}
        </p>
      </header>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchPlaceholder")}
          className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-accent/40"
        />
      </div>

      {isSearching ? (
        <ExploreSearchResults
          loading={searchLoading}
          error={searchError}
          videos={searchVideos}
          channels={searchChannels}
          labels={{
            searching: t("searching"),
            emptySearch: t("emptySearch"),
            searchVideos: t("searchVideos"),
            emptySearchVideos: t("emptySearchVideos"),
            searchChannels: t("searchChannels"),
            emptySearchChannels: t("emptySearchChannels"),
            subscriberCount: (count) => t("subscriberCount", { count }),
          }}
        />
      ) : (
        <ExploreBrowseSections
          filterOptions={filterOptions}
          selectedFilterId={selectedFilterId}
          onSelectFilter={setSelectedFilterId}
          trendingVideos={trendingPreview}
          trendingViewAllHref={trendingViewAllHref}
          recommendedVideos={recommendedPreview}
          channels={channelsPreview}
          labels={{
            browseByCategory: t("browseByCategory"),
            categoryLabel: (filterId) => t(`categories.${filterId}`),
            scrollCategories: t("scrollCategories"),
            scrollChannelsLeft: t("scrollChannelsLeft"),
            scrollChannelsRight: t("scrollChannelsRight"),
            trending: t("trending"),
            recommended: t("recommended"),
            channels: t("channels"),
            viewAll: t("viewAll"),
            emptyFilter: t("emptyFilter"),
            subscriberCount: (count) => t("subscriberCount", { count }),
          }}
        />
      )}
    </div>
  );
}
