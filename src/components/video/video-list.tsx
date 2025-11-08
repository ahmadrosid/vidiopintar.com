"use client";

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
      <p className="text-center text-muted-foreground mt-10">No videos yet.</p>
    );

  return (
    <>
      <DeleteVideoDialog />
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {videos.map((video) => (
          <div key={video.userVideoId} className="relative group">
            <a href={`/video/${video.youtubeId}`}>
              <Card className="overflow-hidden rounded-xs shadow-none border-none bg-card hover:bg-card/50 transition-all duration-200">
                <CardContent className="p-0 relative">
                  <img
                    src={video.thumbnailUrl!}
                    alt={video.title}
                    className="object-cover w-full h-40"
                  />
                  <button
                    className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white dark:text-black p-1 rounded-lg z-10 cursor-pointer hover:text-red-500/80"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      openDialog(video.userVideoId);
                    }}
                  >
                    <Trash2 className="size-4 text-foreground" />
                  </button>
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
            </a>
          </div>
        ))}
      </div>
    </>
  );
}
