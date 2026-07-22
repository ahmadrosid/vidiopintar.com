import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { user } from "./auth";
import type { RecommendedVideo } from "@/lib/recommended-videos";

const timestampMs = (name: string) =>
  integer(name, { mode: "timestamp_ms" });

export const userRecommendations = sqliteTable(
  "user_recommendations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    /** Calendar day key for the window that starts at 08:00 Asia/Jakarta. */
    periodKey: text("period_key").notNull(),
    videos: text("videos", { mode: "json" })
      .$type<RecommendedVideo[]>()
      .notNull(),
    searchQueries: text("search_queries", { mode: "json" })
      .$type<string[]>()
      .notNull(),
    createdAt: timestampMs("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestampMs("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("user_recommendations_user_id_period_key_idx").on(
      table.userId,
      table.periodKey,
    ),
  ],
);

export type UserRecommendation = InferSelectModel<typeof userRecommendations>;
export type NewUserRecommendation = InferInsertModel<typeof userRecommendations>;
