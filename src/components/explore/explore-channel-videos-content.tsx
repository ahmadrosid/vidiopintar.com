"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { ChannelAvatar } from "@/components/explore/channel-result-card";
import { formatSubscriberCount } from "@/components/explore/format-subscriber-count";
import { VideoCard } from "@/components/video/video-card";
import type { RecommendedVideo } from "@/lib/recommended-videos";
import type { YoutubeSearchChannel } from "@/lib/youtube/search";

type ExploreChannelVideosContentProps = {
  channel: YoutubeSearchChannel;
  videos: RecommendedVideo[];
};

export function ExploreChannelVideosContent({
  channel,
  videos,
}: ExploreChannelVideosContentProps) {
  const t = useTranslations("explore");

  return (
    <div className="w-full space-y-8">
      <div className="space-y-4">
        <Link
          href="/explore/channels"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {t("backToChannels")}
        </Link>

        <header className="flex items-center gap-4">
          <ChannelAvatar channel={channel} size="md" />
          <div className="min-w-0 space-y-1">
            <h1 className="truncate text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              {channel.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("subscriberCount", {
                count: formatSubscriberCount(channel.subscriberCount),
              })}
              {" · "}
              {t("videoCount", { count: videos.length })}
            </p>
          </div>
        </header>
      </div>

      {videos.length === 0 ? (
        <p className="py-6 text-sm text-muted-foreground">
          {t("emptyChannelVideos")}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((video) => (
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
