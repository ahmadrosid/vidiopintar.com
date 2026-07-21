"use client";

import Image from "next/image";
import { Trash } from "@phosphor-icons/react";
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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {videos.map((video) => (
          <div key={video.userVideoId} className="group relative">
            <a
              href={`/video/${video.youtubeId}`}
              className="block overflow-hidden rounded-xl border border-white/10 bg-card/40 transition-colors hover:border-white/20 hover:bg-card/60"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-muted">
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

              <div className="space-y-1 px-3 py-3">
                <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
                  {video.title}
                </h3>
                {video.channelTitle ? (
                  <p className="truncate text-xs text-muted-foreground">
                    {video.channelTitle}
                  </p>
                ) : null}
              </div>
            </a>

            <button
              type="button"
              className="absolute right-2 top-2 z-10 cursor-pointer rounded-md bg-black/80 p-1.5 text-white opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
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
