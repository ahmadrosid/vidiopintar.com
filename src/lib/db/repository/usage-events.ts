import { and, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "@/lib/db/index";
import {
  QUIZ_ACCOUNT_YOUTUBE_ID,
  USAGE_EVENT_TYPES,
  userUsageEvents,
} from "@/lib/db/schema/usage-events";

function getTodayRange() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return { today, tomorrow };
}

export const UsageEventRepository = {
  async countVideosAddedToday(userId: string): Promise<number> {
    const { today, tomorrow } = getTodayRange();
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(userUsageEvents)
      .where(
        and(
          eq(userUsageEvents.userId, userId),
          eq(userUsageEvents.eventType, USAGE_EVENT_TYPES.VIDEO_ADDED),
          gte(userUsageEvents.createdAt, today),
          lt(userUsageEvents.createdAt, tomorrow),
        ),
      );
    return result[0]?.count ?? 0;
  },

  async hasVideoAddedToday(userId: string, youtubeId: string): Promise<boolean> {
    const { today, tomorrow } = getTodayRange();
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(userUsageEvents)
      .where(
        and(
          eq(userUsageEvents.userId, userId),
          eq(userUsageEvents.youtubeId, youtubeId),
          eq(userUsageEvents.eventType, USAGE_EVENT_TYPES.VIDEO_ADDED),
          gte(userUsageEvents.createdAt, today),
          lt(userUsageEvents.createdAt, tomorrow),
        ),
      );
    return (result[0]?.count ?? 0) > 0;
  },

  async recordVideoAdded(userId: string, youtubeId: string): Promise<void> {
    if (await this.hasVideoAddedToday(userId, youtubeId)) {
      return;
    }

    await db.insert(userUsageEvents).values({
      userId,
      youtubeId,
      eventType: USAGE_EVENT_TYPES.VIDEO_ADDED,
      createdAt: new Date(),
    });
  },

  async countChatMessages(userId: string, youtubeId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(userUsageEvents)
      .where(
        and(
          eq(userUsageEvents.userId, userId),
          eq(userUsageEvents.youtubeId, youtubeId),
          eq(userUsageEvents.eventType, USAGE_EVENT_TYPES.CHAT_MESSAGE),
        ),
      );
    return result[0]?.count ?? 0;
  },

  async recordChatMessage(userId: string, youtubeId: string): Promise<void> {
    await db.insert(userUsageEvents).values({
      userId,
      youtubeId,
      eventType: USAGE_EVENT_TYPES.CHAT_MESSAGE,
      createdAt: new Date(),
    });
  },

  async hasQuizGenerated(userId: string): Promise<boolean> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(userUsageEvents)
      .where(
        and(
          eq(userUsageEvents.userId, userId),
          eq(userUsageEvents.eventType, USAGE_EVENT_TYPES.QUIZ_GENERATED),
        ),
      );
    return (result[0]?.count ?? 0) > 0;
  },

  /** Reserve account-wide free quiz trial. Returns false if already consumed. */
  async tryReserveQuizGeneration(userId: string): Promise<boolean> {
    try {
      await db.insert(userUsageEvents).values({
        userId,
        youtubeId: QUIZ_ACCOUNT_YOUTUBE_ID,
        eventType: USAGE_EVENT_TYPES.QUIZ_GENERATED,
        createdAt: new Date(),
      });
      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);
      if (
        message.includes("UNIQUE constraint failed") ||
        message.includes("unique constraint")
      ) {
        return false;
      }
      throw error;
    }
  },

  async releaseQuizGeneration(userId: string): Promise<void> {
    await db
      .delete(userUsageEvents)
      .where(
        and(
          eq(userUsageEvents.userId, userId),
          eq(userUsageEvents.eventType, USAGE_EVENT_TYPES.QUIZ_GENERATED),
          eq(userUsageEvents.youtubeId, QUIZ_ACCOUNT_YOUTUBE_ID),
        ),
      );
  },
};
