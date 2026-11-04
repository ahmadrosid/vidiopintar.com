import { z } from "zod";
import { transactionsRepository } from "@/lib/db/repository/transactions";

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
  /** MCP transcript calls allowed per paid period, across all of a user's keys. */
  mcpCallsPerPeriod: number;
}

const PLAN_LIMITS: Record<UserPlan, PlanLimits> = {
  free: {
    mcpCallsPerPeriod: 0,
  },
  monthly: {
    mcpCallsPerPeriod: 1_000,
  },
  yearly: {
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
