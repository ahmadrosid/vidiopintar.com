import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

const timestampMs = (name: string) => integer(name, { mode: "timestamp_ms" });

export const mcpApiKeys = sqliteTable("mcp_api_keys", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  prefix: text("prefix").notNull().unique(),
  keyHash: text("key_hash").notNull().unique(),
  requestsPerMinute: integer("requests_per_minute").notNull().default(30),
  requestsPerDay: integer("requests_per_day").notNull().default(1000),
  bytesPerDay: integer("bytes_per_day").notNull().default(10_000_000),
  createdAt: timestampMs("created_at").notNull(),
  revokedAt: timestampMs("revoked_at"),
});

export const mcpUsage = sqliteTable(
  "mcp_usage",
  {
    keyId: text("key_id")
      .notNull()
      .references(() => mcpApiKeys.id, { onDelete: "cascade" }),
    window: text("window").notNull(),
    periodStart: integer("period_start").notNull(),
    requests: integer("requests").notNull().default(0),
    outputBytes: integer("output_bytes").notNull().default(0),
    updatedAt: timestampMs("updated_at").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.keyId, table.window, table.periodStart] }),
    index("mcp_usage_period_start_idx").on(table.periodStart),
  ],
);

export const mcpTranscriptCache = sqliteTable(
  "mcp_transcript_cache",
  {
    videoId: text("video_id").notNull(),
    language: text("language").notNull(),
    response: text("response", { mode: "json" })
      .$type<{
        video_id: string;
        language: string;
        transcript: Array<{ text: string; start: number; duration: number }>;
        metadata?: {
          title?: string;
          author_name?: string;
          author_url?: string;
          thumbnail_url?: string;
        };
      }>()
      .notNull(),
    expiresAt: timestampMs("expires_at").notNull(),
    updatedAt: timestampMs("updated_at").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.videoId, table.language] }),
    index("mcp_transcript_cache_expires_at_idx").on(table.expiresAt),
  ],
);
