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
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {RECOMMENDED_VIDEOS.map((video) => (
          <Link key={video.youtubeId} href={`/video/${video.youtubeId}`}>
            <Card className="overflow-hidden rounded-xs shadow-none border-none bg-card hover:bg-card/50 transition-all duration-200">
              <CardContent className="p-0">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="object-cover w-full h-40"
                />
              </CardContent>
              <CardHeader className="p-4">
                <CardTitle className="text-lg truncate">
                  {video.title}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground truncate">
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
