import { eq } from "drizzle-orm";
import { db } from "../index";
import {
  mayarWebhookEvents,
  type MayarWebhookEvent,
  type NewMayarWebhookEvent,
} from "../schema/mayar-webhook-events";

export class MayarWebhookEventsRepository {
  /**
   * Insert event if dedup key is new. Returns null when duplicate.
   */
  async tryInsert(
    data: Omit<NewMayarWebhookEvent, "id" | "createdAt" | "processedAt">,
  ): Promise<MayarWebhookEvent | null> {
    const existing = await db
      .select()
      .from(mayarWebhookEvents)
      .where(eq(mayarWebhookEvents.dedupKey, data.dedupKey))
      .limit(1);

    if (existing[0]) {
      return null;
    }

    const result = await db.insert(mayarWebhookEvents).values(data).returning();
    return result[0] ?? null;
  }
}

export const mayarWebhookEventsRepository = new MayarWebhookEventsRepository();
