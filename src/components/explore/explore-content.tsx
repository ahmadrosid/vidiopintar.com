"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronRight, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { VideoCard } from "@/components/video/video-card";
import { cn } from "@/lib/utils";
import { RECOMMENDED_VIDEOS } from "@/lib/recommended-videos";
import {
  DEFAULT_EXPLORE_FILTER_ID,
  EXPLORE_CATEGORIES,
  EXPLORE_TRENDING_VIDEOS,
  type ExploreCategory,
  type ExploreFilterId,
  type ExploreTrendingVideo,
} from "@/lib/explore-content";

function SectionHeader({
  title,
  actionLabel,
}: {
  title: string;
  actionLabel: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-xl font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      <button
        type="button"
        disabled
        aria-disabled="true"
        className="cursor-not-allowed text-sm font-medium text-muted-foreground opacity-70"
      >
        {actionLabel}
      </button>
    </div>
  );
}

type ExploreContentProps = {
  categories?: ExploreCategory[];
  trendingVideos?: ExploreTrendingVideo[];
  defaultFilterId?: ExploreFilterId;
};

export function ExploreContent({
  categories = EXPLORE_CATEGORIES,
  trendingVideos = EXPLORE_TRENDING_VIDEOS,
  defaultFilterId = DEFAULT_EXPLORE_FILTER_ID,
}: ExploreContentProps) {
  const t = useTranslations("explore");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilterId, setSelectedFilterId] =
    useState<ExploreFilterId>(defaultFilterId);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const filterOptions = useMemo<ExploreFilterId[]>(
    () => ["all", ...categories.map((category) => category.id)],
    [categories]
  );

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredOptions = useMemo(() => {
    if (!normalizedQuery) return filterOptions;
    return filterOptions.filter((filterId) => {
      const name = t(`categories.${filterId}`).toLowerCase();
      return name.includes(normalizedQuery);
    });
  }, [filterOptions, normalizedQuery, t]);

  const filterStillVisible = filteredOptions.some(
    (filterId) => filterId === selectedFilterId
  );

  const filteredTrending = useMemo(() => {
    return trendingVideos.filter((video) => {
      const categoryName = t(`categories.${video.categoryId}`).toLowerCase();
      const haystack =
        `${video.title} ${video.channelTitle} ${categoryName}`.toLowerCase();
      const matchesSearch =
        !normalizedQuery || haystack.includes(normalizedQuery);
      if (!matchesSearch) return false;

      // With an active search that cleared category chips, show all text matches.
      // Otherwise keep the selected category filter.
      if (!normalizedQuery || filterStillVisible) {
        if (selectedFilterId === "all") return true;
        return video.categoryId === selectedFilterId;
      }
      return true;
    });
  }, [
    filterStillVisible,
    normalizedQuery,
    selectedFilterId,
    t,
    trendingVideos,
  ]);

  const showEmptyCategories = filteredOptions.length === 0;
  const showEmptyTrending = filteredTrending.length === 0;

  function scrollCategories() {
    categoryScrollRef.current?.scrollBy({ left: 200, behavior: "smooth" });
  }

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
          className="h-11 w-full rounded-xl border border-white/10 bg-card pl-10 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-accent/40"
        />
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          {t("browseByCategory")}
        </h2>
        {showEmptyCategories ? (
          <p className="text-sm text-muted-foreground">{t("emptyFilter")}</p>
        ) : (
          <div className="flex items-center gap-2">
            <div
              ref={categoryScrollRef}
              className="flex min-w-0 flex-1 gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {filteredOptions.map((filterId) => {
                const isSelected = selectedFilterId === filterId;

                return (
                  <button
                    key={filterId}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedFilterId(filterId)}
                    className={cn(
                      "shrink-0 rounded-xl border px-4 py-2 text-sm font-medium transition-colors",
                      isSelected
                        ? "border-transparent bg-accent text-black"
                        : "border-white/10 bg-transparent text-muted-foreground hover:border-white/20 hover:text-foreground"
                    )}
                  >
                    {t(`categories.${filterId}`)}
                  </button>
                );
              })}
            </div>

            <div className="flex shrink-0 items-center gap-2 self-start pt-0.5">
              <div className="h-6 w-px bg-white/10" aria-hidden="true" />
              <button
                type="button"
                onClick={scrollCategories}
                aria-label={t("scrollCategories")}
                className="flex size-9 items-center justify-center rounded-xl border border-white/10 text-muted-foreground transition-colors hover:border-white/20 hover:text-foreground"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}
      </section>

      <section>
        <SectionHeader title={t("trending")} actionLabel={t("viewAll")} />
        {showEmptyTrending ? (
          <p className="py-6 text-sm text-muted-foreground">{t("emptyFilter")}</p>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-1">
            {filteredTrending.map((video) => (
              <div
                key={video.youtubeId}
                className="w-[16.5rem] shrink-0 sm:w-[18rem]"
              >
                <VideoCard
                  youtubeId={video.youtubeId}
                  title={video.title}
                  channelTitle={video.channelTitle}
                  thumbnailUrl={video.thumbnailUrl}
                  duration={video.duration}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHeader title={t("recommended")} actionLabel={t("viewAll")} />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {RECOMMENDED_VIDEOS.map((video) => (
            <VideoCard
              key={video.youtubeId}
              youtubeId={video.youtubeId}
              title={video.title}
              channelTitle={video.channelTitle}
              thumbnailUrl={video.thumbnailUrl}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
