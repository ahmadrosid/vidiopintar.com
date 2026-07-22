"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { VideoCard } from "@/components/video/video-card";
import { cn } from "@/lib/utils";
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
const SEARCH_DEBOUNCE_MS = 300;
const MIN_SEARCH_LENGTH = 2;

function formatSubscriberCount(count: number): string {
  if (count >= 1_000_000) {
    const value = count / 1_000_000;
    return `${value >= 10 ? Math.round(value) : value.toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (count >= 1_000) {
    const value = count / 1_000;
    return `${value >= 10 ? Math.round(value) : value.toFixed(1).replace(/\.0$/, "")}K`;
  }
  return String(count);
}

function SectionHeader({
  title,
  actionLabel,
  href,
}: {
  title: string;
  actionLabel: string;
  href?: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-xl font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      {href ? (
        <Link
          href={href}
          className="shrink-0 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {actionLabel}
        </Link>
      ) : (
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="cursor-not-allowed text-sm font-medium text-muted-foreground opacity-70"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function ChannelResultCard({
  channel,
  subscriberLabel,
}: {
  channel: YoutubeSearchChannel;
  subscriberLabel: string;
}) {
  return (
    <a
      href={`https://www.youtube.com/channel/${channel.channelId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-xl border border-white/10 bg-card p-3 transition-colors hover:border-white/20 hover:bg-card/80"
    >
      <div className="relative size-12 shrink-0 overflow-hidden rounded-full bg-muted">
        {channel.thumbnailUrl ? (
          // Channel avatars are hosted on ggpht CDN domains not in next/image config.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={channel.thumbnailUrl}
            alt={channel.title}
            className="size-full object-cover"
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {channel.title}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {subscriberLabel}
        </p>
      </div>
    </a>
  );
}

type ExploreContentProps = {
  categories?: ExploreCategory[];
  trendingVideos?: ExploreTrendingVideo[];
  recommendedVideos?: RecommendedVideo[];
  defaultFilterId?: ExploreFilterId;
};

export function ExploreContent({
  categories = EXPLORE_CATEGORIES,
  trendingVideos = EXPLORE_TRENDING_VIDEOS,
  recommendedVideos = RECOMMENDED_VIDEOS,
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
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const filterOptions = useMemo<ExploreFilterId[]>(
    () => ["all", ...categories.map((category) => category.id)],
    [categories]
  );

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const isSearching = normalizedQuery.length >= MIN_SEARCH_LENGTH;

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < MIN_SEARCH_LENGTH) {
      abortRef.current?.abort();
      setSearchVideos([]);
      setSearchChannels([]);
      setSearchLoading(false);
      setSearchError(null);
      return;
    }

    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;

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
        if (controller.signal.aborted) return;
        setSearchVideos(data.videos ?? []);
        setSearchChannels(data.channels ?? []);
      } catch {
        if (controller.signal.aborted) return;
        setSearchVideos([]);
        setSearchChannels([]);
        setSearchError(t("searchError"));
      } finally {
        // Only clear loading for the latest in-flight request.
        if (abortRef.current === controller) {
          setSearchLoading(false);
        }
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery, t]);

  const filteredTrending = useMemo(() => {
    return trendingVideos.filter((video) => {
      if (selectedFilterId === "all") return true;
      return video.categoryId === selectedFilterId;
    });
  }, [selectedFilterId, trendingVideos]);

  const trendingPreview = useMemo(
    () => filteredTrending.slice(0, TRENDING_PREVIEW_COUNT),
    [filteredTrending],
  );

  const trendingViewAllHref =
    selectedFilterId === "all"
      ? "/explore/trending"
      : `/explore/trending?category=${selectedFilterId}`;

  const recommendedPreview = useMemo(
    () => recommendedVideos.slice(0, RECOMMENDED_PREVIEW_COUNT),
    [recommendedVideos],
  );

  const showEmptyTrending = filteredTrending.length === 0;
  const showEmptyRecommended = recommendedVideos.length === 0;
  const showEmptySearch =
    searchVideos.length === 0 && searchChannels.length === 0;

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

      {isSearching ? (
        searchLoading ? (
          <LoadingSpinner
            text={t("searching")}
            className="py-6 text-sm text-muted-foreground"
          />
        ) : searchError ? (
          <p className="py-6 text-sm text-muted-foreground">{searchError}</p>
        ) : showEmptySearch ? (
          <p className="py-6 text-sm text-muted-foreground">{t("emptySearch")}</p>
        ) : (
          <div className="space-y-8">
            <section>
              <h2 className="mb-4 text-xl font-semibold tracking-tight text-foreground">
                {t("searchVideos")}
              </h2>
              {searchVideos.length === 0 ? (
                <p className="py-6 text-sm text-muted-foreground">
                  {t("emptySearchVideos")}
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {searchVideos.map((video) => (
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
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold tracking-tight text-foreground">
                {t("searchChannels")}
              </h2>
              {searchChannels.length === 0 ? (
                <p className="py-6 text-sm text-muted-foreground">
                  {t("emptySearchChannels")}
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {searchChannels.map((channel) => (
                    <ChannelResultCard
                      key={channel.channelId}
                      channel={channel}
                      subscriberLabel={t("subscriberCount", {
                        count: formatSubscriberCount(channel.subscriberCount),
                      })}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )
      ) : (
        <>
          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {t("browseByCategory")}
            </h2>
            <div className="flex items-center gap-2">
              <div
                ref={categoryScrollRef}
                className="flex min-w-0 flex-1 gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
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
          </section>

          <section>
            <SectionHeader
              title={t("trending")}
              actionLabel={t("viewAll")}
              href={showEmptyTrending ? undefined : trendingViewAllHref}
            />
            {showEmptyTrending ? (
              <p className="py-6 text-sm text-muted-foreground">
                {t("emptyFilter")}
              </p>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {trendingPreview.map((video) => (
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
            <SectionHeader
              title={t("recommended")}
              actionLabel={t("viewAll")}
              href={showEmptyRecommended ? undefined : "/explore/recommended"}
            />
            {showEmptyRecommended ? (
              <p className="py-6 text-sm text-muted-foreground">
                {t("emptyFilter")}
              </p>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {recommendedPreview.map((video) => (
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
        </>
      )}
    </div>
  );
}
