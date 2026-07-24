"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";

interface LatestVideo {
  id: number;
  youtubeId: string;
  title: string;
  channelTitle: string | null;
  thumbnailUrl: string | null;
  createdAt: Date;
}

interface LatestVideosProps {
  videos: LatestVideo[];
}

export function LatestVideos({ videos }: LatestVideosProps) {
  return (
    <Card className="shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 mb-2">
        <CardTitle className="text-base font-semibold">Latest Videos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {videos.length === 0 ? (
            <p className="text-sm text-muted-foreground">No videos yet</p>
          ) : (
            videos.map((video) => (
              <div key={video.id} className="flex items-start space-x-3">
                {video.thumbnailUrl && (
                  <div className="relative w-20 h-13 flex-shrink-0 overflow-hidden rounded">
                    <Image
                      src={video.thumbnailUrl}
                      alt={video.title}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-md font-medium truncate line-clamp-2">{video.title}</p>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    {video.channelTitle && (
                      <span className="truncate">{video.channelTitle}</span>
                    )}
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(video.createdAt))} ago</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}