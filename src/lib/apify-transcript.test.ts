import { describe, expect, test } from "bun:test";
import { mapApifyItem, transcriptLanguages } from "./apify-transcript";

describe("transcriptLanguages", () => {
  test("puts the preferred language first without duplicates", () => {
    expect(transcriptLanguages("ID")).toEqual(["id", "en"]);
    expect(transcriptLanguages("fr")).toEqual(["fr", "en", "id"]);
    expect(transcriptLanguages()).toEqual(["en", "id"]);
  });
});

describe("mapApifyItem", () => {
  test("maps segments and video details", () => {
    const mapped = mapApifyItem("abc", {
      languageCode: "en",
      transcript: [{ text: "Hello", start: 0.04, duration: 3.3 }],
      videoDetails: {
        title: "Title",
        author: "Author",
        channelId: "UC123",
        thumbnail: { thumbnails: [{ url: "small" }, { url: "large" }] },
      },
    });

    expect(mapped).toEqual({
      video_id: "abc",
      language: "en",
      transcript: [{ text: "Hello", start: 0.04, duration: 3.3 }],
      metadata: {
        title: "Title",
        author_name: "Author",
        author_url: "https://www.youtube.com/channel/UC123",
        thumbnail_url: "large",
      },
    });
  });

  test("throws CAPTIONS_UNAVAILABLE when there is no transcript", () => {
    expect(() => mapApifyItem("abc", undefined)).toThrow(
      expect.objectContaining({ code: "CAPTIONS_UNAVAILABLE" }),
    );
    expect(() =>
      mapApifyItem("abc", { languageCode: "en", transcript: [] }),
    ).toThrow(expect.objectContaining({ code: "CAPTIONS_UNAVAILABLE" }));
  });

  test("maps proxy bandwidth errors to SERVICE_MISCONFIGURED", () => {
    expect(() =>
      mapApifyItem("abc", {
        error:
          "Proxy responded with 402 Payment Required: Bandwidth limit reached. Please upgrade to continue using the proxy.",
      }),
    ).toThrow(expect.objectContaining({ code: "SERVICE_MISCONFIGURED" }));
  });

  test("maps unknown run errors to a retryable failure", () => {
    expect(() => mapApifyItem("abc", { error: "socket hang up" })).toThrow(
      expect.objectContaining({ code: "TEMPORARY_PROVIDER_FAILURE" }),
    );
  });

  test("maps unavailable-video errors", () => {
    expect(() =>
      mapApifyItem("abc", { error: "Video is unavailable" }),
    ).toThrow(expect.objectContaining({ code: "VIDEO_UNAVAILABLE" }));
  });
});
