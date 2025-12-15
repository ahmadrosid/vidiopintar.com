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

export const VideoSearchRequestSchema = z.object({
    q: z.string(),
});

export type VideoSearchRequest = z.infer<typeof VideoSearchRequestSchema>;

export const VideoSearchItemSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    thumbnails: z.array(z.object({
        url: z.string(),
        width: z.number(),
        height: z.number(),
    })),
    published: z.string().optional(),
    view_count: z.string(),
    duration: z.string().optional(),
    author: z.object({
        id: z.string(),
        name: z.string(),
    }),
});

export type VideoSearchItem = z.infer<typeof VideoSearchItemSchema>;

export const VideoSearchResponseSchema = z.object({
    data: z.array(VideoSearchItemSchema),
});

export type VideoSearchResponse = z.infer<typeof VideoSearchResponseSchema>;

export const VideoCommentSchema = z.object({
    author: z.string(),
    text: z.string(),
    like_count: z.number(),
    reply_count: z.number(),
    published_time: z.string(),
    comment_id: z.string(),
});

export type VideoComment = z.infer<typeof VideoCommentSchema>;

export const VideoCommentsResponseSchema = z.object({
    results: z.array(VideoCommentSchema),
});

export type VideoCommentsResponse = z.infer<typeof VideoCommentsResponseSchema>;