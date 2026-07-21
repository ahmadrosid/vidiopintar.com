"use client";

import { Trash } from "@phosphor-icons/react";
import { useDeleteVideoDialogStore } from "@/lib/store/dialog-store";
import { DeleteVideoDialog } from "@/components/video/delete-video-dialog";
import { VideoCard } from "@/components/video/video-card";
import { cn } from "@/lib/utils";

type Video = {
  userVideoId: number;
  youtubeId: string;
  title: string;
  channelTitle: string | null;
  publishedAt: Date | null;
  thumbnailUrl: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  meta?: string | null;
};

interface VideoListProps {
  videos: Video[];
  layout?: "grid" | "list";
}

export function VideoList({ videos, layout = "grid" }: VideoListProps) {
  const { openDialog } = useDeleteVideoDialogStore();

  if (!videos || videos.length === 0)
    return (
      <p className="mt-10 text-center text-muted-foreground">No videos yet.</p>
    );

  return (
    <>
      <DeleteVideoDialog />
      <div
        className={cn(
          layout === "list"
            ? "flex flex-col gap-3"
            : "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        )}
      >
        {videos.map((video) => (
          <div key={video.userVideoId} className="group relative">
            <VideoCard
              youtubeId={video.youtubeId}
              title={video.title}
              channelTitle={video.channelTitle}
              thumbnailUrl={video.thumbnailUrl}
              meta={video.meta}
              layout={layout}
            />

            <button
              type="button"
              className={cn(
                "absolute z-10 cursor-pointer rounded-md bg-black/80 p-1.5 text-white opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100",
                layout === "list" ? "right-3 top-3" : "right-2 top-2"
              )}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                openDialog(video.userVideoId);
              }}
              aria-label="Delete video"
            >
              <Trash className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
