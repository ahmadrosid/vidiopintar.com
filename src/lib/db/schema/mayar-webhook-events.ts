import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const timestampMs = (name: string) =>
  integer(name, { mode: "timestamp_ms" });

export const mayarWebhookEvents = sqliteTable("mayar_webhook_events", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  dedupKey: text("dedup_key").notNull().unique(),
  event: text("event").notNull(),
  mayarTransactionId: text("mayar_transaction_id"),
  mayarMemberId: text("mayar_member_id"),
  payloadSummary: text("payload_summary"),
  processedAt: timestampMs("processed_at").$defaultFn(() => new Date()),
  createdAt: timestampMs("created_at").$defaultFn(() => new Date()),
});

export type MayarWebhookEvent = typeof mayarWebhookEvents.$inferSelect;
export type NewMayarWebhookEvent = typeof mayarWebhookEvents.$inferInsert;
