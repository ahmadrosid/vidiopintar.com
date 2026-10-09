import { McpServiceError } from "./errors";

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "www.youtu.be",
]);

export function normalizeVideoReference(input: string): string {
  const value = input.trim();

  if (VIDEO_ID.test(value)) return value;

  if (!value || value.length > 2048) {
    throw new McpServiceError("INVALID_VIDEO_REFERENCE");
  }

  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);

    if (!YOUTUBE_HOSTS.has(url.hostname.toLowerCase())) {
      throw new McpServiceError("INVALID_VIDEO_REFERENCE");
    }

    const parts = url.pathname.split("/").filter(Boolean);

    const id = url.hostname.endsWith("youtu.be")
      ? parts[0]
      : url.pathname === "/watch"
        ? url.searchParams.get("v")
        : ["shorts", "embed", "v"].includes(parts[0] ?? "")
          ? parts[1]
          : null;

    if (!id || !VIDEO_ID.test(id)) {
      throw new McpServiceError("INVALID_VIDEO_REFERENCE");
    }

    return id;
  } catch (error) {
    if (error instanceof McpServiceError) throw error;
    throw new McpServiceError("INVALID_VIDEO_REFERENCE");
  }
}
