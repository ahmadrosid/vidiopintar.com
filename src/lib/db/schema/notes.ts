import { pgTable, serial, integer, text, varchar, real, timestamp } from "drizzle-orm/pg-core";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { user } from "./auth";
import { userVideos } from "./videos";

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  userVideoId: integer("user_video_id")
    .notNull()
    .references(() => userVideos.id, { onDelete: "cascade" }),
  timestamp: real("timestamp").notNull(), // Video timestamp in seconds (supports decimals)
  text: text("text").notNull(),
  color: varchar("color", { length: 20 }).notNull(), // 'yellow', 'blue', 'green', 'red', 'purple'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Note = InferSelectModel<typeof notes>;
export type NewNote = InferInsertModel<typeof notes>;

