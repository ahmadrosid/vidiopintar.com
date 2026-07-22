import { generateObject } from "ai";
import { z } from "zod";
import { AI_MODEL_ID, AI_PROVIDER, aiModel, aiProviderOptions } from "@/lib/ai/model";
import { trackGenerateTextUsage } from "@/lib/token-tracker";

const DESCRIPTION_MAX_CHARS = 280;
const MAX_QUERIES = 3;

const searchQueriesSchema = z.object({
  queries: z
    .array(z.string().min(3).max(120))
    .min(1)
    .max(MAX_QUERIES)
    .describe("YouTube search queries for educational long-form videos"),
});

export type WatchedVideoContext = {
  title: string;
  description: string | null;
  channelTitle: string | null;
};

function truncate(text: string, max: number): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1).trimEnd()}…`;
}

function buildPrompt(videos: WatchedVideoContext[]): string {
  const lines = videos.map((video, index) => {
    const description = video.description
      ? truncate(video.description, DESCRIPTION_MAX_CHARS)
      : "(no description)";
    const channel = video.channelTitle ?? "Unknown channel";
    return `${index + 1}. "${video.title}" by ${channel}\n   Description: ${description}`;
  });

  return `You help recommend educational YouTube videos for learning.

Based on the user's recently watched videos below, generate ${MAX_QUERIES} diverse YouTube search queries that would find similar or next-step learning videos.

Rules:
- Prefer educational / tutorial / deep-dive content (not Shorts, not entertainment clickbait)
- Queries should be specific enough for YouTube search (3–8 words)
- Cover related skills or adjacent topics, not exact duplicate titles
- Write queries in English

Recently watched:
${lines.join("\n")}
`;
}

export async function generateRecommendationSearchQueries(input: {
  userId: string;
  videos: WatchedVideoContext[];
}): Promise<string[]> {
  const startTime = Date.now();
  const result = await generateObject({
    model: aiModel,
    providerOptions: aiProviderOptions,
    prompt: buildPrompt(input.videos),
    schema: searchQueriesSchema,
  });

  try {
    await trackGenerateTextUsage(result, {
      userId: input.userId,
      model: AI_MODEL_ID,
      provider: AI_PROVIDER,
      operation: "recommendations",
      requestDuration: Date.now() - startTime,
    });
  } catch (error) {
    console.error("Failed to track recommendation token usage:", error);
  }

  const queries: string[] = [];
  for (const query of result.object.queries) {
    const trimmed = query.trim();
    if (trimmed.length === 0) continue;
    queries.push(trimmed);
    if (queries.length >= MAX_QUERIES) break;
  }
  return queries;
}
