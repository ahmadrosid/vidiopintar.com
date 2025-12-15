"use client";

import { useEffect, useState } from "react";
import { getComments } from "@/lib/services/api";
import { VideoComment } from "@/lib/services/schema";
import { MessageCircle, Heart, TextQuote, Loader } from "lucide-react";
import { CopyButton } from "../ui/copy-button";

interface CommentsViewProps {
  videoId: string;
}

export function CommentsView({ videoId }: CommentsViewProps) {
  const [comments, setComments] = useState<VideoComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await getComments(videoId);
        // Convert readonly array to mutable array
        setComments([...result.results]);
      } catch (err) {
        console.error('Failed to fetch comments:', err);
        setError('Failed to load comments');
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      fetchComments();
    }
  }, [videoId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 mt-8">
        <Loader className="size-7 animate-spin text-primary/50" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="p-4 text-center">
        <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No comments found for this video.</p>
      </div>
    );
  }

  const formatLikeCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className="space-y-4 py-4 px-1">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-medium text-sm text-muted-foreground">Top Comments ({comments.length})</h3>
      </div>
      
      <div className="h-full max-h-[320px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="space-y-1">
          {comments.map((comment) => (
            <div
              key={comment.comment_id}
              className="p-3 mr-1 rounded-xs transition-all duration-200 bg-card hover:bg-card/50"
            >
              <div className="flex flex-col gap-2">
                <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                  {comment.text}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-xs text-muted-foreground truncate">
                    {comment.author}
                  </span>
                  {comment.like_count > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground/70">
                      <Heart className="size-3" />
                      <span>{formatLikeCount(comment.like_count)}</span>
                    </div>
                  )}
                  {comment.reply_count > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground/70">
                      <TextQuote className="size-3" />
                      <span>{comment.reply_count} replies</span>
                    </div>
                  )}
                  <CopyButton content={comment.text} copyMessage="Copied comment" label="Copy" className="text-primary/75" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}