"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Search, LayoutGrid, List } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { VideoList } from "@/components/video/video-list";
import { RecommendedVideos } from "@/components/video/recommended-videos";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

type Video = {
  userVideoId: number;
  youtubeId: string;
  title: string;
  channelTitle: string | null;
  publishedAt: Date | null;
  thumbnailUrl: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

type SortOption = "recent" | "title" | "channel";
type ViewLayout = "grid" | "list";

interface VideoListWithFilterProps {
  videos: Video[];
  showViewAll?: boolean;
  variant?: "default" | "library";
}

export function VideoListWithFilter({
  videos,
  showViewAll = true,
  variant = "default",
}: VideoListWithFilterProps) {
  const t = useTranslations("video");
  const tLibrary = useTranslations("library");
  const maxChannels = 7;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [showAllChannels, setShowAllChannels] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [layout, setLayout] = useState<ViewLayout>("grid");

  const uniqueChannels = useMemo(() => {
    const channels = videos
      .map((video) => video.channelTitle)
      .filter((channel): channel is string => channel !== null);
    return Array.from(new Set(channels)).sort((a, b) => a.localeCompare(b));
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

    const filtered = videos.filter((video) => {
      const matchesChannel =
        !selectedChannel || video.channelTitle === selectedChannel;
      if (!matchesChannel) return false;

      if (!query) return true;

      const title = video.title.toLowerCase();
      const channel = (video.channelTitle ?? "").toLowerCase();
      return title.includes(query) || channel.includes(query);
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === "channel") {
        return (a.channelTitle ?? "").localeCompare(b.channelTitle ?? "");
      }
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

    return sorted.map((video) => ({
      ...video,
      meta: video.createdAt
        ? tLibrary("addedAgo", {
            time: formatDistanceToNow(new Date(video.createdAt)),
          })
        : null,
    }));
  }, [videos, selectedChannel, searchQuery, sortBy, tLibrary]);

  if (!videos || videos.length === 0) {
    return <RecommendedVideos />;
  }

  if (variant === "library") {
    return (
      <div className="w-full">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={tLibrary("searchPlaceholder")}
              aria-label={tLibrary("searchPlaceholder")}
              className="h-10 w-full rounded-xl border border-white/10 bg-card pl-10 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-accent/40"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={selectedChannel ?? "all"}
              onValueChange={(value) =>
                setSelectedChannel(value === "all" ? null : value)
              }
            >
              <SelectTrigger className="h-10 w-auto min-w-[5.5rem] cursor-pointer rounded-xl border-white/10 bg-card">
                <SelectValue placeholder={tLibrary("all")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tLibrary("all")}</SelectItem>
                {uniqueChannels.map((channel) => (
                  <SelectItem key={channel} value={channel}>
                    {channel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as SortOption)}
            >
              <SelectTrigger className="h-10 w-auto min-w-[9rem] cursor-pointer rounded-xl border-white/10 bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">
                  {tLibrary("sort.recent")}
                </SelectItem>
                <SelectItem value="title">{tLibrary("sort.title")}</SelectItem>
                <SelectItem value="channel">
                  {tLibrary("sort.channel")}
                </SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center rounded-xl border border-white/10 bg-card p-1">
              <button
                type="button"
                onClick={() => setLayout("grid")}
                aria-label={tLibrary("view.grid")}
                aria-pressed={layout === "grid"}
                className={cn(
                  "cursor-pointer rounded-lg p-1.5 transition-colors",
                  layout === "grid"
                    ? "bg-white/10 text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutGrid className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setLayout("list")}
                aria-label={tLibrary("view.list")}
                aria-pressed={layout === "list"}
                className={cn(
                  "cursor-pointer rounded-lg p-1.5 transition-colors",
                  layout === "list"
                    ? "bg-white/10 text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <List className="size-4" />
              </button>
            </div>
          </div>
        </div>

        <VideoList videos={filteredVideos} layout={layout} />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          {t("videoList.title")}
        </h2>
        {showViewAll ? (
          <Link
            href="/library"
            className="shrink-0 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("videoList.viewAll")}
          </Link>
        ) : null}
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
