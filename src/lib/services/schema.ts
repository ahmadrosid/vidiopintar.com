import { z } from "zod";

export const ShareChatRequestSchema = z.object({
    youtubeId: z.string(),
    userVideoId: z.number(),
});

export type ShareChatRequest = z.infer<typeof ShareChatRequestSchema>;

export const ShareChatResponseSchema = z.object({
    url: z.string(),
});

export type ShareChatResponse = z.infer<typeof ShareChatResponseSchema>;

export const ClearMessagesRequestSchema = z.object({
    userVideoId: z.number(),
});

export type ClearMessagesRequest = z.infer<typeof ClearMessagesRequestSchema>;

export const ClearMessagesResponseSchema = z.object({
    success: z.boolean(),
});

export type ClearMessagesResponse = z.infer<typeof ClearMessagesResponseSchema>;