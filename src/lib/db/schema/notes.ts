import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { user } from "./auth";
import { userVideos } from "./videos";

const timestampMs = (name: string) =>
  integer(name, { mode: "timestamp_ms" });

export const notes = sqliteTable("notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  userVideoId: integer("user_video_id")
    .notNull()
    .references(() => userVideos.id, { onDelete: "cascade" }),
  timestamp: real("timestamp").notNull(),
  text: text("text").notNull(),
  color: text("color").notNull(),
  createdAt: timestampMs("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestampMs("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export type Note = InferSelectModel<typeof notes>;
export type NewNote = InferInsertModel<typeof notes>;
