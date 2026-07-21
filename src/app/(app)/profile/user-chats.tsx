import { db } from "@/lib/db";
import { userVideos, videos } from "@/lib/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Markdown } from "@/components/ui/markdown";
import { getTranslations } from 'next-intl/server';
import { MessageSquare } from "lucide-react";

interface UserChatsProps {
  userId: string;
}

export async function UserChats({ userId }: UserChatsProps) {
  const t = await getTranslations('profile');
  
  // Get latest message for each user video
  const chats = await db
    .select({
      userVideoId: userVideos.id,
      youtubeId: userVideos.youtubeId,
      title: videos.title,
      thumbnailUrl: videos.thumbnailUrl,
      lastMessage: sql<string>`(
        SELECT content 
        FROM messages 
        WHERE user_video_id = ${userVideos.id} 
        ORDER BY created_at DESC 
        LIMIT 1
      )`,
      lastMessageTime: sql<Date>`(
        SELECT created_at 
        FROM messages 
        WHERE user_video_id = ${userVideos.id} 
        ORDER BY created_at DESC 
        LIMIT 1
      )`,
    })
    .from(userVideos)
    .innerJoin(videos, eq(userVideos.youtubeId, videos.youtubeId))
    .where(
      and(
        eq(userVideos.userId, userId),
        sql`EXISTS (SELECT 1 FROM messages WHERE user_video_id = ${userVideos.id})`
      )
    )
    .orderBy(sql`(
      SELECT created_at 
      FROM messages 
      WHERE user_video_id = ${userVideos.id} 
      ORDER BY created_at DESC 
      LIMIT 1
    ) DESC`)
    .limit(10);

  if (chats.length === 0) {
    return (
      <div className="p-12 text-center">
        <MessageSquare className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">{t('userChats.empty')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {chats.map((chat) => (
        <Link
          key={chat.userVideoId}
          href={`/video/${chat.youtubeId}`}
          className="block"
        >
          <div
            className="p-4 rounded-xs transition-all duration-200 cursor-pointer active:scale-[0.975] bg-card hover:bg-card/50 relative group"
          >
            <div className="flex gap-4">
              {/* Thumbnail */}
              <img 
                src={chat.thumbnailUrl || ""} 
                alt={chat.title}
                className="w-32 h-20 object-cover rounded shrink-0"
              />
              
              {/* Content */}
              <div className="flex-1 min-w-0 flex flex-col gap-2">
                {/* Video info */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground line-clamp-1">
                      {chat.title}
                    </h3>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                    {formatDistanceToNow(new Date(chat.lastMessageTime))} {t('userChats.ago')}
                  </span>
                </div>

                {/* Chat content */}
                <div className="flex gap-3">
                  <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <Markdown className="text-sm text-foreground whitespace-pre-wrap line-clamp-2">
                      {chat.lastMessage}
                    </Markdown>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}