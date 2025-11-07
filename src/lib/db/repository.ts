import { db } from "@/lib/db/index"
import { and, desc, eq, InferInsertModel, InferSelectModel, sql } from "drizzle-orm"
import { feedback, messages, notes, sharedVideos, transcriptSegments, userVideos, videos } from "./schema"
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
export type Note = InferSelectModel<typeof notes>
export type NewNote = InferInsertModel<typeof notes>
export type Feedback = InferSelectModel<typeof feedback>
export type NewFeedback = InferInsertModel<typeof feedback>

export const VideoRepository = {
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
  async getByYoutubeId(youtubeId: string): Promise<Video | undefined> {
    const result = await db.select().from(videos).where(eq(videos.youtubeId, youtubeId))
    return result[0]
  },

  async create(video: NewVideo): Promise<Video> {
    const result = await db.insert(videos).values(video).returning()
    return result[0]
  },

  async upsert(video: NewVideo): Promise<Video> {
    const existingVideo = await this.getByYoutubeId(video.youtubeId)

    if (existingVideo) {
      const result = await db
        .update(videos)
        .set({ ...video, updatedAt: new Date() })
        .where(eq(videos.youtubeId, video.youtubeId))
        .returning()
      return result[0]
    } else {
      return await this.create(video)
    }
  },

  async getAll(): Promise<Video[]> {
    return await db.select().from(videos).orderBy(desc(videos.createdAt))
  },

  async delete(id: number): Promise<void> {
    const video = await db.select().from(videos).where(eq(videos.id, id)).limit(1)
    if (video.length === 0) {
      throw new Error("Video not found")
    }
    await db.delete(videos).where(eq(videos.id, id))
  },
}

export const MessageRepository = {
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

export const NoteRepository = {
  async getByUserVideoId(userVideoId: number): Promise<Note[]> {
    return await db
      .select()
      .from(notes)
      .where(eq(notes.userVideoId, userVideoId))
      .orderBy(notes.timestamp)
  },

  async create(note: NewNote): Promise<Note> {
    const result = await db.insert(notes).values({
      ...note,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning()
    return result[0]
  },

  async update(id: number, updates: Partial<NewNote>): Promise<Note | undefined> {
    const result = await db
      .update(notes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(notes.id, id))
      .returning()
    return result[0]
  },

  async delete(id: number): Promise<void> {
    await db.delete(notes).where(eq(notes.id, id))
  },

  async getById(id: number): Promise<Note | undefined> {
    const result = await db.select().from(notes).where(eq(notes.id, id)).limit(1)
    return result[0]
  },
}

export const UserVideoRepository = {
  async getById(id: number): Promise<UserVideo | undefined> {
    const result = await db.select().from(userVideos).where(eq(userVideos.id, id))
    return result[0]
  },
  async delete(id: number): Promise<void> {
    await db.delete(userVideos).where(eq(userVideos.id, id))
  },
  async getByUserAndYoutubeId(userId: string, youtubeId: string): Promise<UserVideo | undefined> {
    const result = await db
      .select()
      .from(userVideos)
      .where(and(eq(userVideos.userId, userId), eq(userVideos.youtubeId, youtubeId)))
    return result[0]
  },

  async create(userVideo: NewUserVideo): Promise<UserVideo> {
    const result = await db.insert(userVideos).values(userVideo).returning()
    return result[0]
  },

  async upsert(userVideo: NewUserVideo): Promise<UserVideo> {
    try {
      const result = await db
        .insert(userVideos)
        .values({
          ...userVideo,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [userVideos.userId, userVideos.youtubeId],
          set: {
            summary: userVideo.summary,
            quickStartQuestions: userVideo.quickStartQuestions,
            updatedAt: new Date(),
          },
        })
        .returning()
      return result[0]
    } catch (error) {
      console.warn('ON CONFLICT failed, falling back to check-then-insert:', error)
      const existingUserVideo = await this.getByUserAndYoutubeId(
        userVideo.userId!,
        userVideo.youtubeId!
      )

      if (existingUserVideo) {
        const result = await db
          .update(userVideos)
          .set({
            summary: userVideo.summary,
            quickStartQuestions: userVideo.quickStartQuestions,
            updatedAt: new Date()
          })
          .where(eq(userVideos.id, existingUserVideo.id))
          .returning()
        return result[0]
      } else {
        return await this.create({
          ...userVideo,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }
    }
  },

  async updateSummary(id: number, summary: string): Promise<UserVideo | undefined> {
    const result = await db
      .update(userVideos)
      .set({ summary, updatedAt: new Date() })
      .where(eq(userVideos.id, id))
      .returning()
    return result[0]
  },

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

  async getAllByUser(userId: string): Promise<UserVideo[]> {
    return await db
      .select()
      .from(userVideos)
      .where(eq(userVideos.userId, userId))
      .orderBy(desc(userVideos.createdAt))
  },

  async clearMessages(userVideoId: number): Promise<void> {
    await db.delete(messages).where(eq(messages.userVideoId, userVideoId))
  },
}

export const TranscriptRepository = {
  async getByVideoId(videoId: string) {
    return await db
      .select()
      .from(transcriptSegments)
      .where(eq(transcriptSegments.videoId, videoId))
      .orderBy(transcriptSegments.start)
  },

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
  async create(sharedVideo: NewSharedVideo): Promise<SharedVideo> {
    const result = await db.insert(sharedVideos).values(sharedVideo).returning()
    return result[0]
  },

  async getBySlug(slug: string): Promise<SharedVideo | undefined> {
    const result = await db.select().from(sharedVideos).where(eq(sharedVideos.slug, slug))
    return result[0]
  },

  async getByOwnerId(ownerId: string): Promise<SharedVideo[]> {
    return await db
      .select()
      .from(sharedVideos)
      .where(eq(sharedVideos.ownerId, ownerId))
      .orderBy(desc(sharedVideos.createdAt))
  },

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

  async delete(id: number): Promise<void> {
    await db.delete(sharedVideos).where(eq(sharedVideos.id, id))
  },

  async isSharedByOwner(youtubeId: string, ownerId: string): Promise<boolean> {
    const result = await db
      .select()
      .from(sharedVideos)
      .where(and(eq(sharedVideos.youtubeId, youtubeId), eq(sharedVideos.ownerId, ownerId)))

    return result.length > 0
  },
}

export const UserRepository = {
  async getById(id: string): Promise<User | undefined> {
    const result = await db.select().from(user).where(eq(user.id, id))
    return result[0]
  },

  async updatePreferredLanguage(userId: string, language: 'en' | 'id'): Promise<User | undefined> {
    const result = await db
      .update(user)
      .set({ preferredLanguage: language, updatedAt: new Date() })
      .where(eq(user.id, userId))
      .returning()
    return result[0]
  },

  async getPreferredLanguage(userId: string): Promise<string | undefined> {
    const result = await db
      .select({ preferredLanguage: user.preferredLanguage })
      .from(user)
      .where(eq(user.id, userId))
    return result[0]?.preferredLanguage
  },
}

export const FeedbackRepository = {
  async create(feedbackData: NewFeedback): Promise<Feedback> {
    const result = await db.insert(feedback).values(feedbackData).returning()
    return result[0]
  },

  async getAll(): Promise<Feedback[]> {
    return await db.select().from(feedback).orderBy(desc(feedback.createdAt))
  },

  async getByUserId(userId: string): Promise<Feedback[]> {
    return await db
      .select()
      .from(feedback)
      .where(eq(feedback.userId, userId))
      .orderBy(desc(feedback.createdAt))
  },

  async getByType(type: string): Promise<Feedback[]> {
    return await db
      .select()
      .from(feedback)
      .where(eq(feedback.type, type))
      .orderBy(desc(feedback.createdAt))
  },

  async existsByUserAndMessage(userId: string, messageId: string): Promise<boolean> {
    const result = await db
      .select({ id: feedback.id })
      .from(feedback)
      .where(
        and(
          eq(feedback.userId, userId),
          eq(feedback.type, 'chat_response'),
          sql`${feedback.metadata}->>'messageId' = ${messageId}`
        )
      )
      .limit(1)
    
    return result.length > 0
  },

  async getById(id: number): Promise<Feedback | undefined> {
    const result = await db.select().from(feedback).where(eq(feedback.id, id))
    return result[0]
  },

  async delete(id: number): Promise<void> {
    const result = await db.delete(feedback).where(eq(feedback.id, id))
    if (result.rowCount === 0) {
      throw new Error("Feedback not found")
    }
  },
}
