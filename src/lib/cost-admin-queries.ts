import { db } from "@/lib/db";
import { user, userVideos, tokenUsage } from "@/lib/db/schema";
import { messages } from "@/lib/db/schema/messages";
import { sql } from "drizzle-orm";

export async function getTopUsersByCost(limit = 10) {
  const result = await db.execute(sql`
    SELECT 
      u.id,
      u.name,
      u.email,
      u.image,
      u.created_at as "createdAt",
      COUNT(DISTINCT m.id) as message_count,
      COUNT(DISTINCT uv.id) as video_count,
      COALESCE(SUM(tu.total_tokens), 0) as total_tokens,
      COALESCE(SUM(tu.total_cost), 0) as total_cost,
      MAX(m.created_at) as last_activity
    FROM "user" u
    LEFT JOIN user_videos uv ON u.id = uv.user_id
    LEFT JOIN messages m ON uv.id = m.user_video_id AND m.role = 'user'
    LEFT JOIN token_usage tu ON uv.id = tu.user_video_id
    GROUP BY u.id, u.name, u.email, u.image, u.created_at
    HAVING COALESCE(SUM(tu.total_cost), 0) > 0
    ORDER BY total_cost DESC
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
    totalTokens: parseInt(row.total_tokens) || 0,
    totalCost: parseFloat(row.total_cost) || 0,
    lastActivity: row.last_activity ? new Date(row.last_activity) : null,
  }));
}

export async function getCostMetrics() {
  const result = await db.execute(sql`
    SELECT 
      COUNT(DISTINCT u.id) as active_users,
      COALESCE(SUM(tu.total_cost), 0) as total_cost,
      COALESCE(SUM(tu.total_tokens), 0) as total_tokens,
      COUNT(DISTINCT tu.id) as total_requests,
      COALESCE(AVG(tu.total_cost), 0) as avg_cost_per_request
    FROM "user" u
    LEFT JOIN user_videos uv ON u.id = uv.user_id
    LEFT JOIN token_usage tu ON uv.id = tu.user_video_id
    WHERE tu.total_cost > 0
  `);

  const row = result.rows[0] as any;
  return {
    activeUsers: parseInt(row.active_users) || 0,
    totalCost: parseFloat(row.total_cost) || 0,
    totalTokens: parseInt(row.total_tokens) || 0,
    totalRequests: parseInt(row.total_requests) || 0,
    avgCostPerRequest: parseFloat(row.avg_cost_per_request) || 0,
  };
}

export async function getUserActivityDetails(userId: string) {
  const [userInfo, userVideos, userConversations] = await Promise.all([
    // Get user basic info and total costs
    db.execute(sql`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.image,
        u.created_at as "createdAt",
        COUNT(DISTINCT uv.id) as video_count,
        COUNT(DISTINCT m.id) as message_count,
        COALESCE(SUM(tu.total_tokens), 0) as total_tokens,
        COALESCE(SUM(tu.total_cost), 0) as total_cost
      FROM "user" u
      LEFT JOIN user_videos uv ON u.id = uv.user_id
      LEFT JOIN messages m ON uv.id = m.user_video_id AND m.role = 'user'
      LEFT JOIN token_usage tu ON uv.id = tu.user_video_id
      WHERE u.id = ${userId}
      GROUP BY u.id, u.name, u.email, u.image, u.created_at
    `),
    
    // Get user videos with costs
    db.execute(sql`
      SELECT 
        v.id,
        v.youtube_id as "youtubeId",
        v.title,
        v.channel_title as "channelTitle",
        v.thumbnail_url as "thumbnailUrl",
        uv.created_at as "addedAt",
        COUNT(DISTINCT m.id) as message_count,
        COALESCE(SUM(tu.total_tokens), 0) as total_tokens,
        COALESCE(SUM(tu.total_cost), 0) as total_cost
      FROM user_videos uv
      INNER JOIN videos v ON uv.youtube_id = v.youtube_id
      LEFT JOIN messages m ON uv.id = m.user_video_id AND m.role = 'user'
      LEFT JOIN token_usage tu ON uv.id = tu.user_video_id
      WHERE uv.user_id = ${userId}
      GROUP BY v.id, v.youtube_id, v.title, v.channel_title, v.thumbnail_url, uv.created_at
      ORDER BY uv.created_at DESC
    `),
    
    // Get recent conversations
    db.execute(sql`
      SELECT DISTINCT
        m.id,
        m.content,
        m.role,
        m.created_at as "createdAt",
        v.title as "videoTitle",
        v.youtube_id as "youtubeId",
        COALESCE(tu.total_tokens, 0) as total_tokens,
        COALESCE(tu.total_cost, 0) as total_cost
      FROM messages m
      INNER JOIN user_videos uv ON m.user_video_id = uv.id
      INNER JOIN videos v ON uv.youtube_id = v.youtube_id
      LEFT JOIN (
        SELECT 
          user_video_id,
          SUM(total_tokens) as total_tokens,
          SUM(total_cost) as total_cost,
          DATE(created_at) as usage_date
        FROM token_usage
        GROUP BY user_video_id, DATE(created_at)
      ) tu ON uv.id = tu.user_video_id AND DATE(m.created_at) = tu.usage_date
      WHERE uv.user_id = ${userId}
      ORDER BY m.created_at DESC
      LIMIT 100
    `)
  ]);

  const user = userInfo.rows[0] as any;
  const videos = userVideos.rows.map((row: any) => ({
    id: row.id,
    youtubeId: row.youtubeId,
    title: row.title,
    channelTitle: row.channelTitle,
    thumbnailUrl: row.thumbnailUrl,
    addedAt: new Date(row.addedAt),
    messageCount: parseInt(row.message_count) || 0,
    totalTokens: parseInt(row.total_tokens) || 0,
    totalCost: parseFloat(row.total_cost) || 0,
  }));

  const conversations = userConversations.rows.map((row: any) => ({
    id: row.id,
    content: row.content,
    role: row.role,
    createdAt: new Date(row.createdAt),
    videoTitle: row.videoTitle,
    youtubeId: row.youtubeId,
    totalTokens: parseInt(row.total_tokens) || 0,
    totalCost: parseFloat(row.total_cost) || 0,
  }));

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: new Date(user.createdAt),
      videoCount: parseInt(user.video_count) || 0,
      messageCount: parseInt(user.message_count) || 0,
      totalTokens: parseInt(user.total_tokens) || 0,
      totalCost: parseFloat(user.total_cost) || 0,
    },
    videos,
    conversations,
  };
}