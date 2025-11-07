"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

interface LatestMessage {
  id: string;
  content: string;
  role: string;
  createdAt: Date;
  userVideoId: number;
  videoTitle: string;
  youtubeId: string;
  userName: string;
}

interface LatestMessagesProps {
  messages: LatestMessage[];
}

export function LatestMessages({ messages }: LatestMessagesProps) {
  return (
    <Card className="shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 mb-2">
        <CardTitle className="text-base font-semibold">Latest Messages</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">No messages yet</p>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="space-y-1 mb-2 border-l-4 border-l-primary pl-4 bg-accent/25 py-2">
                <p className="text-sm line-clamp-2">{message.content}</p>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span className="font-medium">{message.userName}</span>
                  <span>•</span>
                  <span className="truncate max-w-[200px]">{message.videoTitle}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(message.createdAt))} ago</span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}