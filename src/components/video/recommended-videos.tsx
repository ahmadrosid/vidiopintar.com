"use client";

import { RECOMMENDED_VIDEOS } from "@/lib/recommended-videos";
import { VideoCard } from "@/components/video/video-card";
import { useTranslations } from "next-intl";

export function RecommendedVideos() {
  const t = useTranslations("video.recommended");

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold tracking-tight text-foreground mb-2">
        {t("title")}
      </h2>
      <p className="text-sm text-muted-foreground mb-6">{t("subtitle")}</p>
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
    </div>
  );
}
