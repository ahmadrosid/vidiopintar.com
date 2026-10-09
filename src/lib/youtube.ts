import { z } from "zod";

const oEmbedSchema = z.object({
  title: z.string().optional(),
  author_name: z.string().optional(),
  thumbnail_url: z.string().optional(),
});

export async function fetchVideoFromOEmbed(videoId: string) {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  const response = await fetch(
    `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`,
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch video details: ${response.status} ${response.statusText}`);
  }

  const parsed = oEmbedSchema.safeParse(await response.json());
  const data = parsed.success ? parsed.data : {};

  return {
    title: data.title ?? `Video ${videoId}`,
    description: "",
    channelTitle: data.author_name ?? "Unknown Channel",
    publishedAt: null,
    thumbnails: data.thumbnail_url ? { high: { url: data.thumbnail_url } } : {},
    tags: [],
  };
}
