"use client";

import { useState, useMemo, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { VideoList } from "@/components/video/video-list";
import { Button } from "@/components/ui/button";
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
    return (
      <div className="w-full">
        <h2 className="text-xl font-semibold tracking-tighter mb-6">
          {t("videoList.title")}
        </h2>
        <VideoList videos={[]} />
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold tracking-tighter mb-6">
        {t("videoList.title")}
      </h2>

      <div className="flex flex-wrap items-center gap-3 mb-8 overflow-x-auto py-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={t("videoList.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 ml-0.5 w-64 rounded-full h-fit py-1 bg-white! text-black text-sm placeholder:text-sm placeholder:text-muted-foreground"
          />
        </div>
        <Button
          variant={selectedChannel === null ? "default" : "secondary"}
          size="sm"
          onClick={() => setSelectedChannel(null)}
          className="rounded-full px-4 py-2 text-sm whitespace-nowrap"
        >
          {t("videoList.allChannels")}
        </Button>
        {displayedChannels.map((channel) => (
          <Button
            key={channel}
            variant={selectedChannel === channel ? "default" : "secondary"}
            size="sm"
            onClick={() =>
              setSelectedChannel(selectedChannel === channel ? null : channel)
            }
            className="rounded-full px-4 py-2 text-sm whitespace-nowrap flex items-center gap-2"
          >
            {channel}
          </Button>
        ))}

        {hasMoreChannels && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAllChannels(!showAllChannels)}
            className="rounded-full px-4 py-2 text-sm whitespace-nowrap"
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
