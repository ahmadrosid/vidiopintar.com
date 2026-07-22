"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { VideoCard } from "@/components/video/video-card";
import {
  RECOMMENDED_VIDEOS,
  type RecommendedVideo,
} from "@/lib/recommended-videos";

type ExploreRecommendedContentProps = {
  recommendedVideos?: RecommendedVideo[];
};

export function ExploreRecommendedContent({
  recommendedVideos = RECOMMENDED_VIDEOS,
}: ExploreRecommendedContentProps) {
  const t = useTranslations("explore");

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
            {t("recommended")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("videoCount", { count: recommendedVideos.length })}
          </p>
        </header>
      </div>

      {recommendedVideos.length === 0 ? (
        <p className="py-6 text-sm text-muted-foreground">{t("emptyFilter")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {recommendedVideos.map((video) => (
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
