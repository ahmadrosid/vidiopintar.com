import { generateObject } from "ai";
import { getCurrentUser } from "@/lib/auth";
import { UserRepository } from "@/lib/db/repository";
import { getQuizPrompt } from "@/lib/ai/system-prompts";
import { AI_MODEL_ID, AI_PROVIDER, aiModel, aiProviderOptions } from "@/lib/ai/model";
import { trackGenerateTextUsage } from "@/lib/token-tracker";
import { quizGenerationSchema } from "@/lib/quiz/types";

export async function generateQuizFromTranscript(input: {
  transcriptSegments: Array<{ text: string }>;
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

  const fullTranscript = input.transcriptSegments.map((seg) => seg.text).join(" ");
  const words = fullTranscript.split(/\s+/);
  const truncatedTranscript = words.slice(0, 6000).join(" ");

  let contextSection = "";
  if (input.videoTitle) {
    contextSection += `Video Title: ${input.videoTitle}\n`;
  }
  if (input.videoDescription) {
    contextSection += `Video Description: ${input.videoDescription}\n`;
  }

  const promptText = getQuizPrompt(userLanguage);
  const prompt = `${promptText}

${contextSection ? `${contextSection}\n` : ""}Here is the video transcript:

<transcript>
${truncatedTranscript}
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

  return {
    questions: result.object.questions,
    language: userLanguage,
  };
}
