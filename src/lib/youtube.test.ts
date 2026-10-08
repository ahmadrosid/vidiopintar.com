import { afterEach, describe, expect, test } from "bun:test";
import { fetchVideoFromOEmbed } from "./youtube";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("fetchVideoFromOEmbed", () => {
  test("maps oembed JSON to the existing details shape", async () => {
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const url = String(input);
      expect(url).toContain("youtube.com/oembed");
      expect(url).not.toContain("transcriptapi.com");
      return new Response(
        JSON.stringify({
          title: "Never Gonna Give You Up",
          author_name: "Rick Astley",
          thumbnail_url: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
        }),
        { status: 200 },
      );
    }) as unknown as typeof fetch;

    const details = await fetchVideoFromOEmbed("dQw4w9WgXcQ");

    expect(details.title).toBe("Never Gonna Give You Up");
    expect(details.channelTitle).toBe("Rick Astley");
    expect(details.thumbnails).toEqual({
      high: { url: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg" },
    });
  });

  test("uses fallback title when oembed fails", async () => {
    globalThis.fetch = (async () =>
      new Response("gone", { status: 404 })) as unknown as typeof fetch;

    await expect(fetchVideoFromOEmbed("dQw4w9WgXcQ")).rejects.toThrow(
      /Failed to fetch video details/,
    );
  });
});
