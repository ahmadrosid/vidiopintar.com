import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import type { TranscriptApiResponse } from "@/lib/transcript-api";
import { McpServiceError } from "./errors";

const CURSOR_TTL_MS = 15 * 60 * 1000;

const cursorPayloadSchema = z.object({
  v: z.literal(1),
  videoId: z.string(),
  language: z.string(),
  snapshot: z.string(),
  offset: z.number().int().min(1),
  expiresAt: z.number().int(),
});

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

    const parsed = cursorPayloadSchema.safeParse(JSON.parse(decoded));

    if (!parsed.success || parsed.data.expiresAt <= Date.now()) {
      throw new Error("Invalid cursor");
    }

    return parsed.data;
  } catch {
    throw new McpServiceError("INVALID_CURSOR");
  }
}

export function transcriptSnapshot(value: TranscriptApiResponse["transcript"]) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}
