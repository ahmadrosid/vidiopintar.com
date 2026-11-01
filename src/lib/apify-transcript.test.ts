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
      ok: true,
      language: "en",
      segments: [{ text: "Hello", start: 1.36, duration: 1.68 }],
      title: "Title",
      channelName: "Author",
      channelUrl: "https://www.youtube.com/channel/UC123",
      thumbnailUrl: "thumb.jpg",
    });

    expect(mapped).toEqual({
      video_id: "abc",
      language: "en",
      transcript: [{ text: "Hello", start: 1.36, duration: 1.68 }],
      metadata: {
        title: "Title",
        author_name: "Author",
        author_url: "https://www.youtube.com/channel/UC123",
        thumbnail_url: "thumb.jpg",
      },
    });
  });

  test("decodes HTML entities in segment text", () => {
    const mapped = mapApifyItem("abc", {
      language: "en",
      segments: [{ text: "Tom &amp; Jerry it&#39;s", start: 0, duration: 1 }],
    });

    expect(mapped.transcript[0].text).toBe("Tom & Jerry it's");
  });

  test("throws CAPTIONS_UNAVAILABLE when there is no transcript", () => {
    expect(() => mapApifyItem("abc", undefined)).toThrow(
      expect.objectContaining({ code: "CAPTIONS_UNAVAILABLE" }),
    );
    expect(() => mapApifyItem("abc", { language: "en", segments: [] })).toThrow(
      expect.objectContaining({ code: "CAPTIONS_UNAVAILABLE" }),
    );
  });

  test("maps the actor's not-found diagnostic to VIDEO_UNAVAILABLE", () => {
    expect(() =>
      mapApifyItem("abc", {
        ok: false,
        errorCode: "NOT_FOUND",
        error:
          "The requested item does not exist, or is private, deleted or suspended.",
        details: "VIDEO_UNAVAILABLE: This video is unavailable",
      }),
    ).toThrow(expect.objectContaining({ code: "VIDEO_UNAVAILABLE" }));
  });

  test("maps caption errors that mention unavailable to CAPTIONS_UNAVAILABLE", () => {
    expect(() =>
      mapApifyItem("abc", {
        ok: false,
        error: "Transcript is unavailable for this video",
      }),
    ).toThrow(expect.objectContaining({ code: "CAPTIONS_UNAVAILABLE" }));
  });

  test("maps proxy bandwidth errors to SERVICE_MISCONFIGURED", () => {
    expect(() =>
      mapApifyItem("abc", {
        ok: false,
        error:
          "Proxy responded with 402 Payment Required: Bandwidth limit reached. Please upgrade to continue using the proxy.",
      }),
    ).toThrow(expect.objectContaining({ code: "SERVICE_MISCONFIGURED" }));
  });

  test("maps unknown run errors to a retryable failure", () => {
    expect(() =>
      mapApifyItem("abc", { ok: false, error: "socket hang up" }),
    ).toThrow(expect.objectContaining({ code: "TEMPORARY_PROVIDER_FAILURE" }));
  });
});
