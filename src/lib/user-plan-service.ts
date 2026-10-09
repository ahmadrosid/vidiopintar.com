import { z } from 'zod';
import { transactionsRepository } from '@/lib/db/repository/transactions';
import { UserVideoRepository } from '@/lib/db/repository';
import { UsageEventRepository } from '@/lib/db/repository/usage-events';

export type UserPlan = 'free' | 'monthly' | 'yearly';

const userPlanSchema = z.enum(['free', 'monthly', 'yearly']);

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
  /**
   * Get user's current active plan
   */
  static async getCurrentPlan(userId: string): Promise<UserPlan> {
    const confirmedTransaction = await transactionsRepository.getRecentTransactionsByUserId(
      userId, 
      365 * 24 * 60 * 60 * 1000
    );

    const activeTransaction = confirmedTransaction.find(tx => {
      if (tx.status !== 'confirmed' || !tx.confirmedAt) return false;
      
      const confirmedDate = new Date(tx.confirmedAt);
      const now = new Date();
      
      if (tx.planType === 'monthly') {
        const expiry = new Date(confirmedDate.getTime() + 30 * 24 * 60 * 60 * 1000);

        return now <= expiry;
      } else if (tx.planType === 'yearly') {
        const expiry = new Date(confirmedDate.getTime() + 365 * 24 * 60 * 60 * 1000);

        return now <= expiry;
      }
      
      return false;
    });

    if (activeTransaction) {
      const planType = userPlanSchema.safeParse(activeTransaction.planType);

      return planType.success ? planType.data : 'free';
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

    const recentTransactions = await transactionsRepository.getRecentTransactionsByUserId(
      userId, 
      365 * 24 * 60 * 60 * 1000
    );

    const activeTransaction = recentTransactions.find(tx => {
      if (tx.status !== 'confirmed' || !tx.confirmedAt || tx.planType !== planType) return false;
      
      const confirmedDate = new Date(tx.confirmedAt);
      const now = new Date();
      
      if (tx.planType === 'monthly') {
        const expiry = new Date(confirmedDate.getTime() + 30 * 24 * 60 * 60 * 1000);

        return now <= expiry;
      } else if (tx.planType === 'yearly') {
        const expiry = new Date(confirmedDate.getTime() + 365 * 24 * 60 * 60 * 1000);

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
}