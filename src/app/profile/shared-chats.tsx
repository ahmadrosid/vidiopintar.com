import { db } from "@/lib/db";
import { sharedVideos, videos } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { SharedChatsList } from "./shared-chats-list";
import { getTranslations } from 'next-intl/server';

interface SharedChatsProps {
  userId: string;
}

export async function SharedChats({ userId }: SharedChatsProps) {
  const t = await getTranslations('profile');
  
  const shared = await db
    .select({
      slug: sharedVideos.slug,
      youtubeId: sharedVideos.youtubeId,
      title: videos.title,
      thumbnailUrl: videos.thumbnailUrl,
      createdAt: sharedVideos.createdAt,
    })
    .from(sharedVideos)
    .innerJoin(videos, eq(sharedVideos.youtubeId, videos.youtubeId))
    .where(eq(sharedVideos.ownerId, userId))
    .orderBy(desc(sharedVideos.createdAt))
    .limit(10);

  if (shared.length === 0) {
    return (
      <div className="p-12 text-center">
        <p className="text-muted-foreground">{t('sharedChats.empty')}</p>
      </div>
    );
  }

  return <SharedChatsList items={shared} />;
}