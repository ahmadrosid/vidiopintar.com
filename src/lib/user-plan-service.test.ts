import { afterEach, describe, expect, spyOn, test } from "bun:test";
import { transactionsRepository } from "@/lib/db/repository/transactions";
import type { Transaction } from "@/lib/db/schema";
import { UserPlanService } from "./user-plan-service";

const dayMs = 24 * 60 * 60 * 1000;

function tx(
  planType: string,
  status: string,
  confirmedDaysAgo?: number,
): Transaction {
  return {
    id: "tx",
    userId: "u",
    planType,
    amount: 50_000,
    currency: "IDR",
    paymentMethod: "bank_transfer",
    transactionReference: "ref",
    status,
    paymentSettings: null,
    userAgent: null,
    ipAddress: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    confirmedAt:
      confirmedDaysAgo === undefined
        ? null
        : new Date(Date.now() - confirmedDaysAgo * dayMs),
    expiresAt: null,
  };
}

let spy: ReturnType<typeof spyOn> | undefined;

function withTransactions(rows: Transaction[]) {
  spy = spyOn(
    transactionsRepository,
    "getRecentTransactionsByUserId",
  ).mockResolvedValue(rows);
}

afterEach(() => {
  spy?.mockRestore();
});

describe("getActiveSubscription", () => {
  test("returns null without a confirmed payment", async () => {
    withTransactions([tx("monthly", "pending")]);

    expect(await UserPlanService.getActiveSubscription("u")).toBeNull();
  });

  test("monthly plan expires after 30 days", async () => {
    withTransactions([tx("monthly", "confirmed", 31)]);

    expect(await UserPlanService.getActiveSubscription("u")).toBeNull();
    expect(await UserPlanService.getCurrentPlan("u")).toBe("free");
  });

  test("returns the active period start for the limit counter", async () => {
    const rows = [tx("yearly", "confirmed", 100)];

    withTransactions(rows);

    const subscription = await UserPlanService.getActiveSubscription("u");

    expect(subscription?.plan).toBe("yearly");
    expect(subscription?.startsAt.getTime()).toBe(
      rows[0].confirmedAt?.getTime(),
    );
    expect(UserPlanService.getPlanLimits("yearly").mcpCallsPerPeriod).toBe(
      12_000,
    );
  });
});
