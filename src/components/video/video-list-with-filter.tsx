"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { VideoList } from "@/components/video/video-list";
import { RecommendedVideos } from "@/components/video/recommended-videos";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

type Video = {
  userVideoId: number;
  youtubeId: string;
  title: string;
  channelTitle: string | null;
  publishedAt: Date | null;
  thumbnailUrl: string | null;
};

interface VideoListWithFilterProps {
  videos: Video[];
}

export function VideoListWithFilter({ videos }: VideoListWithFilterProps) {
  const t = useTranslations("video");
  const maxChannels = 7;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [showAllChannels, setShowAllChannels] = useState(false);

  const uniqueChannels = useMemo(() => {
    const channels = videos
      .map((video) => video.channelTitle)
      .filter((channel): channel is string => channel !== null);
    return Array.from(new Set(channels));
  }, [videos]);

  const displayedChannels = useMemo(() => {
    return showAllChannels
      ? uniqueChannels
      : uniqueChannels.slice(0, maxChannels);
  }, [uniqueChannels, showAllChannels]);

  const hasMoreChannels = uniqueChannels.length > maxChannels;

  useEffect(() => {
    if (selectedChannel && !uniqueChannels.includes(selectedChannel)) {
      setSelectedChannel(null);
    }
  }, [selectedChannel, uniqueChannels]);

  const filteredVideos = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return videos.filter((video) => {
      const matchesChannel =
        !selectedChannel || video.channelTitle === selectedChannel;
      if (!matchesChannel) return false;

      if (!query) return true;

      const title = video.title.toLowerCase();
      const channel = (video.channelTitle ?? "").toLowerCase();
      return title.includes(query) || channel.includes(query);
    });
  }, [videos, selectedChannel, searchQuery]);

  if (!videos || videos.length === 0) {
    return <RecommendedVideos />;
  }

  return (
    <div className="w-full">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          {t("videoList.title")}
        </h2>
        <Link
          href="/library"
          className="shrink-0 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {t("videoList.viewAll")}
        </Link>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-[220px] shrink-0 sm:w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("videoList.searchPlaceholder")}
            aria-label={t("videoList.searchPlaceholder")}
            className="h-9 w-full rounded-lg border border-white/10 bg-card pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-accent/40"
          />
        </div>

        <Button
          type="button"
          variant={selectedChannel === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedChannel(null)}
          className={cn(
            "h-9 cursor-pointer rounded-lg",
            selectedChannel === null
              ? "bg-accent text-black hover:bg-accent/90"
              : "border-white/10 bg-transparent text-foreground hover:bg-white/5"
          )}
        >
          {t("videoList.allChannels")}
        </Button>

        {displayedChannels.map((channel) => {
          const isSelected = selectedChannel === channel;
          return (
            <Button
              key={channel}
              type="button"
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedChannel(isSelected ? null : channel)}
              className={cn(
                "h-9 max-w-48 cursor-pointer truncate rounded-lg",
                isSelected
                  ? "bg-accent text-black hover:bg-accent/90"
                  : "border-white/10 bg-transparent text-foreground hover:bg-white/5"
              )}
            >
              {channel}
            </Button>
          );
        })}

        {hasMoreChannels && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowAllChannels(!showAllChannels)}
            className="h-9 cursor-pointer rounded-lg text-muted-foreground"
          >
            {showAllChannels
              ? t("videoList.showLess")
              : `+${uniqueChannels.length - maxChannels} ${t(
                  "videoList.more"
                )}`}
          </Button>
        )}
      </div>

      <VideoList videos={filteredVideos} />
    </div>
  );
}
