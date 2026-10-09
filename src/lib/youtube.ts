export async function fetchVideoFromOEmbed(videoId: string) {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  const response = await fetch(
    `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`,
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch video details: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as {
    title?: string;
    author_name?: string;
    thumbnail_url?: string;
  };

  return {
    title: data.title ?? `Video ${videoId}`,
    description: "",
    channelTitle: data.author_name ?? "Unknown Channel",
    publishedAt: null,
    thumbnails: data.thumbnail_url ? { high: { url: data.thumbnail_url } } : {},
    tags: [] as string[],
  };
}
