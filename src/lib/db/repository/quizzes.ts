import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/index";
import {
  quizAttempts,
  videoQuizzes,
  type QuizAnswers,
  type QuizQuestion,
  type VideoQuiz,
  type QuizAttempt,
} from "@/lib/db/schema/quizzes";

export const QuizRepository = {
  async getLatestQuizForUserVideo(
    userVideoId: number,
    userId: string,
  ): Promise<VideoQuiz | undefined> {
    const rows = await db
      .select()
      .from(videoQuizzes)
      .where(
        and(
          eq(videoQuizzes.userVideoId, userVideoId),
          eq(videoQuizzes.userId, userId),
        ),
      )
      .orderBy(desc(videoQuizzes.createdAt))
      .limit(1);
    return rows[0];
  },

  async createQuiz(input: {
    userVideoId: number;
    youtubeId: string;
    userId: string;
    questions: QuizQuestion[];
    language: string;
  }): Promise<VideoQuiz> {
    const rows = await db
      .insert(videoQuizzes)
      .values({
        userVideoId: input.userVideoId,
        youtubeId: input.youtubeId,
        userId: input.userId,
        questions: input.questions,
        language: input.language,
        createdAt: new Date(),
      })
      .returning();
    return rows[0];
  },

  async getAttemptById(
    attemptId: number,
    userId: string,
  ): Promise<QuizAttempt | undefined> {
    const rows = await db
      .select()
      .from(quizAttempts)
      .where(
        and(eq(quizAttempts.id, attemptId), eq(quizAttempts.userId, userId)),
      )
      .limit(1);
    return rows[0];
  },

  async getLatestAttemptForQuiz(
    quizId: number,
    userId: string,
  ): Promise<QuizAttempt | undefined> {
    const rows = await db
      .select()
      .from(quizAttempts)
      .where(
        and(eq(quizAttempts.quizId, quizId), eq(quizAttempts.userId, userId)),
      )
      .orderBy(desc(quizAttempts.createdAt))
      .limit(1);
    return rows[0];
  },

  async getInProgressAttemptForQuiz(
    quizId: number,
    userId: string,
  ): Promise<QuizAttempt | undefined> {
    const rows = await db
      .select()
      .from(quizAttempts)
      .where(
        and(
          eq(quizAttempts.quizId, quizId),
          eq(quizAttempts.userId, userId),
          eq(quizAttempts.status, "in_progress"),
        ),
      )
      .orderBy(desc(quizAttempts.createdAt))
      .limit(1);
    return rows[0];
  },

  async hasCompletedAttemptForUser(userId: string): Promise<boolean> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(quizAttempts)
      .where(
        and(
          eq(quizAttempts.userId, userId),
          eq(quizAttempts.status, "completed"),
        ),
      );
    return (result[0]?.count ?? 0) > 0;
  },

  async createAttempt(input: {
    quizId: number;
    userId: string;
    questionCount: number;
  }): Promise<QuizAttempt> {
    const answers: QuizAnswers = Array.from(
      { length: input.questionCount },
      () => null,
    );
    const rows = await db
      .insert(quizAttempts)
      .values({
        quizId: input.quizId,
        userId: input.userId,
        status: "in_progress",
        currentIndex: 0,
        answers,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return rows[0];
  },

  async updateAttemptProgress(input: {
    attemptId: number;
    userId: string;
    answers: QuizAnswers;
    currentIndex: number;
    status?: "in_progress" | "completed";
    score?: number;
    completedAt?: Date;
  }): Promise<QuizAttempt | undefined> {
    const rows = await db
      .update(quizAttempts)
      .set({
        answers: input.answers,
        currentIndex: input.currentIndex,
        status: input.status,
        score: input.score,
        completedAt: input.completedAt,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(quizAttempts.id, input.attemptId),
          eq(quizAttempts.userId, input.userId),
        ),
      )
      .returning();
    return rows[0];
  },

  async resetAttemptForRetry(
    attemptId: number,
    userId: string,
    questionCount: number,
  ): Promise<QuizAttempt | undefined> {
    const answers: QuizAnswers = Array.from(
      { length: questionCount },
      () => null,
    );
    const rows = await db
      .update(quizAttempts)
      .set({
        answers,
        currentIndex: 0,
        status: "in_progress",
        score: null,
        completedAt: null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(quizAttempts.id, attemptId),
          eq(quizAttempts.userId, userId),
        ),
      )
      .returning();
    return rows[0];
  },
};
