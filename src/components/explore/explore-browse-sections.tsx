import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { VideoCard } from "@/components/video/video-card";
import { ChannelResultCard } from "@/components/explore/channel-result-card";
import { formatSubscriberCount } from "@/components/explore/format-subscriber-count";
import { SectionHeader } from "@/components/explore/section-header";
import { cn } from "@/lib/utils";
import type { RecommendedVideo } from "@/lib/recommended-videos";
import type {
  ExploreFilterId,
  ExploreTrendingVideo,
} from "@/lib/explore-content";
import type { YoutubeSearchChannel } from "@/lib/youtube/search";

type ExploreBrowseSectionsProps = {
  filterOptions: ExploreFilterId[];
  selectedFilterId: ExploreFilterId;
  onSelectFilter: (filterId: ExploreFilterId) => void;
  trendingVideos: ExploreTrendingVideo[];
  trendingViewAllHref: string;
  recommendedVideos: RecommendedVideo[];
  channels: YoutubeSearchChannel[];
  labels: {
    browseByCategory: string;
    categoryLabel: (filterId: ExploreFilterId) => string;
    scrollCategories: string;
    scrollChannelsLeft: string;
    scrollChannelsRight: string;
    trending: string;
    recommended: string;
    channels: string;
    viewAll: string;
    emptyFilter: string;
    subscriberCount: (count: string) => string;
  };
};

const CHANNEL_SCROLL_STEP = 320;

export function ExploreBrowseSections({
  filterOptions,
  selectedFilterId,
  onSelectFilter,
  trendingVideos,
  trendingViewAllHref,
  recommendedVideos,
  channels,
  labels,
}: ExploreBrowseSectionsProps) {
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const channelsScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollChannelsLeft, setCanScrollChannelsLeft] = useState(false);
  const [canScrollChannelsRight, setCanScrollChannelsRight] = useState(false);
  const showEmptyTrending = trendingVideos.length === 0;
  const showEmptyRecommended = recommendedVideos.length === 0;
  const showEmptyChannels = channels.length === 0;

  function updateChannelsScrollState() {
    const el = channelsScrollRef.current;
    if (!el) return;

    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setCanScrollChannelsLeft(el.scrollLeft > 1);
    setCanScrollChannelsRight(el.scrollLeft < maxScrollLeft - 1);
  }

  useEffect(() => {
    const el = channelsScrollRef.current;
    if (!el || showEmptyChannels) {
      setCanScrollChannelsLeft(false);
      setCanScrollChannelsRight(false);
      return;
    }

    updateChannelsScrollState();

    const onScroll = () => updateChannelsScrollState();
    el.addEventListener("scroll", onScroll, { passive: true });

    const resizeObserver = new ResizeObserver(() => updateChannelsScrollState());
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener("scroll", onScroll);
      resizeObserver.disconnect();
    };
  }, [channels, showEmptyChannels]);

  function scrollCategories() {
    categoryScrollRef.current?.scrollBy({ left: 200, behavior: "smooth" });
  }

  function scrollChannels(direction: "left" | "right") {
    const delta = direction === "left" ? -CHANNEL_SCROLL_STEP : CHANNEL_SCROLL_STEP;
    channelsScrollRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  }

  return (
    <>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          {labels.browseByCategory}
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
                  onClick={() => onSelectFilter(filterId)}
                  className={cn(
                    "shrink-0 rounded-xl border px-4 py-2 text-sm font-medium transition-colors",
                    isSelected
                      ? "border-transparent bg-accent text-black"
                      : "border-white/10 bg-transparent text-muted-foreground hover:border-white/20 hover:text-foreground",
                  )}
                >
                  {labels.categoryLabel(filterId)}
                </button>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center gap-2 self-start pt-0.5">
            <div className="h-6 w-px bg-white/10" aria-hidden="true" />
            <button
              type="button"
              onClick={scrollCategories}
              aria-label={labels.scrollCategories}
              className="flex size-9 items-center justify-center rounded-xl border border-white/10 text-muted-foreground transition-colors hover:border-white/20 hover:text-foreground"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </section>

      <section>
        <SectionHeader
          title={labels.trending}
          actionLabel={labels.viewAll}
          href={showEmptyTrending ? undefined : trendingViewAllHref}
        />
        {showEmptyTrending ? (
          <p className="py-6 text-sm text-muted-foreground">
            {labels.emptyFilter}
          </p>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {trendingVideos.map((video) => (
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
          title={labels.recommended}
          actionLabel={labels.viewAll}
          href={showEmptyRecommended ? undefined : "/explore/recommended"}
        />
        {showEmptyRecommended ? (
          <p className="py-6 text-sm text-muted-foreground">
            {labels.emptyFilter}
          </p>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {recommendedVideos.map((video) => (
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

      {!showEmptyChannels ? (
        <section>
          <SectionHeader
            title={labels.channels}
            actionLabel={labels.viewAll}
            href="/explore/channels"
          />
          <div className="relative">
            <div
              ref={channelsScrollRef}
              className={cn(
                "flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                canScrollChannelsLeft && "ps-12",
                canScrollChannelsRight && "pe-12",
              )}
            >
              {channels.map((channel) => (
                <div
                  key={channel.channelId}
                  className="w-[17rem] shrink-0 sm:w-[18.5rem]"
                >
                  <ChannelResultCard
                    channel={channel}
                    subscriberLabel={labels.subscriberCount(
                      formatSubscriberCount(channel.subscriberCount),
                    )}
                  />
                </div>
              ))}
            </div>

            {canScrollChannelsLeft ? (
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center bg-gradient-to-r from-background via-background/90 to-transparent pr-8">
                <button
                  type="button"
                  onClick={() => scrollChannels("left")}
                  aria-label={labels.scrollChannelsLeft}
                  className="pointer-events-auto flex size-9 items-center justify-center rounded-xl border border-white/10 bg-background text-muted-foreground transition-colors hover:border-white/20 hover:text-foreground"
                >
                  <ChevronLeft className="size-4" />
                </button>
              </div>
            ) : null}

            {canScrollChannelsRight ? (
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center bg-gradient-to-l from-background via-background/90 to-transparent pl-8">
                <button
                  type="button"
                  onClick={() => scrollChannels("right")}
                  aria-label={labels.scrollChannelsRight}
                  className="pointer-events-auto flex size-9 items-center justify-center rounded-xl border border-white/10 bg-background text-muted-foreground transition-colors hover:border-white/20 hover:text-foreground"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
    </>
  );
}
