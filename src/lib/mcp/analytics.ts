import { and, desc, eq, gte, ne, sql, sum } from "drizzle-orm";
import { db } from "@/lib/db";
import { mcpApiKeys, mcpRequestMetrics, mcpUsage } from "@/lib/db/schema";

const dayMs = 86_400_000;

export const ANALYTICS_RANGES = [7, 30, 90] as const;
export type AnalyticsRange = (typeof ANALYTICS_RANGES)[number];
export type HistoryStatus = "all" | "success" | "failed";

export type DailyPoint = { day: number; success: number; failed: number; bytes: number };

export type HistoryRow = {
  id: string;
  createdAt: Date;
  keyName: string;
  videoId: string | null;
  outcome: string;
  durationMs: number;
};

// Days are UTC, matching the "day" quota window in authenticateMcpRequest.
export async function getUserMcpAnalytics(userId: string, range: AnalyticsRange, status: HistoryStatus) {
  const today = Math.floor(Date.now() / dayMs) * dayMs;
  const start = today - (range - 1) * dayMs;
  const ownKey = eq(mcpApiKeys.userId, userId);
  const inRange = gte(mcpRequestMetrics.createdAt, new Date(start));
  // Inline the constant: a bound parameter can make SQLite divide as REAL and skip the floor.
  const dayExpr = sql<number>`(${mcpRequestMetrics.createdAt} / ${sql.raw(String(dayMs))}) * ${sql.raw(String(dayMs))}`;

  const [outcomesByDay, bytesByDay, history] = await Promise.all([
    db
      .select({
        day: dayExpr,
        success: sql<number>`sum(case when ${mcpRequestMetrics.outcome} = 'success' then 1 else 0 end)`,
        failed: sql<number>`sum(case when ${mcpRequestMetrics.outcome} = 'success' then 0 else 1 end)`,
      })
      .from(mcpRequestMetrics)
      .innerJoin(mcpApiKeys, eq(mcpApiKeys.id, mcpRequestMetrics.keyId))
      .where(and(ownKey, inRange))
      .groupBy(dayExpr),
    db
      .select({ day: mcpUsage.periodStart, bytes: sum(mcpUsage.outputBytes).mapWith(Number) })
      .from(mcpUsage)
      .innerJoin(mcpApiKeys, eq(mcpApiKeys.id, mcpUsage.keyId))
      .where(and(ownKey, eq(mcpUsage.window, "day"), gte(mcpUsage.periodStart, start)))
      .groupBy(mcpUsage.periodStart),
    db
      .select({
        id: mcpRequestMetrics.id,
        createdAt: mcpRequestMetrics.createdAt,
        keyName: mcpApiKeys.name,
        videoId: mcpRequestMetrics.videoId,
        outcome: mcpRequestMetrics.outcome,
        durationMs: mcpRequestMetrics.durationMs,
      })
      .from(mcpRequestMetrics)
      .innerJoin(mcpApiKeys, eq(mcpApiKeys.id, mcpRequestMetrics.keyId))
      .where(
        and(
          ownKey,
          inRange,
          status === "success" ? eq(mcpRequestMetrics.outcome, "success") : undefined,
          status === "failed" ? ne(mcpRequestMetrics.outcome, "success") : undefined,
        ),
      )
      .orderBy(desc(mcpRequestMetrics.createdAt))
      .limit(50),
  ]);

  const outcomes = new Map(outcomesByDay.map((row) => [Number(row.day), row]));
  const bytes = new Map(bytesByDay.map((row) => [Number(row.day), row.bytes]));
  const daily: DailyPoint[] = Array.from({ length: range }, (_, index) => {
    const day = start + index * dayMs;
    const row = outcomes.get(day);
    return { day, success: Number(row?.success ?? 0), failed: Number(row?.failed ?? 0), bytes: bytes.get(day) ?? 0 };
  });

  const success = daily.reduce((total, point) => total + point.success, 0);
  const failed = daily.reduce((total, point) => total + point.failed, 0);
  // Median latency of successful calls, read as the middle row so we never load every duration.
  const [median] = success
    ? await db
        .select({ durationMs: mcpRequestMetrics.durationMs })
        .from(mcpRequestMetrics)
        .innerJoin(mcpApiKeys, eq(mcpApiKeys.id, mcpRequestMetrics.keyId))
        .where(and(ownKey, inRange, eq(mcpRequestMetrics.outcome, "success")))
        .orderBy(mcpRequestMetrics.durationMs)
        .limit(1)
        .offset(Math.floor(success / 2))
    : [];

  return {
    daily,
    totals: {
      requests: success + failed,
      success,
      failed,
      bytes: daily.reduce((total, point) => total + point.bytes, 0),
      medianMs: median?.durationMs ?? null,
    },
    history: history satisfies HistoryRow[],
  };
}
