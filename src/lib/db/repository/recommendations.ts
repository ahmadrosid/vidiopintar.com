import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/index";
import {
  userRecommendations,
  type UserRecommendation,
} from "@/lib/db/schema/recommendations";
import type { RecommendedVideo } from "@/lib/recommended-videos";

export const RecommendationRepository = {
  async getByUserAndPeriod(
    userId: string,
    periodKey: string,
  ): Promise<UserRecommendation | undefined> {
    const rows = await db
      .select()
      .from(userRecommendations)
      .where(
        and(
          eq(userRecommendations.userId, userId),
          eq(userRecommendations.periodKey, periodKey),
        ),
      )
      .limit(1);
    return rows[0];
  },

  async upsertForPeriod(input: {
    userId: string;
    periodKey: string;
    videos: RecommendedVideo[];
    searchQueries: string[];
  }): Promise<UserRecommendation> {
    const rows = await db
      .insert(userRecommendations)
      .values({
        userId: input.userId,
        periodKey: input.periodKey,
        videos: input.videos,
        searchQueries: input.searchQueries,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [
          userRecommendations.userId,
          userRecommendations.periodKey,
        ],
        set: {
          videos: input.videos,
          searchQueries: input.searchQueries,
          updatedAt: new Date(),
        },
      })
      .returning();
    return rows[0]!;
  },
};
