import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { McpServiceError } from "./errors";

const CURSOR_TTL_MS = 15 * 60 * 1000;

export interface TranscriptCursor {
  videoId: string;
  language: string;
  snapshot: string;
  offset: number;
  expiresAt: number;
}

function cursorKey(token: string) {
  return createHash("sha256").update(token).digest();
}

export function encodeCursor(token: string, cursor: TranscriptCursor): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", cursorKey(token), iv);
  const body = Buffer.from(JSON.stringify({ v: 1, ...cursor }));
  const encrypted = Buffer.concat([cipher.update(body), cipher.final()]);

  return Buffer.concat([Buffer.from([1]), iv, cipher.getAuthTag(), encrypted]).toString(
    "base64url",
  );
}

export function decodeCursor(token: string, value: string): TranscriptCursor {
  try {
    const packed = Buffer.from(value, "base64url");

    if (packed.length < 30 || packed.length > 2048 || packed[0] !== 1) {
      throw new Error("Invalid cursor");
    }

    const decipher = createDecipheriv("aes-256-gcm", cursorKey(token), packed.subarray(1, 13));
    decipher.setAuthTag(packed.subarray(13, 29));

    const decoded = Buffer.concat([
      decipher.update(packed.subarray(29)),
      decipher.final(),
    ]).toString("utf8");

    const payload = JSON.parse(decoded) as TranscriptCursor & { v: number };

    if (
      payload.v !== 1 ||
      typeof payload.videoId !== "string" ||
      typeof payload.language !== "string" ||
      typeof payload.snapshot !== "string" ||
      !Number.isSafeInteger(payload.offset) ||
      payload.offset < 1 ||
      !Number.isSafeInteger(payload.expiresAt) ||
      payload.expiresAt <= Date.now()
    ) {
      throw new Error("Invalid cursor");
    }

    return payload;
  } catch {
    throw new McpServiceError("INVALID_CURSOR");
  }
}

export function transcriptSnapshot(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}
