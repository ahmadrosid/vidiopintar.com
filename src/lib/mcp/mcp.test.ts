import { describe, expect, test } from "bun:test";
import { decodeCursor, encodeCursor } from "./cursor";
import { McpServiceError } from "./errors";
import { isProviderFailure } from "./metrics";
import { paginateTranscript } from "./transcript";
import { normalizeVideoReference } from "./video-reference";

describe("YouTube video references", () => {
  test("accepts supported URL forms and a video ID", () => {
    for (const input of [
      "dQw4w9WgXcQ",
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "https://youtu.be/dQw4w9WgXcQ?t=10",
      "https://youtube.com/shorts/dQw4w9WgXcQ",
      "https://m.youtube.com/embed/dQw4w9WgXcQ",
    ]) {
      expect(normalizeVideoReference(input)).toBe("dQw4w9WgXcQ");
    }
  });

  test("rejects non-YouTube hosts", () => {
    expect(() => normalizeVideoReference("https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ"))
      .toThrow(McpServiceError);
  });
});

describe("transcript cursors", () => {
  const cursor = {
    videoId: "dQw4w9WgXcQ",
    language: "id",
    snapshot: "snapshot-hash",
    offset: 50,
    expiresAt: Date.now() + 60_000,
  };

  test("binds a cursor to the API key", () => {
    const encoded = encodeCursor("vpt_live_test", cursor);
    expect(decodeCursor("vpt_live_test", encoded)).toMatchObject(cursor);
    expect(() => decodeCursor("different-key", encoded)).toThrow(McpServiceError);
  });

  test("rejects an expired cursor", () => {
    const encoded = encodeCursor("vpt_live_test", { ...cursor, expiresAt: Date.now() - 1 });
    expect(() => decodeCursor("vpt_live_test", encoded)).toThrow(McpServiceError);
  });

  test("rejects a cursor with changed contents", () => {
    const packed = Buffer.from(encodeCursor("vpt_live_test", cursor), "base64url");
    packed[packed.length - 1] ^= 1;
    expect(() => decodeCursor("vpt_live_test", packed.toString("base64url")))
      .toThrow(McpServiceError);
  });

  test("rejects an unsupported cursor version", () => {
    const encoded = encodeCursor("vpt_live_test", { ...cursor, v: 2 } as typeof cursor);
    expect(() => decodeCursor("vpt_live_test", encoded)).toThrow(McpServiceError);
  });
});

describe("transcript pages", () => {
  test("continues at the next segment without gaps or repeats", () => {
    const segments = ["pertama", "kedua", "ketiga"];
    const first = paginateTranscript(segments, 0, Buffer.byteLength('"pertama"'));
    const second = paginateTranscript(segments, first.nextOffset, 100);
    expect(first.segments).toEqual(["pertama"]);
    expect(second.segments).toEqual(["kedua", "ketiga"]);
    expect([...first.segments, ...second.segments]).toEqual(segments);
  });

  test("does not return one segment larger than the page limit", () => {
    const page = paginateTranscript(["very long segment"], 0, 3);
    expect(page.segments).toEqual([]);
    expect(page.nextOffset).toBe(0);
  });
});

describe("beta metrics", () => {
  test("counts provider outcomes without treating request errors as provider failures", () => {
    expect(isProviderFailure("CAPTIONS_UNAVAILABLE")).toBe(true);
    expect(isProviderFailure("TEMPORARY_PROVIDER_FAILURE")).toBe(true);
    expect(isProviderFailure("INVALID_VIDEO_REFERENCE")).toBe(false);
  });
});
