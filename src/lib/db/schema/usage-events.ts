import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { InferInsertModel } from "drizzle-orm";
import { user } from "./auth";

const timestampMs = (name: string) =>
  integer(name, { mode: "timestamp_ms" });

export const USAGE_EVENT_TYPES = {
  VIDEO_ADDED: "video_added",
  CHAT_MESSAGE: "chat_message",
  QUIZ_GENERATED: "quiz_generated",
} as const;

/** Sentinel youtube_id for account-wide quiz trial usage events */
export const QUIZ_ACCOUNT_YOUTUBE_ID = "__account__";

export type UsageEventType =
  (typeof USAGE_EVENT_TYPES)[keyof typeof USAGE_EVENT_TYPES];

export const userUsageEvents = sqliteTable("user_usage_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull().$type<UsageEventType>(),
  youtubeId: text("youtube_id").notNull(),
  createdAt: timestampMs("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export type UserUsageEvent = InferInsertModel<typeof userUsageEvents>;
