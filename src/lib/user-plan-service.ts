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

const PLAN_LIMITS: Record<PaidPlan, PlanLimits> = {
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
  static getPlanLimits(plan: PaidPlan): PlanLimits {
    return PLAN_LIMITS[plan];
  }

  /**
   * Get when the user's subscription to a specific paid plan expires,
   * or null when they have no active subscription to that plan.
   */
  static async getActivePlanExpiry(
    userId: string,
    planType: PaidPlan,
  ): Promise<Date | null> {
    const recentTransactions =
      await transactionsRepository.getRecentTransactionsByUserId(
        userId,
        PLAN_PERIOD_MS.yearly,
      );

    const now = Date.now();

    for (const tx of recentTransactions) {
      if (
        tx.status !== "confirmed" ||
        !tx.confirmedAt ||
        tx.planType !== planType
      )
        continue;

      const expiresAt = new Date(
        new Date(tx.confirmedAt).getTime() + PLAN_PERIOD_MS[planType],
      );

      if (now <= expiresAt.getTime()) return expiresAt;
    }

    return null;
  }

  /**
   * Check if user can purchase a specific plan
   */
  static async canPurchasePlan(
    userId: string,
    planType: PaidPlan,
  ): Promise<{ canPurchase: true } | { canPurchase: false; expiresAt: Date }> {
    const expiresAt = await this.getActivePlanExpiry(userId, planType);

    return expiresAt
      ? { canPurchase: false, expiresAt }
      : { canPurchase: true };
  }
}
