import { db } from '@/lib/db';
import { tokenUsage } from '@/lib/db/schema';
import { eq, sql, desc, and, gte, lte } from 'drizzle-orm';

export class TokenUsageRepository {
  static async create(data: {
    userId: string;
    model: string;
    provider: string;
    operation: string;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    inputCost: string;
    outputCost: string;
    totalCost: string;
    videoId?: string;
    userVideoId?: number;
    requestDuration?: number;
  }) {
    const [result] = await db.insert(tokenUsage).values(data).returning();

    return result;
  }

  static async getTotalUsageByUser(userId: string) {
    const [result] = await db
      .select({
        totalTokens: sql<number>`sum(${tokenUsage.totalTokens})`,
        totalCost: sql<string>`sum(${tokenUsage.totalCost})`,
        totalRequests: sql<number>`count(*)`,
      })
      .from(tokenUsage)
      .where(eq(tokenUsage.userId, userId));
    
    return {
      totalTokens: result?.totalTokens || 0,
      totalCost: parseFloat(result?.totalCost || '0'),
      totalRequests: result?.totalRequests || 0,
    };
  }

  static async getUsageByDateRange(startDate: Date, endDate: Date) {
    return await db
      .select({
        date: sql<string>`date(${tokenUsage.createdAt})`,
        totalTokens: sql<number>`sum(${tokenUsage.totalTokens})`,
        totalCost: sql<string>`sum(${tokenUsage.totalCost})`,
        requests: sql<number>`count(*)`,
      })
      .from(tokenUsage)
      .where(
        and(
          gte(tokenUsage.createdAt, startDate),
          lte(tokenUsage.createdAt, endDate)
        )
      )
      .groupBy(sql`date(${tokenUsage.createdAt})`)
      .orderBy(sql`date(${tokenUsage.createdAt})`);
  }

  static async getUsageByModel() {
    return await db
      .select({
        model: tokenUsage.model,
        provider: tokenUsage.provider,
        totalTokens: sql<number>`sum(${tokenUsage.totalTokens})`,
        totalCost: sql<string>`sum(${tokenUsage.totalCost})`,
        requests: sql<number>`count(*)`,
      })
      .from(tokenUsage)
      .groupBy(tokenUsage.model, tokenUsage.provider)
      .orderBy(desc(sql`sum(${tokenUsage.totalCost})`));
  }

  static async getUsageByOperation() {
    return await db
      .select({
        operation: tokenUsage.operation,
        totalTokens: sql<number>`sum(${tokenUsage.totalTokens})`,
        totalCost: sql<string>`sum(${tokenUsage.totalCost})`,
        requests: sql<number>`count(*)`,
      })
      .from(tokenUsage)
      .groupBy(tokenUsage.operation)
      .orderBy(desc(sql`sum(${tokenUsage.totalCost})`));
  }

  static async getTopUsers(limit = 10) {
    return await db
      .select({
        userId: tokenUsage.userId,
        totalTokens: sql<number>`sum(${tokenUsage.totalTokens})`,
        totalCost: sql<string>`sum(${tokenUsage.totalCost})`,
        requests: sql<number>`count(*)`,
      })
      .from(tokenUsage)
      .groupBy(tokenUsage.userId)
      .orderBy(desc(sql`sum(${tokenUsage.totalCost})`))
      .limit(limit);
  }

  static async getRecentUsage(limit = 100) {
    return await db
      .select()
      .from(tokenUsage)
      .orderBy(desc(tokenUsage.createdAt))
      .limit(limit);
  }
}