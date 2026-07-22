"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  Brain,
  Briefcase,
  Code,
  Cpu,
  Palette,
  type Icon,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { VideoCard } from "@/components/video/video-card";
import { cn } from "@/lib/utils";
import { RECOMMENDED_VIDEOS } from "@/lib/recommended-videos";
import {
  DEFAULT_EXPLORE_CATEGORY_ID,
  EXPLORE_CATEGORIES,
  EXPLORE_TRENDING_VIDEOS,
  type ExploreCategoryIcon,
  type ExploreCategoryId,
} from "@/lib/explore-content";

const CATEGORY_ICONS: Record<ExploreCategoryIcon, Icon> = {
  cpu: Cpu,
  briefcase: Briefcase,
  code: Code,
  brain: Brain,
  palette: Palette,
};

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

export function ExploreContent() {
  const t = useTranslations("explore");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] =
    useState<ExploreCategoryId>(DEFAULT_EXPLORE_CATEGORY_ID);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredCategories = useMemo(() => {
    if (!normalizedQuery) return EXPLORE_CATEGORIES;
    return EXPLORE_CATEGORIES.filter((category) => {
      const name = t(`categories.${category.id}`).toLowerCase();
      const count = t(`categoryCounts.${category.id}`).toLowerCase();
      return name.includes(normalizedQuery) || count.includes(normalizedQuery);
    });
  }, [normalizedQuery, t]);

  const activeCategoryId = useMemo(() => {
    if (filteredCategories.some((category) => category.id === selectedCategoryId)) {
      return selectedCategoryId;
    }
    return filteredCategories[0]?.id ?? selectedCategoryId;
  }, [filteredCategories, selectedCategoryId]);

  const filteredTrending = useMemo(() => {
    return EXPLORE_TRENDING_VIDEOS.filter((video) => {
      const matchesCategory = video.categoryId === activeCategoryId;
      if (!matchesCategory) return false;
      if (!normalizedQuery) return true;
      const categoryName = t(`categories.${video.categoryId}`).toLowerCase();
      const haystack = `${video.title} ${video.channelTitle} ${categoryName}`;
      return haystack.includes(normalizedQuery);
    });
  }, [activeCategoryId, normalizedQuery, t]);

  const showEmptyFilter =
    filteredCategories.length === 0 && filteredTrending.length === 0;

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
        <div className="flex gap-3 overflow-x-auto pb-1">
          {filteredCategories.map((category) => {
            const Icon = CATEGORY_ICONS[category.icon];
            const isSelected = activeCategoryId === category.id;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategoryId(category.id)}
                className={cn(
                  "flex min-w-[11.5rem] shrink-0 items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                  isSelected
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-white/10 bg-card text-foreground hover:border-white/20 hover:bg-card/80"
                )}
              >
                <Icon
                  weight={isSelected ? "fill" : "regular"}
                  className="size-5 shrink-0"
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">
                    {t(`categories.${category.id}`)}
                  </span>
                  <span
                    className={cn(
                      "block truncate text-xs",
                      isSelected
                        ? "text-accent-foreground/80"
                        : "text-muted-foreground"
                    )}
                  >
                    {t(`categoryCounts.${category.id}`)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {showEmptyFilter ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {t("emptyFilter")}
        </p>
      ) : (
        <section>
          <SectionHeader title={t("trending")} actionLabel={t("viewAll")} />
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
        </section>
      )}

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
