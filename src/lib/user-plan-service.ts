import { z } from "zod";
import { transactionsRepository } from "@/lib/db/repository/transactions";
import { UsageEventRepository } from "@/lib/db/repository/usage-events";

export type UserPlan = "free" | "monthly" | "yearly";

const paidPlanSchema = z.enum(["monthly", "yearly"]);

type PaidPlan = z.infer<typeof paidPlanSchema>;

interface ActiveSubscription {
  plan: PaidPlan;
  startsAt: Date;
  expiresAt: Date;
}

const dayMs = 24 * 60 * 60 * 1000;

const PLAN_PERIOD_MS: Record<PaidPlan, number> = {
  monthly: 30 * dayMs,
  yearly: 365 * dayMs,
};

export interface PlanLimits {
  videosPerDay: number;
  messagesPerVideo: number;
  unlimited: boolean;
  /** MCP transcript calls allowed per paid period, across all of a user's keys. */
  mcpCallsPerPeriod: number;
}

const PLAN_LIMITS: Record<UserPlan, PlanLimits> = {
  free: {
    videosPerDay: 2,
    messagesPerVideo: 10,
    unlimited: false,
    mcpCallsPerPeriod: 0,
  },
  monthly: {
    videosPerDay: -1,
    messagesPerVideo: -1,
    unlimited: true,
    mcpCallsPerPeriod: 1_000,
  },
  yearly: {
    videosPerDay: -1,
    messagesPerVideo: -1,
    unlimited: true,
    mcpCallsPerPeriod: 12_000,
  },
};

export class UserPlanService {
  /**
   * Get user's current active plan
   */
  static async getCurrentPlan(userId: string): Promise<UserPlan> {
    return (await this.getActiveSubscription(userId))?.plan ?? "free";
  }

  /**
   * Get the paid plan that is active right now, with the period it covers.
   * The period starts when the payment was confirmed.
   */
  static async getActiveSubscription(
    userId: string,
  ): Promise<ActiveSubscription | null> {
    const recentTransactions =
      await transactionsRepository.getRecentTransactionsByUserId(
        userId,
        PLAN_PERIOD_MS.yearly,
      );

    const now = Date.now();

    for (const tx of recentTransactions) {
      if (tx.status !== "confirmed" || !tx.confirmedAt) continue;

      const plan = paidPlanSchema.safeParse(tx.planType);

      if (!plan.success) continue;

      const startsAt = new Date(tx.confirmedAt);

      const expiresAt = new Date(
        startsAt.getTime() + PLAN_PERIOD_MS[plan.data],
      );

      if (now <= expiresAt.getTime()) {
        return { plan: plan.data, startsAt, expiresAt };
      }
    }

    return null;
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
  static async canAddVideo(
    userId: string,
    youtubeId?: string,
  ): Promise<{
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

    const videosUsedToday =
      await UsageEventRepository.countVideosAddedToday(userId);

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
        reason: "daily_limit_reached",
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

    const videosUsedToday =
      await UsageEventRepository.countVideosAddedToday(userId);

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
  static async hasActiveSubscription(
    userId: string,
    planType: UserPlan,
  ): Promise<{
    hasActive: boolean;
    expiresAt?: Date;
    transaction?: any;
  }> {
    if (planType === "free") {
      return { hasActive: false };
    }

    const recentTransactions =
      await transactionsRepository.getRecentTransactionsByUserId(
        userId,
        365 * 24 * 60 * 60 * 1000,
      );

    const activeTransaction = recentTransactions.find((tx) => {
      if (
        tx.status !== "confirmed" ||
        !tx.confirmedAt ||
        tx.planType !== planType
      )
        return false;

      const confirmedDate = new Date(tx.confirmedAt);
      const now = new Date();

      if (tx.planType === "monthly") {
        const expiry = new Date(
          confirmedDate.getTime() + 30 * 24 * 60 * 60 * 1000,
        );

        return now <= expiry;
      } else if (tx.planType === "yearly") {
        const expiry = new Date(
          confirmedDate.getTime() + 365 * 24 * 60 * 60 * 1000,
        );

        return now <= expiry;
      }

      return false;
    });

    if (activeTransaction) {
      const confirmedDate = new Date(activeTransaction.confirmedAt!);

      const expiresAt =
        activeTransaction.planType === "monthly"
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
  static async canPurchasePlan(
    userId: string,
    planType: UserPlan,
  ): Promise<{
    canPurchase: boolean;
    reason?: string;
    activeSubscription?: {
      planType: UserPlan;
      expiresAt: Date;
    };
  }> {
    if (planType === "free") {
      return { canPurchase: false, reason: "free_plan_cannot_be_purchased" };
    }

    const activeSubscriptionCheck = await this.hasActiveSubscription(
      userId,
      planType,
    );

    if (activeSubscriptionCheck.hasActive) {
      return {
        canPurchase: false,
        reason: "already_have_active_subscription",
        activeSubscription: {
          planType,
          expiresAt: activeSubscriptionCheck.expiresAt!,
        },
      };
    }

    return { canPurchase: true };
  }
}
