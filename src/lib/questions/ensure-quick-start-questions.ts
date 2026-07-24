import {
  TranscriptRepository,
  UserVideoRepository,
  VideoRepository,
} from "@/lib/db/repository";
import { generateQuickStartQuestions } from "@/lib/youtube";
import { retryWithDelay, sleep } from "@/lib/retry";

async function getTranscriptSegmentsWithRetry(videoId: string) {
  const maxAttempts = 3;
  const delayMs = 2000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const segments = await TranscriptRepository.getByVideoId(videoId);
    if (segments.length > 0) {
      return segments;
    }

    if (attempt < maxAttempts) {
      await sleep(delayMs);
    }
  }

  return [];
}

export async function ensureQuickStartQuestions(
  userId: string,
  videoId: string,
): Promise<string[]> {
  const userVideo = await UserVideoRepository.getByUserAndYoutubeId(userId, videoId);
  if (!userVideo) {
    return [];
  }

  if (userVideo.quickStartQuestions && userVideo.quickStartQuestions.length > 0) {
    return userVideo.quickStartQuestions;
  }

  const dbSegments = await getTranscriptSegmentsWithRetry(videoId);
  if (dbSegments.length === 0) {
    return [];
  }

  const video = await VideoRepository.getByYoutubeId(videoId);
  const questions = await retryWithDelay(
    () =>
      generateQuickStartQuestions(
        dbSegments.map((seg) => ({ text: seg.text })),
        video?.title,
        video?.description || undefined,
        userVideo.id,
        videoId,
      ),
    {
      maxAttempts: 3,
      delayMs: 2000,
    },
  );

  await UserVideoRepository.updateQuickStartQuestions(userVideo.id, questions);
  return questions;
}
