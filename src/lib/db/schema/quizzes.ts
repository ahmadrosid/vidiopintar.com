import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { user } from "./auth";
import { userVideos } from "./videos";

const timestampMs = (name: string) =>
  integer(name, { mode: "timestamp_ms" });

export type QuizQuestion = {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  timestampSeconds?: number;
};

export type QuizAnswers = (number | null)[];

export type QuizAttemptStatus = "in_progress" | "completed";

export const videoQuizzes = sqliteTable(
  "video_quizzes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userVideoId: integer("user_video_id")
      .notNull()
      .references(() => userVideos.id, { onDelete: "cascade" }),
    youtubeId: text("youtube_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    questions: text("questions", { mode: "json" })
      .$type<QuizQuestion[]>()
      .notNull(),
    language: text("language").notNull(),
    createdAt: timestampMs("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [index("video_quizzes_user_video_id_idx").on(table.userVideoId)],
);

export const quizAttempts = sqliteTable(
  "quiz_attempts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    quizId: integer("quiz_id")
      .notNull()
      .references(() => videoQuizzes.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: text("status").$type<QuizAttemptStatus>().notNull(),
    currentIndex: integer("current_index").notNull().default(0),
    answers: text("answers", { mode: "json" }).$type<QuizAnswers>().notNull(),
    score: integer("score"),
    completedAt: timestampMs("completed_at"),
    createdAt: timestampMs("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestampMs("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("quiz_attempts_quiz_id_idx").on(table.quizId),
    index("quiz_attempts_user_id_idx").on(table.userId),
  ],
);

export type VideoQuiz = InferSelectModel<typeof videoQuizzes>;
export type NewVideoQuiz = InferInsertModel<typeof videoQuizzes>;
export type QuizAttempt = InferSelectModel<typeof quizAttempts>;
export type NewQuizAttempt = InferInsertModel<typeof quizAttempts>;
