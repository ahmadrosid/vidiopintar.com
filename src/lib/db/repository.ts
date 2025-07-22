import { db } from "@/lib/db/index"
import { and, desc, eq, InferInsertModel, InferSelectModel, sql } from "drizzle-orm"
import { feedback, messages, sharedVideos, transcriptSegments, userVideos, videos } from "./schema"
import { user } from "./schema/auth"

export { TokenUsageRepository } from "./repository/token-usage"

// Types for users
export type User = InferSelectModel<typeof user>
export type NewUser = InferInsertModel<typeof user>

// Types for user_videos
export type UserVideo = InferSelectModel<typeof userVideos>
export type NewUserVideo = InferInsertModel<typeof userVideos>

// Types for shared_videos
export type SharedVideo = InferSelectModel<typeof sharedVideos>
export type NewSharedVideo = InferInsertModel<typeof sharedVideos>

// Infer types from Drizzle schema
export type Video = InferSelectModel<typeof videos>
export type NewVideo = InferInsertModel<typeof videos>
export type Message = InferSelectModel<typeof messages>
export type NewMessage = InferInsertModel<typeof messages>
export type Feedback = InferSelectModel<typeof feedback>
export type NewFeedback = InferInsertModel<typeof feedback>

export const VideoRepository = {
  // Get all user_videos for a user, joined with video details
  async getAllForUserWithDetails(userId: string) {
    return await db
      .select({
        userVideoId: userVideos.id,
        youtubeId: userVideos.youtubeId,
        title: videos.title,
        channelTitle: videos.channelTitle,
        publishedAt: videos.publishedAt,
        thumbnailUrl: videos.thumbnailUrl,
      })
      .from(userVideos)
      .innerJoin(videos, eq(userVideos.youtubeId, videos.youtubeId))
      .where(eq(userVideos.userId, userId))
      .orderBy(desc(userVideos.createdAt))
  },
  // Get a video by YouTube ID
  async getByYoutubeId(youtubeId: string): Promise<Video | undefined> {
    const result = await db.select().from(videos).where(eq(videos.youtubeId, youtubeId))
    return result[0]
  },

  // Create a new video
  async create(video: NewVideo): Promise<Video> {
    const result = await db.insert(videos).values(video).returning()
    return result[0]
  },

  // Upsert a video (create if not exists, update if exists)
  async upsert(video: NewVideo): Promise<Video> {
    // Check if video exists
    const existingVideo = await this.getByYoutubeId(video.youtubeId)

    if (existingVideo) {
      // Update existing video
      const result = await db
        .update(videos)
        .set({ ...video, updatedAt: new Date() })
        .where(eq(videos.youtubeId, video.youtubeId))
        .returning()
      return result[0]
    } else {
      // Create new video
      return await this.create(video)
    }
  },

  // Fetch all videos
  async getAll(): Promise<Video[]> {
    // Order by creation timestamp descending
    return await db.select().from(videos).orderBy(desc(videos.createdAt))
  },

  async delete(id: number): Promise<void> {
    // check if video is exists if not throw error
    const video = await db.select().from(videos).where(eq(videos.id, id)).limit(1)
    if (video.length === 0) {
      throw new Error("Video not found")
    }
    await db.delete(videos).where(eq(videos.id, id))
  },
}

export const MessageRepository = {
  // Get all messages for a user_video (user-video relationship)
  async getByUserVideoId(userVideoId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.userVideoId, userVideoId))
      .orderBy(messages.timestamp)
  },

  async create(message: NewMessage): Promise<Message> {
    const result = await db.insert(messages).values(message).returning()
    return result[0]
  },
}

export const UserVideoRepository = {
  // Get a user_video by id
  async getById(id: number): Promise<UserVideo | undefined> {
    const result = await db.select().from(userVideos).where(eq(userVideos.id, id))
    return result[0]
  },
  // Delete a user_video by id
  async delete(id: number): Promise<void> {
    await db.delete(userVideos).where(eq(userVideos.id, id))
  },
  // Get a user_video by userId and youtubeId
  async getByUserAndYoutubeId(userId: string, youtubeId: string): Promise<UserVideo | undefined> {
    const result = await db
      .select()
      .from(userVideos)
      .where(and(eq(userVideos.userId, userId), eq(userVideos.youtubeId, youtubeId)))
    return result[0]
  },

  // Create a new user_video
  async create(userVideo: NewUserVideo): Promise<UserVideo> {
    const result = await db.insert(userVideos).values(userVideo).returning()
    return result[0]
  },

  // Upsert a user_video (create if not exists, update if exists)
  async upsert(userVideo: NewUserVideo): Promise<UserVideo> {
    const existingUserVideo = await this.getByUserAndYoutubeId(
      userVideo.userId!,
      userVideo.youtubeId!
    )

    if (existingUserVideo) {
      // Update existing user_video
      const result = await db
        .update(userVideos)
        .set({ summary: userVideo.summary, updatedAt: new Date() })
        .where(eq(userVideos.id, existingUserVideo.id))
        .returning()
      return result[0]
    } else {
      // Create new user_video
      return await this.create({
        ...userVideo,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }
  },

  // Update summary for a user_video
  async updateSummary(id: number, summary: string): Promise<UserVideo | undefined> {
    const result = await db
      .update(userVideos)
      .set({ summary, updatedAt: new Date() })
      .where(eq(userVideos.id, id))
      .returning()
    return result[0]
  },

  // Update quickStartQuestions for a user_video
  async updateQuickStartQuestions(
    id: number,
    quickStartQuestions: string[]
  ): Promise<UserVideo | undefined> {
    const result = await db
      .update(userVideos)
      .set({ quickStartQuestions, updatedAt: new Date() })
      .where(eq(userVideos.id, id))
      .returning()
    return result[0]
  },

  // Get all user_videos for a user
  async getAllByUser(userId: string): Promise<UserVideo[]> {
    return await db
      .select()
      .from(userVideos)
      .where(eq(userVideos.userId, userId))
      .orderBy(desc(userVideos.createdAt))
  },

  // Clear all messages for a user_video
  async clearMessages(userVideoId: number): Promise<void> {
    await db.delete(messages).where(eq(messages.userVideoId, userVideoId))
  },
}

export const TranscriptRepository = {
  // Get all transcript segments for a video
  async getByVideoId(videoId: string) {
    return await db
      .select()
      .from(transcriptSegments)
      .where(eq(transcriptSegments.videoId, videoId))
      .orderBy(transcriptSegments.start)
  },

  // Insert multiple segments (after deleting existing ones)
  async upsertSegments(
    videoId: string,
    segments: Array<{ start: string; end: string; text: string; isChapterStart: boolean }>
  ) {
    await db.delete(transcriptSegments).where(eq(transcriptSegments.videoId, videoId))
    if (segments.length > 0) {
      await db.insert(transcriptSegments).values(
        segments.map((segment) => ({
          videoId,
          start: segment.start,
          end: segment.end,
          text: segment.text,
          isChapterStart: segment.isChapterStart,
        }))
      )
    }
  },
}

export const SharedVideoRepository = {
  // Create a new shared video
  async create(sharedVideo: NewSharedVideo): Promise<SharedVideo> {
    const result = await db.insert(sharedVideos).values(sharedVideo).returning()
    return result[0]
  },

  // Get a shared video by slug
  async getBySlug(slug: string): Promise<SharedVideo | undefined> {
    const result = await db.select().from(sharedVideos).where(eq(sharedVideos.slug, slug))
    return result[0]
  },

  // Get all shared videos by owner ID
  async getByOwnerId(ownerId: string): Promise<SharedVideo[]> {
    return await db
      .select()
      .from(sharedVideos)
      .where(eq(sharedVideos.ownerId, ownerId))
      .orderBy(desc(sharedVideos.createdAt))
  },

  // Get shared video with video details
  async getBySlugWithDetails(slug: string) {
    const result = await db
      .select({
        id: sharedVideos.id,
        youtubeId: sharedVideos.youtubeId,
        slug: sharedVideos.slug,
        ownerId: sharedVideos.ownerId,
        title: videos.title,
        description: videos.description,
        channelTitle: videos.channelTitle,
        publishedAt: videos.publishedAt,
        thumbnailUrl: videos.thumbnailUrl,
        createdAt: sharedVideos.createdAt,
        userVideoId: sharedVideos.userVideoId,
        summary: userVideos.summary,
        quickStartQuestions: userVideos.quickStartQuestions,
      })
      .from(sharedVideos)
      .innerJoin(videos, eq(sharedVideos.youtubeId, videos.youtubeId))
      .innerJoin(userVideos, eq(sharedVideos.userVideoId, userVideos.id))
      .where(eq(sharedVideos.slug, slug))

    return result[0]
  },

  // Delete a shared video
  async delete(id: number): Promise<void> {
    await db.delete(sharedVideos).where(eq(sharedVideos.id, id))
  },

  // Check if a YouTube video is already shared by a specific owner
  async isSharedByOwner(youtubeId: string, ownerId: string): Promise<boolean> {
    const result = await db
      .select()
      .from(sharedVideos)
      .where(and(eq(sharedVideos.youtubeId, youtubeId), eq(sharedVideos.ownerId, ownerId)))

    return result.length > 0
  },
}

export const UserRepository = {
  // Get a user by ID
  async getById(id: string): Promise<User | undefined> {
    const result = await db.select().from(user).where(eq(user.id, id))
    return result[0]
  },

  // Update user's preferred language
  async updatePreferredLanguage(userId: string, language: 'en' | 'id'): Promise<User | undefined> {
    const result = await db
      .update(user)
      .set({ preferredLanguage: language, updatedAt: new Date() })
      .where(eq(user.id, userId))
      .returning()
    return result[0]
  },

  // Get user's preferred language
  async getPreferredLanguage(userId: string): Promise<string | undefined> {
    const result = await db
      .select({ preferredLanguage: user.preferredLanguage })
      .from(user)
      .where(eq(user.id, userId))
    return result[0]?.preferredLanguage
  },
}

export const FeedbackRepository = {
  // Create new feedback
  async create(feedbackData: NewFeedback): Promise<Feedback> {
    const result = await db.insert(feedback).values(feedbackData).returning()
    return result[0]
  },

  // Get all feedback for analytics (admin use)
  async getAll(): Promise<Feedback[]> {
    return await db.select().from(feedback).orderBy(desc(feedback.createdAt))
  },

  // Get feedback by user ID
  async getByUserId(userId: string): Promise<Feedback[]> {
    return await db
      .select()
      .from(feedback)
      .where(eq(feedback.userId, userId))
      .orderBy(desc(feedback.createdAt))
  },

  // Get feedback by type
  async getByType(type: string): Promise<Feedback[]> {
    return await db
      .select()
      .from(feedback)
      .where(eq(feedback.type, type))
      .orderBy(desc(feedback.createdAt))
  },

  // Check if user has already provided feedback for a specific message
  async existsByUserAndMessage(userId: string, messageId: string): Promise<boolean> {
    const result = await db
      .select({ id: feedback.id })
      .from(feedback)
      .where(
        and(
          eq(feedback.userId, userId),
          eq(feedback.type, 'chat_response'),
          // Use SQL to extract messageId from metadata JSON
          sql`${feedback.metadata}->>'messageId' = ${messageId}`
        )
      )
      .limit(1)
    
    return result.length > 0
  },

  // Get feedback by ID
  async getById(id: number): Promise<Feedback | undefined> {
    const result = await db.select().from(feedback).where(eq(feedback.id, id))
    return result[0]
  },

  // Delete feedback by ID
  async delete(id: number): Promise<void> {
    const result = await db.delete(feedback).where(eq(feedback.id, id))
    if (result.rowCount === 0) {
      throw new Error("Feedback not found")
    }
  },
}
