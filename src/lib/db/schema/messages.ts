import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { InferInsertModel } from "drizzle-orm";
import { userVideos } from "@/lib/db/schema/videos";

const timestampMs = (name: string) =>
  integer(name, { mode: "timestamp_ms" });

export const messages = sqliteTable("messages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userVideoId: integer("user_video_id")
    .notNull()
    .references(() => userVideos.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  role: text("role").notNull(),
  timestamp: integer("timestamp").notNull(),
  createdAt: timestampMs("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestampMs("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export type NewMessage = InferInsertModel<typeof messages>;
