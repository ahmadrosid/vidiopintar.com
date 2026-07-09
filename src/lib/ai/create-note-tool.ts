import { tool } from "ai";
import { z } from "zod";

import { NOTE_COLOR_OPTIONS, NoteColor } from "@/lib/constants";
import { NoteRepository, UserVideoRepository } from "@/lib/db/repository";

export type CreateNoteToolResult =
  | {
      success: true;
      note: { id: number; timestamp: number; text: string; color: string };
    }
  | { success: false; error: string };

function normalizeColor(color?: string): NoteColor {
  if (color && NOTE_COLOR_OPTIONS.includes(color as NoteColor)) {
    return color as NoteColor;
  }
  return "yellow";
}

export function buildCreateNoteTool(params: {
  userId: string;
  userVideoId: number;
}) {
  const { userId, userVideoId } = params;

  return tool({
    description:
      "Create a timestamped note on the current video for the user. Only call when the user explicitly asks to save, note, or remember something.",
    inputSchema: z.object({
      text: z.string().describe("The note content to save"),
      timestamp: z
        .number()
        .min(0)
        .describe("Video position in seconds for this note"),
      color: z
        .enum(["yellow", "blue", "green", "red", "purple"])
        .optional()
        .describe("Note highlight color; defaults to yellow"),
    }),
    execute: async ({ text, timestamp, color }): Promise<CreateNoteToolResult> => {
      const trimmed = text.trim();
      if (!trimmed) {
        return { success: false, error: "Note text cannot be empty" };
      }

      try {
        const userVideo = await UserVideoRepository.getById(userVideoId);
        if (!userVideo || userVideo.userId !== userId) {
          return { success: false, error: "Video not found or unauthorized" };
        }

        const note = await NoteRepository.create({
          userId,
          userVideoId,
          timestamp: Math.max(0, timestamp),
          text: trimmed,
          color: normalizeColor(color),
        });

        return {
          success: true,
          note: {
            id: note.id,
            timestamp: note.timestamp,
            text: note.text,
            color: note.color,
          },
        };
      } catch (err) {
        console.error("createNote tool error:", err);
        return { success: false, error: "Failed to save note" };
      }
    },
  });
}
