import { getCurrentUser } from "@/lib/auth";
import { SharedChats } from "../shared-chats";
import { getTranslations } from 'next-intl/server';

export default async function SharedPage() {
  const user = await getCurrentUser();
  const t = await getTranslations('profile');
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tighter mb-2">
          {t('sharedChats.title')}
        </h1>
        <p className="text-muted-foreground">
          All your shared conversations
        </p>
      </div>
      <SharedChats userId={user.id} />
    </div>
  );
}