import { afterEach, describe, expect, mock, spyOn, test } from "bun:test";
import { fetchVideoFromOEmbed } from "./youtube";

afterEach(() => {
  mock.restore();
});

describe("fetchVideoFromOEmbed", () => {
  test("maps oembed JSON to the existing details shape", async () => {
    const fetchSpy = spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          title: "Never Gonna Give You Up",
          author_name: "Rick Astley",
          thumbnail_url: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
        }),
        { status: 200 },
      ),
    );

    const details = await fetchVideoFromOEmbed("dQw4w9WgXcQ");

    expect(String(fetchSpy.mock.calls[0]?.[0])).toContain("youtube.com/oembed");
    expect(details.title).toBe("Never Gonna Give You Up");
    expect(details.channelTitle).toBe("Rick Astley");
    expect(details.thumbnails).toEqual({
      high: { url: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg" },
    });
  });

  test("throws when oembed responds with an error", async () => {
    spyOn(globalThis, "fetch").mockResolvedValue(new Response("gone", { status: 404 }));

    await expect(fetchVideoFromOEmbed("dQw4w9WgXcQ")).rejects.toThrow(/Failed to fetch video details/);
  });
});
