import {
  YoutubeTranscriptDisabledError,
  YoutubeTranscriptNotAvailableError,
  YoutubeTranscriptTooManyRequestError,
  YoutubeTranscriptVideoUnavailableError,
} from "youtube-transcript-plus";
import { McpServiceError } from "./errors";

// Maps any error from the transcript pipeline to the public error code shown to callers.
export function toServiceError(error: Error): McpServiceError {
  if (error instanceof McpServiceError) return error;

  if (error instanceof YoutubeTranscriptVideoUnavailableError) return new McpServiceError("VIDEO_UNAVAILABLE");

  if (error instanceof YoutubeTranscriptDisabledError || error instanceof YoutubeTranscriptNotAvailableError) {
    return new McpServiceError("CAPTIONS_UNAVAILABLE");
  }

  const message = error instanceof Error ? error.message : "";

  if (error instanceof YoutubeTranscriptTooManyRequestError || /temporar|rate.?limit/i.test(message)) {
    return new McpServiceError("TEMPORARY_PROVIDER_FAILURE", true, 30);
  }

  if (/transcript|caption/i.test(message)) return new McpServiceError("CAPTIONS_UNAVAILABLE");

  return new McpServiceError("TEMPORARY_PROVIDER_FAILURE", true, 30);
}
