import { z } from "zod";

export const quizQuestionSchema = z.object({
  prompt: z.string(),
  options: z.array(z.string()).length(4),
  correctIndex: z.number().int().min(0).max(3),
  explanation: z.string(),
  /** Seconds into the video; must match a transcript \`[Ns]\` line when present. */
  timestampSeconds: z.number().int().nonnegative().optional(),
});

export const quizGenerationSchema = z.object({
  questions: z.array(quizQuestionSchema).length(5),
});

export type PublicQuizQuestion = {
  prompt: string;
  options: string[];
  timestampSeconds?: number;
};

export type RevealedQuizQuestion = PublicQuizQuestion & {
  correctIndex: number;
  explanation: string;
  selectedIndex: number;
  isCorrect: boolean;
};

export function sanitizeQuestionsForClient(
  questions: z.infer<typeof quizQuestionSchema>[],
  answers: (number | null)[],
  currentIndex: number,
  status: "in_progress" | "completed",
): Array<PublicQuizQuestion | RevealedQuizQuestion> {
  return questions.map((question, index) => {
    const selectedIndex = answers[index];
    const isAnswered =
      selectedIndex !== null ||
      (status === "completed" && index < questions.length);

    if (!isAnswered) {
      return {
        prompt: question.prompt,
        options: question.options,
        timestampSeconds: question.timestampSeconds,
      };
    }

    return {
      prompt: question.prompt,
      options: question.options,
      timestampSeconds: question.timestampSeconds,
      correctIndex: question.correctIndex,
      explanation: question.explanation,
      selectedIndex: selectedIndex ?? question.correctIndex,
      isCorrect: selectedIndex === question.correctIndex,
    };
  });
}

export function computeQuizScore(
  questions: z.infer<typeof quizQuestionSchema>[],
  answers: (number | null)[],
): number {
  return questions.reduce((score, question, index) => {
    return answers[index] === question.correctIndex ? score + 1 : score;
  }, 0);
}

export function getWrongAnswerIndices(
  questions: z.infer<typeof quizQuestionSchema>[],
  answers: (number | null)[],
): number[] {
  return questions
    .map((question, index) =>
      answers[index] !== question.correctIndex ? index : -1,
    )
    .filter((index) => index >= 0);
}
