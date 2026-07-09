import { transactionsRepository } from '@/lib/db/repository/transactions';
import { UserVideoRepository } from '@/lib/db/repository';
import { UsageEventRepository } from '@/lib/db/repository/usage-events';
import { QuizRepository } from '@/lib/db/repository/quizzes';

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
    videosPerDay: -1, // unlimited
    messagesPerVideo: -1, // unlimited
    unlimited: true,
  },
  yearly: {
    videosPerDay: -1, // unlimited
    messagesPerVideo: -1, // unlimited
    unlimited: true,
  },
};

export class UserPlanService {
  /**
   * Get user's current active plan
   */
  static async getCurrentPlan(userId: string): Promise<UserPlan> {
    // Check for active subscription transactions
    const confirmedTransaction = await transactionsRepository.getRecentTransactionsByUserId(
      userId, 
      365 * 24 * 60 * 60 * 1000 // 365 days in milliseconds to cover yearly plans
    );

    // Find the most recent confirmed transaction within subscription period
    const activeTransaction = confirmedTransaction.find(tx => {
      if (tx.status !== 'confirmed' || !tx.confirmedAt) return false;
      
      const confirmedDate = new Date(tx.confirmedAt);
      const now = new Date();
      
      // Check if subscription is still active based on plan type
      if (tx.planType === 'monthly') {
        const expiry = new Date(confirmedDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
        return now <= expiry;
      } else if (tx.planType === 'yearly') {
        const expiry = new Date(confirmedDate.getTime() + 365 * 24 * 60 * 60 * 1000); // 365 days
        return now <= expiry;
      }
      
      return false;
    });

    if (activeTransaction) {
      return activeTransaction.planType as UserPlan;
    }

    return 'free';
  }

  /**
   * Get plan limits for a specific plan
   */
  static getPlanLimits(plan: UserPlan): PlanLimits {
    return PLAN_LIMITS[plan];
  }

  /**
   * Check if user can add a new video based on their plan limits
   */
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

  /**
   * Check if user can send a chat message for a specific video
   */
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

  /**
   * Get user's current usage stats
   */
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

  /**
   * Check if user has an active subscription for a specific plan type
   */
  static async hasActiveSubscription(userId: string, planType: UserPlan): Promise<{
    hasActive: boolean;
    expiresAt?: Date;
    transaction?: any;
  }> {
    if (planType === 'free') {
      return { hasActive: false };
    }

    // Get recent transactions to check for active subscriptions
    const recentTransactions = await transactionsRepository.getRecentTransactionsByUserId(
      userId, 
      365 * 24 * 60 * 60 * 1000 // 1 year in milliseconds to cover yearly plans
    );

    // Find active subscription for the specific plan type
    const activeTransaction = recentTransactions.find(tx => {
      if (tx.status !== 'confirmed' || !tx.confirmedAt || tx.planType !== planType) return false;
      
      const confirmedDate = new Date(tx.confirmedAt);
      const now = new Date();
      
      // Check if subscription is still active based on plan type
      if (tx.planType === 'monthly') {
        const expiry = new Date(confirmedDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
        return now <= expiry;
      } else if (tx.planType === 'yearly') {
        const expiry = new Date(confirmedDate.getTime() + 365 * 24 * 60 * 60 * 1000); // 365 days
        return now <= expiry;
      }
      
      return false;
    });

    if (activeTransaction) {
      const confirmedDate = new Date(activeTransaction.confirmedAt!);
      const expiresAt = activeTransaction.planType === 'monthly' 
        ? new Date(confirmedDate.getTime() + 30 * 24 * 60 * 60 * 1000)
        : new Date(confirmedDate.getTime() + 365 * 24 * 60 * 60 * 1000);

      return {
        hasActive: true,
        expiresAt,
        transaction: activeTransaction,
      };
    }

    return { hasActive: false };
  }

  /**
   * Check if user can purchase a specific plan
   */
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

    const activeSubscriptionCheck = await this.hasActiveSubscription(userId, planType);
    
    if (activeSubscriptionCheck.hasActive) {
      return {
        canPurchase: false,
        reason: 'already_have_active_subscription',
        activeSubscription: {
          planType,
          expiresAt: activeSubscriptionCheck.expiresAt!,
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

    const canGenerate = !trialUsed;
    const canRetry = !hasCompletedAttempt;
    const upgradeRequired = trialUsed && hasCompletedAttempt;

    return {
      currentPlan,
      canGenerate,
      canRetry,
      upgradeRequired,
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
      reason: 'trial_used',
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