import { z } from "zod";
import {
    ShareChatRequest,
    ShareChatRequestSchema,
    ShareChatResponseSchema,
    ClearMessagesRequest,
    ClearMessagesRequestSchema,
    ClearMessagesResponseSchema,
    VideoSearchResponseSchema,
    VideoCommentsResponseSchema,
} from "@/lib/services/schema";

const API_BASE = "/api";

// Helper function for exponential backoff retry
async function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(error: unknown): boolean {
    if (error instanceof TypeError && error.message.includes("fetch")) {
        // Network errors
        return true;
    }
    return false;
}

function isRetryableStatus(status: number): boolean {
    // Retry on 5xx, 408 (Request Timeout), 429 (Too Many Requests)
    return status >= 500 || status === 408 || status === 429;
}

async function fetchWithRetry(
    url: string,
    options: RequestInit,
    maxRetries = 3
): Promise<Response> {
    let lastError: unknown;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(url, options);
            
            // If it's a retryable status, throw to trigger retry logic
            if (!response.ok && isRetryableStatus(response.status) && attempt < maxRetries) {
                const delay = Math.min(100 * Math.pow(2, attempt), 1000);
                await sleep(delay);
                continue;
            }
            
            return response;
        } catch (error) {
            lastError = error;
            
            // Retry on network errors
            if (isRetryableError(error) && attempt < maxRetries) {
                const delay = Math.min(100 * Math.pow(2, attempt), 1000);
                await sleep(delay);
                continue;
            }
            
            throw error;
        }
    }
    
    throw lastError;
}

async function postRequest<TResponse>(
    endpoint: string,
    body: unknown,
    responseSchema: z.ZodSchema<TResponse>
): Promise<TResponse> {
    const url = `${API_BASE}${endpoint}`;
    
    const response = await fetchWithRetry(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const json = await response.json();
    return responseSchema.parse(json);
}

export async function createShareVideo(
    input: ShareChatRequest
): Promise<z.infer<typeof ShareChatResponseSchema>> {
    ShareChatRequestSchema.parse(input);
    return postRequest("/share", input, ShareChatResponseSchema);
}

export async function clearChatMessages(
    input: ClearMessagesRequest
): Promise<z.infer<typeof ClearMessagesResponseSchema>> {
    ClearMessagesRequestSchema.parse(input);
    return postRequest("/clear-messages", input, ClearMessagesResponseSchema);
}

export async function searchVideos(
    query: string
): Promise<z.infer<typeof VideoSearchResponseSchema>> {
    return postRequest("/youtube/search", { query }, VideoSearchResponseSchema);
}

export async function getComments(
    videoId?: string,
    videoUrl?: string
): Promise<z.infer<typeof VideoCommentsResponseSchema>> {
    return postRequest(
        "/youtube/comments",
        { videoId, videoUrl },
        VideoCommentsResponseSchema
    );
}
