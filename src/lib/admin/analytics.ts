import { and, count, countDistinct, eq, gte, sql, sum } from "drizzle-orm";
import type { SQLiteColumn } from "drizzle-orm/sqlite-core";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/auth";
import { mcpRequestMetrics } from "@/lib/db/schema/mcp";
import { transactions } from "@/lib/db/schema/transactions";
import { USAGE_EVENT_TYPES, userUsageEvents } from "@/lib/db/schema/usage-events";

const dayMs = 86_400_000;

export const ADMIN_ANALYTICS_RANGES = [7, 30, 90] as const;

export type AdminAnalyticsRange = (typeof ADMIN_ANALYTICS_RANGES)[number];

type AdminDailyPoint = { day: number; revenue: number; signups: number; success: number; failed: number };

// CAST truncates the division to whole days, so each row lands on the UTC day start of its timestamp.
const dayBucket = (column: SQLiteColumn) => sql<number>`CAST(${column} / ${dayMs} AS INTEGER) * ${dayMs}`;

export async function getAdminAnalytics(range: AdminAnalyticsRange) {
  const today = Math.floor(Date.now() / dayMs) * dayMs;
  const start = new Date(today - (range - 1) * dayMs);

  const [[{ value: totalUsers }], signupRows, statusRows, revenueRows, planRows, [{ value: revenueAllTime }], mcpRows, [usageTotals]] =
    await Promise.all([
      db.select({ value: count() }).from(user),
      db
        .select({ day: dayBucket(user.createdAt), value: count() })
        .from(user)
        .where(gte(user.createdAt, start))
        .groupBy(dayBucket(user.createdAt)),
      db
        .select({ status: transactions.status, value: count() })
        .from(transactions)
        .where(gte(transactions.createdAt, start))
        .groupBy(transactions.status),
      db
        .select({ day: dayBucket(transactions.confirmedAt), amount: sum(transactions.amount).mapWith(Number) })
        .from(transactions)
        .where(and(eq(transactions.status, "confirmed"), gte(transactions.confirmedAt, start)))
        .groupBy(dayBucket(transactions.confirmedAt)),
      db
        .select({ planType: transactions.planType, value: count() })
        .from(transactions)
        .where(and(eq(transactions.status, "confirmed"), gte(transactions.confirmedAt, start)))
        .groupBy(transactions.planType),
      db
        .select({ value: sum(transactions.amount).mapWith(Number) })
        .from(transactions)
        .where(eq(transactions.status, "confirmed")),
      db
        .select({
          day: dayBucket(mcpRequestMetrics.createdAt),
          success: sql<number>`sum(case when ${mcpRequestMetrics.outcome} = 'success' then 1 else 0 end)`,
          failed: sql<number>`sum(case when ${mcpRequestMetrics.outcome} = 'success' then 0 else 1 end)`,
        })
        .from(mcpRequestMetrics)
        .where(gte(mcpRequestMetrics.createdAt, start))
        .groupBy(dayBucket(mcpRequestMetrics.createdAt)),
      db
        .select({
          videosAdded: sql<number>`sum(case when ${userUsageEvents.eventType} = ${USAGE_EVENT_TYPES.VIDEO_ADDED} then 1 else 0 end)`,
          activeUsers: countDistinct(userUsageEvents.userId),
        })
        .from(userUsageEvents)
        .where(gte(userUsageEvents.createdAt, start)),
    ]);

  const signupsByDay = new Map(signupRows.map((row) => [row.day, row.value]));
  const revenueByDay = new Map(revenueRows.map((row) => [row.day, row.amount ?? 0]));
  const mcpByDay = new Map(mcpRows.map((row) => [row.day, row]));

  const daily: AdminDailyPoint[] = Array.from({ length: range }, (_, index) => {
    const day = today - (range - 1 - index) * dayMs;
    const mcp = mcpByDay.get(day);

    return {
      day,
      revenue: revenueByDay.get(day) ?? 0,
      signups: signupsByDay.get(day) ?? 0,
      success: mcp?.success ?? 0,
      failed: mcp?.failed ?? 0,
    };
  });

  const statusCounts = statusRows.map((row) => ({ status: row.status, value: row.value }));
  const created = statusCounts.reduce((total, row) => total + row.value, 0);
  const confirmed = statusCounts.find((row) => row.status === "confirmed")?.value ?? 0;
  const requests = daily.reduce((total, point) => total + point.success + point.failed, 0);

  return {
    daily,
    statusCounts,
    planCounts: planRows.map((row) => ({ planType: row.planType, value: row.value })),
    totals: {
      totalUsers,
      newUsers: daily.reduce((total, point) => total + point.signups, 0),
      revenueAllTime: revenueAllTime ?? 0,
      revenueRange: daily.reduce((total, point) => total + point.revenue, 0),
      created,
      confirmed,
      conversion: created ? Math.round((confirmed / created) * 100) : null,
      activeUsers: usageTotals?.activeUsers ?? 0,
      videosAdded: usageTotals?.videosAdded ?? 0,
      requests,
      success: daily.reduce((total, point) => total + point.success, 0),
    },
  };
}
