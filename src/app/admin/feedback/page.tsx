import { requireAdmin } from "@/lib/auth-admin";
import { FeedbackRepository } from "@/lib/db/repository";
import { AdminFeedbackPage } from "@/components/admin/admin-feedback-page";

interface FeedbackWithUser {
  id: number;
  userId: string;
  type: string;
  rating: string;
  comment: string | null;
  metadata: any;
  createdAt: Date;
  user?: {
    name: string;
    email: string;
    image?: string;
  };
}

async function getFeedbackStats() {
  const allFeedback = await FeedbackRepository.getAll();
  
  const stats = {
    total: allFeedback.length,
    byRating: {
      love_it: allFeedback.filter(f => f.rating === 'love_it').length,
      decent: allFeedback.filter(f => f.rating === 'decent').length,
      bad: allFeedback.filter(f => f.rating === 'bad').length,
    },
    byType: {
      platform: allFeedback.filter(f => f.type === 'platform').length,
      video: allFeedback.filter(f => f.type === 'video').length,
      chat_response: allFeedback.filter(f => f.type === 'chat_response').length,
    },
    withComments: allFeedback.filter(f => f.comment && f.comment.trim().length > 0).length,
  };

  return { stats, feedback: allFeedback };
}


export default async function Page() {
  await requireAdmin();

  const { stats, feedback } = await getFeedbackStats();

  return <AdminFeedbackPage initialFeedback={feedback} initialStats={stats} />;
}