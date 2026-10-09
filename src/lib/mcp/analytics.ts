import { and, count, desc, eq, gte, ne, sql, sum } from "drizzle-orm";
import { db } from "@/lib/db";
import { mcpApiKeys, mcpRequestMetrics, mcpUsage } from "@/lib/db/schema";

const dayMs = 86_400_000;

export const ANALYTICS_RANGES = [7, 30, 90] as const;

export type AnalyticsRange = (typeof ANALYTICS_RANGES)[number];

export type HistoryStatus = "all" | "success" | "failed";

type DailyPoint = { day: number; success: number; failed: number; bytes: number };

type HistoryRow = {
  id: string;
  createdAt: Date;
  keyName: string;
  videoId: string | null;
  outcome: string;
  durationMs: number;
};

export async function getUserMcpAnalytics(userId: string, range: AnalyticsRange, status: HistoryStatus) {
  const today = Math.floor(Date.now() / dayMs) * dayMs;
  const start = today - (range - 1) * dayMs;
  const ownKey = eq(mcpApiKeys.userId, userId);
  const inRange = gte(mcpRequestMetrics.createdAt, new Date(start));
  // CAST truncates the division to whole days, so the floor holds with the constant bound as a parameter.
  const dayExpr = sql<number>`CAST(${mcpRequestMetrics.createdAt} / ${dayMs} AS INTEGER) * ${dayMs}`;

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

export const LOG_PAGE_SIZE = 50;

export async function getUserMcpLogs(userId: string, outcome: string, page: number) {
  const ownKey = eq(mcpApiKeys.userId, userId);

  const outcomeFilter =
    outcome === "all"
      ? undefined
      : outcome === "failed"
        ? ne(mcpRequestMetrics.outcome, "success")
        : eq(mcpRequestMetrics.outcome, outcome);

  const where = and(ownKey, outcomeFilter);

  const [rows, [{ total }]] = await Promise.all([
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
      .where(where)
      .orderBy(desc(mcpRequestMetrics.createdAt), desc(mcpRequestMetrics.id))
      .limit(LOG_PAGE_SIZE)
      .offset(page * LOG_PAGE_SIZE),
    db
      .select({ total: count() })
      .from(mcpRequestMetrics)
      .innerJoin(mcpApiKeys, eq(mcpApiKeys.id, mcpRequestMetrics.keyId))
      .where(where),
  ]);

  return { rows, total: Number(total) };
}
