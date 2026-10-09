"use server";

import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { toServiceError } from "@/lib/mcp/transcript-errors";
import { getTranscriptPage } from "@/lib/mcp/transcript";

type TranscriptPage = Awaited<ReturnType<typeof getTranscriptPage>>;

export type PlaygroundResult =
  | { ok: true; page: TranscriptPage }
  | { ok: false; code: string; message: string; retryable: boolean };

const inputSchema = z.object({
  video: z.string().max(2048).optional(),
  language: z.string().min(2).max(20).optional(),
  cursor: z.string().max(2048).optional(),
});

// Runs the same transcript pipeline as the MCP tool, for the signed-in user, without an API key.
export async function fetchTranscriptAction(input: z.infer<typeof inputSchema>): Promise<PlaygroundResult> {
  const user = await getCurrentUser();
  const parsed = inputSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, code: "INVALID_VIDEO_REFERENCE", message: "Masukkan URL YouTube atau ID video yang valid.", retryable: false };
  }

  try {
    const page = await getTranscriptPage({
      video: parsed.data.video ?? "",
      language: parsed.data.language,
      cursor: parsed.data.cursor,
      // Cursors are encrypted with this value, so each user's cursors only work for that user.
      token: `playground:${user.id}`,
    });

    return { ok: true, page };
  } catch (error) {
    const mapped = toServiceError(error);

    return { ok: false, code: mapped.code, message: mapped.message, retryable: mapped.retryable };
  }
}
