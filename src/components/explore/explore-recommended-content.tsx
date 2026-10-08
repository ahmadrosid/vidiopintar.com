"use client";

import { useTranslations } from "next-intl";
import { ExploreBackHeader } from "@/components/explore/explore-back-header";
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
      <ExploreBackHeader title={t("recommended")} count={t("videoCount", { count: recommendedVideos.length })} backLabel={t("backToExplore")} />

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
