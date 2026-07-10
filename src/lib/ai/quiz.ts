import { generateObject } from "ai";
import { getCurrentUser } from "@/lib/auth";
import { UserRepository } from "@/lib/db/repository";
import { getQuizPrompt } from "@/lib/ai/system-prompts";
import { AI_MODEL_ID, AI_PROVIDER, aiModel, aiProviderOptions } from "@/lib/ai/model";
import { trackGenerateTextUsage } from "@/lib/token-tracker";
import { quizGenerationSchema } from "@/lib/quiz/types";
import {
  formatTimedTranscriptForChat,
  timeStringToSeconds,
  type StoredTranscriptSegment,
} from "@/lib/transcript-segments";

/** Snap a model timestamp to the nearest transcript line start (within maxDeltaSeconds). */
export function snapTimestampToTranscript(
  timestampSeconds: number | undefined,
  transcriptSeconds: number[],
  maxDeltaSeconds = 15,
): number | undefined {
  if (
    timestampSeconds == null ||
    !Number.isFinite(timestampSeconds) ||
    transcriptSeconds.length === 0
  ) {
    return undefined;
  }

  let best: number | undefined;
  let bestDelta = Infinity;
  for (const candidate of transcriptSeconds) {
    const delta = Math.abs(candidate - timestampSeconds);
    if (delta < bestDelta) {
      bestDelta = delta;
      best = candidate;
    }
  }

  if (best == null || bestDelta > maxDeltaSeconds) {
    return undefined;
  }
  return best;
}

export async function generateQuizFromTranscript(input: {
  transcriptSegments: Array<Pick<StoredTranscriptSegment, "start" | "text">>;
  videoTitle?: string;
  videoDescription?: string;
  videoId?: string;
  userVideoId?: number;
}) {
  let userLanguage: "en" | "id" = "en";
  try {
    const user = await getCurrentUser();
    const savedLanguage = await UserRepository.getPreferredLanguage(user.id);
    if (savedLanguage === "en" || savedLanguage === "id") {
      userLanguage = savedLanguage;
    }
  } catch (error) {
    console.log(
      "Could not get user language preference for quiz, using default:",
      error,
    );
  }

  const segments: StoredTranscriptSegment[] = input.transcriptSegments.map(
    (seg) => ({
      start: seg.start,
      end: seg.start,
      text: seg.text,
      isChapterStart: false,
    }),
  );

  const timedTranscript = formatTimedTranscriptForChat(segments);
  const transcriptSeconds = [
    ...new Set(
      segments.map((seg) => timeStringToSeconds(seg.start)).filter((s) => s >= 0),
    ),
  ].sort((a, b) => a - b);

  let contextSection = "";
  if (input.videoTitle) {
    contextSection += `Video Title: ${input.videoTitle}\n`;
  }
  if (input.videoDescription) {
    contextSection += `Video Description: ${input.videoDescription}\n`;
  }

  const promptText = getQuizPrompt(userLanguage);
  const prompt = `${promptText}

${contextSection ? `${contextSection}\n` : ""}Here is the video transcript (timed — each line is [seconds] text):

<transcript>
${timedTranscript}
</transcript>
`;

  const startTime = Date.now();
  const result = await generateObject({
    model: aiModel,
    providerOptions: aiProviderOptions,
    prompt,
    schema: quizGenerationSchema,
  });

  try {
    const user = await getCurrentUser();
    await trackGenerateTextUsage(result, {
      userId: user.id,
      model: AI_MODEL_ID,
      provider: AI_PROVIDER,
      operation: "quiz_generation",
      videoId: input.videoId,
      userVideoId: input.userVideoId,
      requestDuration: Date.now() - startTime,
    });
  } catch (error) {
    console.error("Failed to track quiz generation token usage:", error);
  }

  const questions = result.object.questions.map((question) => ({
    ...question,
    timestampSeconds: snapTimestampToTranscript(
      question.timestampSeconds,
      transcriptSeconds,
    ),
  }));

  return {
    questions,
    language: userLanguage,
  };
}
