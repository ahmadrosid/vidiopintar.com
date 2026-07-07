import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { user } from "./auth";

const timestampMs = (name: string) =>
  integer(name, { mode: "timestamp_ms" });

export const videos = sqliteTable("videos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  youtubeId: text("youtube_id").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  channelTitle: text("channel_title"),
  publishedAt: timestampMs("published_at"),
  thumbnailUrl: text("thumbnail_url"),
  createdAt: timestampMs("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestampMs("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const userVideos = sqliteTable(
  "user_videos",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    youtubeId: text("youtube_id")
      .notNull()
      .references(() => videos.youtubeId, { onDelete: "cascade" }),
    summary: text("summary"),
    quickStartQuestions: text("quick_start_questions", { mode: "json" }).$type<
      string[]
    >(),
    createdAt: timestampMs("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestampMs("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("user_videos_user_id_youtube_id_idx").on(
      table.userId,
      table.youtubeId
    ),
  ]
);

export const sharedVideos = sqliteTable("shared_videos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  youtubeId: text("youtube_id")
    .notNull()
    .references(() => videos.youtubeId, { onDelete: "cascade" }),
  userVideoId: integer("user_video_id")
    .notNull()
    .references(() => userVideos.id, { onDelete: "cascade" }),
  slug: text("slug").notNull().unique(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestampMs("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestampMs("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const transcriptSegments = sqliteTable("transcript_segments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  videoId: text("video_id").notNull(),
  start: text("start").notNull(),
  end: text("end").notNull(),
  text: text("text").notNull(),
  isChapterStart: integer("is_chapter_start", { mode: "boolean" }).notNull(),
});

export const feedback = sqliteTable("feedback", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  rating: text("rating").notNull(),
  comment: text("comment"),
  metadata: text("metadata", { mode: "json" }).$type<{
    videoId?: string;
    messageId?: string;
    page?: string;
    userAgent?: string;
  }>(),
  createdAt: timestampMs("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
});
