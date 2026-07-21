import { getCurrentUser } from "@/lib/auth";
import { UserChats } from "../user-chats";
import { getTranslations } from 'next-intl/server';

export default async function ChatsPage() {
  const user = await getCurrentUser();
  const t = await getTranslations('profile');
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tighter mb-2">
          {t('profileSidebar.chats')}
        </h1>
        <p className="text-muted-foreground">
          All your conversations from videos you've watched
        </p>
      </div>
      <UserChats userId={user.id} />
    </div>
  );
}