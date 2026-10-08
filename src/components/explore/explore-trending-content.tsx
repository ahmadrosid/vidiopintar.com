"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ExploreBackHeader } from "@/components/explore/explore-back-header";
import { VideoCard } from "@/components/video/video-card";
import { cn } from "@/lib/utils";
import {
  DEFAULT_EXPLORE_FILTER_ID,
  EXPLORE_CATEGORIES,
  type ExploreCategory,
  type ExploreFilterId,
  type ExploreTrendingVideo,
} from "@/lib/explore-content";

type ExploreTrendingContentProps = {
  categories?: ExploreCategory[];
  trendingVideos: ExploreTrendingVideo[];
  defaultFilterId?: ExploreFilterId;
};

export function ExploreTrendingContent({
  categories = EXPLORE_CATEGORIES,
  trendingVideos,
  defaultFilterId = DEFAULT_EXPLORE_FILTER_ID,
}: ExploreTrendingContentProps) {
  const t = useTranslations("explore");
  const [selectedFilterId, setSelectedFilterId] =
    useState<ExploreFilterId>(defaultFilterId);

  const filterOptions = useMemo<ExploreFilterId[]>(
    () => ["all", ...categories.map((category) => category.id)],
    [categories],
  );

  const filteredVideos = useMemo(() => {
    if (selectedFilterId === "all") return trendingVideos;
    return trendingVideos.filter(
      (video) => video.categoryId === selectedFilterId,
    );
  }, [selectedFilterId, trendingVideos]);

  return (
    <div className="w-full space-y-8">
      <ExploreBackHeader title={t("trending")} count={t("videoCount", { count: filteredVideos.length })} backLabel={t("backToExplore")} />

      <div className="flex flex-wrap gap-3">
        {filterOptions.map((filterId) => {
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
                  : "border-white/10 bg-transparent text-muted-foreground hover:border-white/20 hover:text-foreground",
              )}
            >
              {t(`categories.${filterId}`)}
            </button>
          );
        })}
      </div>

      {filteredVideos.length === 0 ? (
        <p className="py-6 text-sm text-muted-foreground">{t("emptyFilter")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredVideos.map((video) => (
            <VideoCard
              key={video.youtubeId}
              youtubeId={video.youtubeId}
              title={video.title}
              channelTitle={video.channelTitle}
              thumbnailUrl={video.thumbnailUrl}
              duration={video.duration}
            />
          ))}
        </div>
      )}
    </div>
  );
}
