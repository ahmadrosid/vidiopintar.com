import { createHash, randomUUID } from "node:crypto";
import { and, eq, gt, isNull, lt, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  mcpApiKeys,
  mcpPlanUsage,
  mcpRequestMetrics,
  mcpTranscriptCache,
  mcpUsage,
} from "@/lib/db/schema";
import { UserPlanService } from "@/lib/user-plan-service";
import { McpServiceError } from "./errors";
import { toServiceError } from "./transcript-errors";
import { getTranscriptPage } from "./transcript";
import { normalizeVideoReference } from "./video-reference";

/**
 * Shared by the MCP server (/api/mcp) and the REST API (/api/v1/transcript):
 * API key authentication, per-key rate limits, plan usage, output limits and
 * request metrics. Both surfaces count against the same limits.
 */

const minuteMs = 60_000;

const dayMs = 86_400_000;

let lastCleanupAt = 0;

async function cleanupExpiredMcpData(now: number) {
  if (now - lastCleanupAt < 6 * 60 * 60 * 1000) return;
  lastCleanupAt = now;

  try {
    await db
      .delete(mcpTranscriptCache)
      .where(lt(mcpTranscriptCache.expiresAt, new Date(now)));
    await db
      .delete(mcpRequestMetrics)
      .where(lt(mcpRequestMetrics.createdAt, new Date(now - 90 * dayMs)));
    await db.delete(mcpUsage).where(lt(mcpUsage.periodStart, now - 90 * dayMs));
    await db
      .delete(mcpPlanUsage)
      .where(lt(mcpPlanUsage.periodStart, now - 400 * dayMs));
    await db
      .delete(mcpApiKeys)
      .where(lt(mcpApiKeys.revokedAt, new Date(now - 90 * dayMs)));
  } catch {}
}

export type ApiKeyIdentity = { id: string; token: string };

/**
 * Checks the bearer API key and counts the request against the key's
 * per-minute and per-day request limits.
 *
 * Returns null for a missing, malformed or revoked key. Throws
 * USAGE_LIMIT_EXCEEDED when a request limit is reached.
 */
export async function authenticateApiKey(
  request: Request,
): Promise<ApiKeyIdentity | null> {
  const token = request.headers
    .get("authorization")
    ?.match(/^Bearer\s+(.+)$/i)?.[1];

  if (!token || !/^vpt_live_[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const keyHash = createHash("sha256").update(token).digest("hex");

  const key = await db.query.mcpApiKeys.findFirst({
    where: and(eq(mcpApiKeys.keyHash, keyHash), isNull(mcpApiKeys.revokedAt)),
  });

  if (!key) return null;

  const now = Date.now();
  await cleanupExpiredMcpData(now);
  const minute = Math.floor(now / minuteMs) * minuteMs;
  const day = Math.floor(now / dayMs) * dayMs;
  const updatedAt = new Date(now);

  const recordUsage = async (
    window: "minute" | "day",
    periodStart: number,
    max: number,
  ) => {
    const [usage] = await db
      .insert(mcpUsage)
      .values({
        keyId: key.id,
        window,
        periodStart,
        requests: 1,
        updatedAt,
      })
      .onConflictDoUpdate({
        target: [mcpUsage.keyId, mcpUsage.window, mcpUsage.periodStart],
        set: { requests: sql`${mcpUsage.requests} + 1`, updatedAt },
        setWhere: lt(mcpUsage.requests, max),
      })
      .returning({ requests: mcpUsage.requests });

    if (!usage) throw new McpServiceError("USAGE_LIMIT_EXCEEDED", true, 60);
  };

  await recordUsage("minute", minute, key.requestsPerMinute);
  await recordUsage("day", day, key.requestsPerDay);

  return { id: key.id, token };
}

export type TranscriptResult = Awaited<ReturnType<typeof getTranscriptPage>>;

/**
 * Runs one transcript call for an authenticated key: counts it against the
 * owner's plan, fetches the page, counts output bytes and records the
 * request for the dashboard. Failed calls are refunded to the plan.
 *
 * Never throws; errors come back as McpServiceError values.
 */
export async function runTranscriptCall(
  identity: ApiKeyIdentity,
  input: { video?: string; language?: string; cursor?: string },
  measureOutput: (result: TranscriptResult) => number,
): Promise<
  { ok: true; result: TranscriptResult } | { ok: false; error: McpServiceError }
> {
  const { video, language, cursor } = input;
  const startedAt = Date.now();
  let refundPlanCall: (() => Promise<void>) | undefined;

  try {
    refundPlanCall = await consumePlanCall(identity.id);

    const result = await getTranscriptPage({
      video: video ?? "",
      language,
      cursor,
      token: identity.token,
    });

    await addOutputUsage(identity.id, measureOutput(result));
    await recordRequestMetric(
      identity.id,
      startedAt,
      "success",
      !result.next_cursor,
      !cursor,
      result.video_id,
    );

    return { ok: true, result };
  } catch (error) {
    // Failed calls don't count against the plan.
    await refundPlanCall?.();

    if (error instanceof McpServiceError) {
      await recordRequestMetric(
        identity.id,
        startedAt,
        error.code,
        false,
        !cursor &&
          ![
            "INVALID_VIDEO_REFERENCE",
            "PLAN_REQUIRED",
            "USAGE_LIMIT_EXCEEDED",
          ].includes(error.code),
        requestVideoId(video),
      );

      return { ok: false, error };
    }

    const mapped = toServiceError(
      error instanceof Error ? error : new Error(String(error)),
    );

    await recordRequestMetric(
      identity.id,
      startedAt,
      mapped.code,
      false,
      !cursor,
      requestVideoId(video),
    );

    return { ok: false, error: mapped };
  }
}

/** The JSON error body shared by MCP tool errors and REST error responses. */
export function serviceErrorBody(error: McpServiceError) {
  return {
    error_code: error.code,
    retryable: error.retryable,
    retry_after_seconds: error.retryAfter,
    message: error.message,
  };
}

function requestVideoId(video?: string) {
  if (!video) return null;

  try {
    return normalizeVideoReference(video);
  } catch {
    return null;
  }
}

async function recordRequestMetric(
  keyId: string,
  startedAt: number,
  outcome: string,
  transcriptComplete = false,
  providerAttempt = false,
  videoId: string | null = null,
) {
  if (!keyId) return;

  try {
    await db.insert(mcpRequestMetrics).values({
      id: randomUUID(),
      keyId,
      createdAt: new Date(),
      durationMs: Math.max(0, Date.now() - startedAt),
      outcome,
      providerAttempt: providerAttempt ? 1 : 0,
      transcriptComplete: transcriptComplete ? 1 : 0,
      videoId,
    });
  } catch {}
}

/**
 * Count one transcript call against the key owner's paid plan. Calls are
 * summed across all of the user's keys for the current paid period, and
 * stop working once the plan expires. Keys without an owner are operator
 * keys made with scripts/mcp-key.mjs and are not plan-limited.
 *
 * Returns a function that gives the call back, for when the request fails.
 */
async function consumePlanCall(
  keyId: string,
): Promise<(() => Promise<void>) | undefined> {
  const key = await db.query.mcpApiKeys.findFirst({
    where: eq(mcpApiKeys.id, keyId),
  });

  if (!key) throw new McpServiceError("INVALID_CREDENTIALS");

  if (!key.userId) return;

  const subscription = await UserPlanService.getActiveSubscription(key.userId);

  if (!subscription) throw new McpServiceError("PLAN_REQUIRED");

  const max = UserPlanService.getPlanLimits(
    subscription.plan,
  ).mcpCallsPerPeriod;

  const updatedAt = new Date();

  const [usage] = await db
    .insert(mcpPlanUsage)
    .values({
      userId: key.userId,
      periodStart: subscription.startsAt.getTime(),
      calls: 1,
      updatedAt,
    })
    .onConflictDoUpdate({
      target: [mcpPlanUsage.userId, mcpPlanUsage.periodStart],
      set: { calls: sql`${mcpPlanUsage.calls} + 1`, updatedAt },
      setWhere: lt(mcpPlanUsage.calls, max),
    })
    .returning({ calls: mcpPlanUsage.calls });

  if (!usage) throw new McpServiceError("USAGE_LIMIT_EXCEEDED");

  const userId = key.userId;
  const periodStart = subscription.startsAt.getTime();

  return async () => {
    try {
      await db
        .update(mcpPlanUsage)
        .set({ calls: sql`${mcpPlanUsage.calls} - 1`, updatedAt: new Date() })
        .where(
          and(
            eq(mcpPlanUsage.userId, userId),
            eq(mcpPlanUsage.periodStart, periodStart),
            gt(mcpPlanUsage.calls, 0),
          ),
        );
    } catch {}
  };
}

async function addOutputUsage(keyId: string, bytes: number) {
  if (!keyId) return;
  const day = Math.floor(Date.now() / dayMs) * dayMs;

  const key = await db.query.mcpApiKeys.findFirst({
    where: eq(mcpApiKeys.id, keyId),
  });

  if (!key) throw new McpServiceError("INVALID_CREDENTIALS");

  const [usage] = await db
    .insert(mcpUsage)
    .values({
      keyId,
      window: "day",
      periodStart: day,
      outputBytes: bytes,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [mcpUsage.keyId, mcpUsage.window, mcpUsage.periodStart],
      set: {
        outputBytes: sql`${mcpUsage.outputBytes} + ${bytes}`,
        updatedAt: new Date(),
      },
      setWhere: sql`${mcpUsage.outputBytes} + ${bytes} <= ${key.bytesPerDay}`,
    })
    .returning({ outputBytes: mcpUsage.outputBytes });

  if (!usage) throw new McpServiceError("USAGE_LIMIT_EXCEEDED");
}
