"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useDeleteVideoDialogStore } from "@/lib/store/dialog-store";
import { DeleteVideoDialog } from "@/components/video/delete-video-dialog";

type Video = {
  userVideoId: number;
  youtubeId: string;
  title: string;
  channelTitle: string | null;
  publishedAt: Date | null;
  thumbnailUrl: string | null;
};

interface VideoListProps {
  videos: Video[];
}

export function VideoList({ videos }: VideoListProps) {
  const { openDialog } = useDeleteVideoDialogStore();

  if (!videos || videos.length === 0)
    return (
      <p className="mt-10 text-center text-muted-foreground">No videos yet.</p>
    );

  return (
    <>
      <DeleteVideoDialog />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {videos.map((video) => (
          <div key={video.userVideoId} className="group relative">
            <a href={`/video/${video.youtubeId}`}>
              <Card className="overflow-hidden rounded-xl border-none bg-transparent shadow-none transition-opacity duration-200 hover:opacity-95">
                <CardContent className="relative p-0">
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl">
                    {video.thumbnailUrl ? (
                      <Image
                        src={video.thumbnailUrl}
                        alt={video.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className="absolute bottom-2 right-2 z-10 cursor-pointer rounded-lg bg-black/80 p-1.5 text-white opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      openDialog(video.userVideoId);
                    }}
                  >
                    <Trash2 className="size-4" />
                  </button>
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
            </a>
          </div>
        ))}
      </div>
    </>
  );
}
