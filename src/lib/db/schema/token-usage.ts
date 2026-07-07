import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const timestampMs = (name: string) =>
  integer(name, { mode: "timestamp_ms" });

export const tokenUsage = sqliteTable(
  "token_usage",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id").notNull(),
    model: text("model").notNull(),
    provider: text("provider").notNull(),
    operation: text("operation").notNull(),
    inputTokens: integer("input_tokens").notNull().default(0),
    outputTokens: integer("output_tokens").notNull().default(0),
    totalTokens: integer("total_tokens").notNull().default(0),
    inputCost: text("input_cost").notNull().default("0.000000"),
    outputCost: text("output_cost").notNull().default("0.000000"),
    totalCost: text("total_cost").notNull().default("0.000000"),
    videoId: text("video_id"),
    userVideoId: integer("user_video_id"),
    requestDuration: integer("request_duration"),
    createdAt: timestampMs("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestampMs("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("token_usage_user_id_idx").on(table.userId),
    createdAtIdx: index("token_usage_created_at_idx").on(table.createdAt),
    modelIdx: index("token_usage_model_idx").on(table.model),
    operationIdx: index("token_usage_operation_idx").on(table.operation),
  })
);

export type TokenUsage = typeof tokenUsage.$inferSelect;
export type NewTokenUsage = typeof tokenUsage.$inferInsert;
