"use client";

import { useState, useMemo, useEffect } from "react";
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
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
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

  // Reset selected channel if it no longer exists after video deletion
  useEffect(() => {
    if (selectedChannel && !uniqueChannels.includes(selectedChannel)) {
      setSelectedChannel(null);
    }
  }, [selectedChannel, uniqueChannels]);

  const filteredVideos = useMemo(() => {
    let filtered = videos;

    if (selectedChannel) {
      filtered = filtered.filter(
        (video) => video.channelTitle === selectedChannel
      );
    }

    // Filter by search query (title or channel name)
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (video) =>
          video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          video.channelTitle?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [videos, selectedChannel, searchQuery]);

  if (!videos || videos.length === 0) {
    return <RecommendedVideos />;
  }

  return (
    <div className="w-full">
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <Button
          variant={selectedChannel === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedChannel(null)}
          className={cn(
            "cursor-pointer rounded-full",
            selectedChannel === null
              ? "bg-accent text-accent-foreground hover:bg-accent/90"
              : "border-border bg-card text-muted-foreground hover:bg-card/80"
          )}
        >
          {t("videoList.allChannels")}
        </Button>

        {displayedChannels.map((channel) => {
          const isSelected = selectedChannel === channel;
          return (
            <Button
              key={channel}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedChannel(isSelected ? null : channel)}
              className={cn(
                "max-w-48 cursor-pointer truncate rounded-full",
                isSelected
                  ? "bg-accent text-accent-foreground hover:bg-accent/90"
                  : "border-border bg-card text-muted-foreground hover:bg-card/80"
              )}
            >
              {channel}
            </Button>
          );
        })}

        {hasMoreChannels && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllChannels(!showAllChannels)}
            className="cursor-pointer rounded-full text-muted-foreground"
          >
            {showAllChannels
              ? t("videoList.showLess")
              : `+${uniqueChannels.length - maxChannels} ${t(
                  "videoList.more"
                )}`}
          </Button>
        )}
      </div>

      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight">
          {t("videoList.title")}
        </h2>
      </div>

      <div className="mb-6">
        <div className="relative flex h-9 w-full max-w-sm items-center">
          <Search className="pointer-events-none absolute left-3 size-3.5 text-muted-foreground" />
          <input
            type="search"
            placeholder={t("videoList.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-full border border-border bg-card pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>
      </div>

      <VideoList videos={filteredVideos} />
    </div>
  );
}
