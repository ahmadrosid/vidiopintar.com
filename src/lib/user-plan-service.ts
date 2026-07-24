import { transactionsRepository } from '@/lib/db/repository/transactions';
import { UserVideoRepository } from '@/lib/db/repository';
import { UsageEventRepository } from '@/lib/db/repository/usage-events';
import { QuizRepository } from '@/lib/db/repository/quizzes';
import { getSubscriptionEndsAt, isTransactionActive } from '@/lib/mayar/subscription';

export type UserPlan = 'free' | 'monthly' | 'yearly';

export interface PlanLimits {
  videosPerDay: number;
  messagesPerVideo: number;
  unlimited: boolean;
}

const PLAN_LIMITS: Record<UserPlan, PlanLimits> = {
  free: {
    videosPerDay: 2,
    messagesPerVideo: 10,
    unlimited: false,
  },
  monthly: {
    videosPerDay: -1,
    messagesPerVideo: -1,
    unlimited: true,
  },
  yearly: {
    videosPerDay: -1,
    messagesPerVideo: -1,
    unlimited: true,
  },
};

export class UserPlanService {
  static async getCurrentPlan(userId: string): Promise<UserPlan> {
    const confirmedTransaction = await transactionsRepository.getRecentTransactionsByUserId(
      userId,
      365 * 24 * 60 * 60 * 1000,
    );

    const activeTransaction = confirmedTransaction.find((tx) =>
      isTransactionActive(tx),
    );

    if (activeTransaction) {
      return activeTransaction.planType as UserPlan;
    }

    return 'free';
  }

  static getPlanLimits(plan: UserPlan): PlanLimits {
    return PLAN_LIMITS[plan];
  }

  static async canAddVideo(userId: string, youtubeId?: string): Promise<{
    canAdd: boolean;
    currentPlan: UserPlan;
    reason?: string;
    videosUsedToday?: number;
    dailyLimit?: number;
  }> {
    const currentPlan = await this.getCurrentPlan(userId);
    const limits = this.getPlanLimits(currentPlan);

    if (limits.unlimited) {
      return {
        canAdd: true,
        currentPlan,
      };
    }

    const videosUsedToday = await UsageEventRepository.countVideosAddedToday(userId);
    const dailyLimit = limits.videosPerDay;

    if (
      youtubeId &&
      (await UsageEventRepository.hasVideoAddedToday(userId, youtubeId))
    ) {
      return {
        canAdd: true,
        currentPlan,
        videosUsedToday,
        dailyLimit,
      };
    }

    if (videosUsedToday >= dailyLimit) {
      return {
        canAdd: false,
        currentPlan,
        reason: 'daily_limit_reached',
        videosUsedToday,
        dailyLimit,
      };
    }

    return {
      canAdd: true,
      currentPlan,
      videosUsedToday,
      dailyLimit,
    };
  }

  static async canSendMessage(userId: string, userVideoId: number): Promise<{
    canSend: boolean;
    currentPlan: UserPlan;
    reason?: string;
    messagesUsed?: number;
    messageLimit?: number;
  }> {
    const currentPlan = await this.getCurrentPlan(userId);
    const limits = this.getPlanLimits(currentPlan);

    if (limits.unlimited) {
      return { canSend: true, currentPlan };
    }

    const userVideo = await UserVideoRepository.getById(userVideoId);
    if (!userVideo || userVideo.userId !== userId) {
      return { canSend: false, currentPlan, reason: 'unauthorized' };
    }

    const messagesUsed = await UsageEventRepository.countChatMessages(
      userId,
      userVideo.youtubeId,
    );
    const messageLimit = limits.messagesPerVideo;

    if (messagesUsed >= messageLimit) {
      return {
        canSend: false,
        currentPlan,
        reason: 'message_limit_reached',
        messagesUsed,
        messageLimit,
      };
    }

    return {
      canSend: true,
      currentPlan,
      messagesUsed,
      messageLimit,
    };
  }

  static async getUserUsageStats(userId: string) {
    const currentPlan = await this.getCurrentPlan(userId);
    const limits = this.getPlanLimits(currentPlan);

    if (limits.unlimited) {
      return {
        currentPlan,
        unlimited: true,
        videosUsedToday: 0,
        dailyLimit: -1,
      };
    }

    const videosUsedToday = await UsageEventRepository.countVideosAddedToday(userId);

    return {
      currentPlan,
      unlimited: false,
      videosUsedToday,
      dailyLimit: limits.videosPerDay,
      messagesPerVideo: limits.messagesPerVideo,
    };
  }

  static async getActivePaidSubscription(userId: string): Promise<{
    hasActive: boolean;
    planType?: UserPlan;
    expiresAt?: Date;
    transaction?: Awaited<
      ReturnType<typeof transactionsRepository.getRecentTransactionsByUserId>
    >[number];
  }> {
    const recentTransactions = await transactionsRepository.getRecentTransactionsByUserId(
      userId,
      365 * 24 * 60 * 60 * 1000,
    );

    const activeTransaction = recentTransactions.find((tx) => isTransactionActive(tx));

    if (activeTransaction) {
      const expiresAt = getSubscriptionEndsAt(activeTransaction);
      return {
        hasActive: true,
        planType: activeTransaction.planType as UserPlan,
        expiresAt: expiresAt ?? undefined,
        transaction: activeTransaction,
      };
    }

    return { hasActive: false };
  }

  static async hasActiveSubscription(userId: string, planType: UserPlan): Promise<{
    hasActive: boolean;
    expiresAt?: Date;
    transaction?: any;
  }> {
    if (planType === 'free') {
      return { hasActive: false };
    }

    const recentTransactions = await transactionsRepository.getRecentTransactionsByUserId(
      userId,
      365 * 24 * 60 * 60 * 1000,
    );

    const activeTransaction = recentTransactions.find(
      (tx) => tx.planType === planType && isTransactionActive(tx),
    );

    if (activeTransaction) {
      const expiresAt = getSubscriptionEndsAt(activeTransaction);
      return {
        hasActive: true,
        expiresAt: expiresAt ?? undefined,
        transaction: activeTransaction,
      };
    }

    return { hasActive: false };
  }

  static async canPurchasePlan(userId: string, planType: UserPlan): Promise<{
    canPurchase: boolean;
    reason?: string;
    activeSubscription?: {
      planType: UserPlan;
      expiresAt: Date;
    };
  }> {
    if (planType === 'free') {
      return { canPurchase: false, reason: 'free_plan_cannot_be_purchased' };
    }

    const active = await this.getActivePaidSubscription(userId);

    if (active.hasActive && active.planType && active.expiresAt) {
      return {
        canPurchase: false,
        reason: 'already_have_active_subscription',
        activeSubscription: {
          planType: active.planType,
          expiresAt: active.expiresAt,
        },
      };
    }

    return { canPurchase: true };
  }

  static async getQuizEntitlements(userId: string): Promise<{
    currentPlan: UserPlan;
    canGenerate: boolean;
    canRetry: boolean;
    upgradeRequired: boolean;
    trialUsed: boolean;
    hasCompletedAttempt: boolean;
  }> {
    const currentPlan = await this.getCurrentPlan(userId);
    const limits = this.getPlanLimits(currentPlan);
    const trialUsed = await UsageEventRepository.hasQuizGenerated(userId);
    const hasCompletedAttempt =
      await QuizRepository.hasCompletedAttemptForUser(userId);

    if (limits.unlimited) {
      return {
        currentPlan,
        canGenerate: true,
        canRetry: true,
        upgradeRequired: false,
        trialUsed,
        hasCompletedAttempt,
      };
    }

    return {
      currentPlan,
      canGenerate: !trialUsed,
      canRetry: false,
      upgradeRequired: true,
      trialUsed,
      hasCompletedAttempt,
    };
  }

  static async canGenerateQuiz(userId: string): Promise<{
    allowed: boolean;
    currentPlan: UserPlan;
    reason?: 'upgrade_required' | 'trial_used';
  }> {
    const entitlements = await this.getQuizEntitlements(userId);
    if (entitlements.canGenerate) {
      return { allowed: true, currentPlan: entitlements.currentPlan };
    }
    return {
      allowed: false,
      currentPlan: entitlements.currentPlan,
      reason: entitlements.trialUsed ? 'trial_used' : 'upgrade_required',
    };
  }

  static async canRetryQuiz(userId: string): Promise<{
    allowed: boolean;
    currentPlan: UserPlan;
    reason?: 'upgrade_required';
  }> {
    const entitlements = await this.getQuizEntitlements(userId);
    if (entitlements.canRetry) {
      return { allowed: true, currentPlan: entitlements.currentPlan };
    }
    return {
      allowed: false,
      currentPlan: entitlements.currentPlan,
      reason: 'upgrade_required',
    };
  }
}
