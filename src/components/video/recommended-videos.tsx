"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { RECOMMENDED_VIDEOS } from "@/lib/recommended-videos";
import { useTranslations } from "next-intl";

export function RecommendedVideos() {
  const t = useTranslations("video.recommended");

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold tracking-tighter mb-6">
        {t("title")}
      </h2>
      <p className="text-sm text-muted-foreground -mt-4 mb-6">{t("subtitle")}</p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {RECOMMENDED_VIDEOS.map((video) => (
          <Link key={video.youtubeId} href={`/video/${video.youtubeId}`}>
            <Card className="overflow-hidden rounded-xl border-none bg-transparent shadow-none transition-opacity duration-200 hover:opacity-95">
              <CardContent className="p-0">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="h-40 w-full rounded-xl object-cover"
                />
              </CardContent>
              <CardHeader className="space-y-1 px-0 pt-3 pb-0">
                <CardTitle className="line-clamp-2 text-base leading-snug">
                  {video.title}
                </CardTitle>
                <CardDescription className="truncate text-sm text-muted-foreground">
                  {video.channelTitle}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
