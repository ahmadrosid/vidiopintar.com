import { db } from "@/lib/db";
import { executeQuery } from "@/lib/db/execute";
import { user, videos, userVideos, tokenUsage } from "@/lib/db/schema";
import { messages } from "@/lib/db/schema/messages";
import { sql } from "drizzle-orm";
import { TokenUsageRepository } from "@/lib/db/repository";

export type TimeRange = "7d" | "1m" | "3m";

export async function getAdminMetrics() {
  const [totalUsers, totalVideos, totalUserVideos, totalMessages, totalTokenUsage] = await Promise.all([
    db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(user),
    db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(videos),
    db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(userVideos),
    db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(messages),
    db.select({
      totalTokens: sql<number>`sum(${tokenUsage.totalTokens})`,
      totalCost: sql<string>`sum(${tokenUsage.totalCost})`,
      totalRequests: sql<number>`count(*)`,
    }).from(tokenUsage),
  ]);

  return {
    totalUsers: totalUsers[0]?.count ?? 0,
    totalVideos: totalVideos[0]?.count ?? 0,
    totalUserVideos: totalUserVideos[0]?.count ?? 0,
    totalMessages: totalMessages[0]?.count ?? 0,
    totalTokens: totalTokenUsage[0]?.totalTokens ?? 0,
    totalTokenCost: parseFloat(totalTokenUsage[0]?.totalCost ?? "0"),
    totalTokenRequests: totalTokenUsage[0]?.totalRequests ?? 0,
  };
}

export async function getTokenUsageData(timeRange: TimeRange) {
  const days = timeRange === "7d" ? 7 : timeRange === "1m" ? 30 : 90;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await TokenUsageRepository.getUsageByDateRange(startDate, new Date());
}

export async function getTokenUsageByModel() {
  return await TokenUsageRepository.getUsageByModel();
}

export async function getTokenUsageByOperation() {
  return await TokenUsageRepository.getUsageByOperation();
}

export async function getTopTokenUsers(limit = 10) {
  return await TokenUsageRepository.getTopUsers(limit);
}

export async function getUserGrowthData(timeRange: TimeRange) {
  const daysBack = timeRange === "7d" ? 7 : timeRange === "1m" ? 30 : 90;

  const result = await db
    .select({
      date: sql<string>`date(${user.createdAt})`,
      count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(user)
    .where(sql`${user.createdAt} >= datetime('now', ${sql.raw(`'-${daysBack} days'`)})`)
    .groupBy(sql`date(${user.createdAt})`)
    .orderBy(sql`date(${user.createdAt})`);

  return result.map((row) => ({
    date: row.date,
    users: row.count,
  }));
}

export async function getVideoAdditionsData(timeRange: TimeRange) {
  const daysBack = timeRange === "7d" ? 7 : timeRange === "1m" ? 30 : 90;

  const result = await db
    .select({
      date: sql<string>`date(${videos.createdAt})`,
      count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(videos)
    .where(sql`${videos.createdAt} >= datetime('now', ${sql.raw(`'-${daysBack} days'`)})`)
    .groupBy(sql`date(${videos.createdAt})`)
    .orderBy(sql`date(${videos.createdAt})`);

  return result.map((row) => ({
    date: row.date,
    videos: row.count,
  }));
}

export async function getLatestVideos(limit = 5) {
  const result = await db
    .select({
      id: videos.id,
      youtubeId: videos.youtubeId,
      title: videos.title,
      channelTitle: videos.channelTitle,
      thumbnailUrl: videos.thumbnailUrl,
      createdAt: videos.createdAt,
    })
    .from(videos)
    .orderBy(sql`${videos.createdAt} DESC`)
    .limit(limit);

  return result;
}

export async function getTopUsers(limit = 6) {
  const result = await executeQuery(sql`
    SELECT 
      u.id,
      u.name,
      u.email,
      u.image,
      u.created_at as "createdAt",
      COUNT(DISTINCT m.id) as message_count,
      COUNT(DISTINCT uv.id) as video_count,
      MAX(m.created_at) as last_activity,
      COALESCE(SUM(tu.total_tokens), 0) as total_tokens
    FROM "user" u
    LEFT JOIN user_videos uv ON u.id = uv.user_id
    LEFT JOIN messages m ON uv.id = m.user_video_id AND m.role = 'user' AND date(m.created_at) = date('now')
    LEFT JOIN token_usage tu ON uv.id = tu.user_video_id AND date(tu.created_at) = date('now')
    GROUP BY u.id, u.name, u.email, u.image, u.created_at
    ORDER BY 
      message_count DESC,
      video_count DESC,
      last_activity DESC
    LIMIT ${limit}
  `);

  return result.rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    image: row.image,
    createdAt: new Date(row.createdAt),
    messageCount: parseInt(row.message_count) || 0,
    videoCount: parseInt(row.video_count) || 0,
    lastActivity: row.last_activity ? new Date(row.last_activity) : null,
    totalTokens: parseInt(row.total_tokens) || 0,
  }));
}

export async function getLatestMessages(limit = 6) {
  const result = await executeQuery(sql`
    WITH recent_users AS (
      SELECT DISTINCT uv.user_id, MAX(m.created_at) as last_message_at
      FROM messages m
      INNER JOIN user_videos uv ON m.user_video_id = uv.id
      WHERE m.role = 'user'
      GROUP BY uv.user_id
      ORDER BY last_message_at DESC
      LIMIT 3
    ),
    ranked_messages AS (
      SELECT 
        m.id,
        m.content,
        m.role,
        m.created_at,
        m.user_video_id,
        v.title as video_title,
        v.youtube_id,
        u.name as user_name,
        ROW_NUMBER() OVER (PARTITION BY uv.user_id ORDER BY m.created_at DESC) as rn
      FROM messages m
      INNER JOIN user_videos uv ON m.user_video_id = uv.id
      INNER JOIN videos v ON uv.youtube_id = v.youtube_id
      INNER JOIN "user" u ON uv.user_id = u.id
      INNER JOIN recent_users ru ON uv.user_id = ru.user_id
      WHERE m.role = 'user'
    )
    SELECT 
      id,
      content,
      role,
      created_at as "createdAt",
      user_video_id as "userVideoId",
      video_title as "videoTitle",
      youtube_id as "youtubeId",
      user_name as "userName"
    FROM ranked_messages
    WHERE rn <= 2
    ORDER BY created_at DESC
    LIMIT ${limit}
  `);

  return result.rows.map((row: any) => ({
    id: row.id,
    content: row.content,
    role: row.role,
    createdAt: new Date(row.createdAt),
    userVideoId: row.userVideoId,
    videoTitle: row.videoTitle,
    youtubeId: row.youtubeId,
    userName: row.userName,
  }));
}
