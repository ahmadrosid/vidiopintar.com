"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { handleVideoSubmit } from "@/app/actions";
import { useState } from "react";

interface VideoResult {
  id: string;
  title: string;
  description: string;
  thumbnails: Array<{
    url: string;
    width: number;
    height: number;
  }>;
  published: string;
  view_count: string;
  duration: string;
  author: {
    id: string;
    name: string;
  };
}

interface VideoSearchResultsProps {
  results: VideoResult[];
}

export function VideoSearchResults({ results }: VideoSearchResultsProps) {
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const handleAddVideo = async (videoId: string) => {
    setSubmittingId(videoId);
    const formData = new FormData();
    formData.append('videoUrl', `https://www.youtube.com/watch?v=${videoId}`);
    
    try {
      await handleVideoSubmit({}, formData);
    } catch (error) {
      console.error('Failed to add video:', error);
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {results.map((video) => (
        <Card key={video.id} className="overflow-hidden">
          <div className="aspect-video relative">
            <img 
              src={video.thumbnails[0]?.url} 
              alt={video.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
              {video.duration}
            </div>
          </div>
          <div className="p-4 space-y-2">
            <h3 className="font-semibold line-clamp-2 text-sm">
              <a 
                href={`https://www.youtube.com/watch?v=${video.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {video.title}
              </a>
            </h3>
            <p className="text-xs text-muted-foreground">{video.author.name}</p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{video.view_count}</span>
              <span>{video.published}</span>
            </div>
            <Button 
              onClick={() => handleAddVideo(video.id)}
              disabled={submittingId === video.id}
              className="w-full"
              size="sm"
            >
              {submittingId === video.id ? "Processing..." : "Chat with video"}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}