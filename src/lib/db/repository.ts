import { db } from "@/lib/db/index"
import { eq, InferSelectModel } from "drizzle-orm"
import { user } from "./schema/auth"
import {
  transcriptCache,
  transcriptSegments,
} from "./schema/videos"


export type User = InferSelectModel<typeof user>



/** Escape `\`, `%`, and `_` so user input is matched literally in SQL LIKE. */



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

export const TranscriptCacheRepository = {
  async get(videoId: string) {
    const result = await db
      .select()
      .from(transcriptCache)
      .where(eq(transcriptCache.videoId, videoId))
      .limit(1)

    return result[0]
  },

  async saveResponse(videoId: string, response: NonNullable<typeof transcriptCache.$inferSelect.response>) {
    const now = new Date()
    await db
      .insert(transcriptCache)
      .values({
        videoId,
        response,
        unavailable: false,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: transcriptCache.videoId,
        set: {
          response,
          unavailable: false,
          updatedAt: now,
        },
      })
  },

  async markUnavailable(videoId: string) {
    const now = new Date()
    await db
      .insert(transcriptCache)
      .values({
        videoId,
        response: null,
        unavailable: true,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: transcriptCache.videoId,
        set: {
          response: null,
          unavailable: true,
          updatedAt: now,
        },
      })
  },
}



