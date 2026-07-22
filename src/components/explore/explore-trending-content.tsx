"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
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
      <div className="space-y-4">
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {t("backToExplore")}
        </Link>

        <header className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            {t("trending")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("videoCount", { count: filteredVideos.length })}
          </p>
        </header>
      </div>

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
