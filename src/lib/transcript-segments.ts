import { addSeconds, format } from "date-fns";
import type { TranscriptApiSegment } from "@/lib/transcript-api";
import { formatTime } from "@/lib/utils";

export interface StoredTranscriptSegment {
  start: string;
  end: string;
  text: string;
  isChapterStart: boolean;
}

export function timeStringToSeconds(time: string): number {
  const parts = time.split(":").map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
}

export function transcriptApiSegmentsToStored(
  transcript: TranscriptApiSegment[],
): StoredTranscriptSegment[] {
  const baseDate = new Date(0);
  baseDate.setHours(0, 0, 0, 0);

  return transcript.map((item, index) => {
    const start = Number(item.start || 0);
    const end = start + Number(item.duration || 0);
    const startTime = addSeconds(baseDate, start);
    const endTime = addSeconds(baseDate, end);

    const isChapterStart =
      item.text.length < 30 &&
      !item.text.includes("segment") &&
      item.text !== "N/A" &&
      (index === 0 || index % 10 === 0);

    return {
      start: format(startTime, "HH:mm:ss"),
      end: format(endTime, "HH:mm:ss"),
      text: item.text !== "N/A" ? item.text : `Segment at ${formatTime(start)}`,
      isChapterStart,
    };
  });
}

const TIMED_TRANSCRIPT_MAX_CHARS = 48_000;

export function formatTimedTranscriptForChat(
  segments: StoredTranscriptSegment[],
  maxChars: number = TIMED_TRANSCRIPT_MAX_CHARS,
): string {
  if (segments.length === 0) return "";

  const formatLine = (segment: StoredTranscriptSegment) => {
    const seconds = timeStringToSeconds(segment.start);
    return `[${seconds}s] ${segment.text}`;
  };

  let lines = segments.map(formatLine);
  let joined = lines.join("\n");

  if (joined.length <= maxChars) {
    return joined;
  }

  let step = 2;
  while (step < segments.length) {
    lines = segments
      .filter((_, index) => index === 0 || index % step === 0 || index === segments.length - 1)
      .map(formatLine);
    joined = lines.join("\n");
    if (joined.length <= maxChars) {
      return joined;
    }
    step += 1;
  }

  return joined.slice(0, maxChars);
}

export function storedSegmentsToTranscriptApi(
  videoId: string,
  segments: StoredTranscriptSegment[],
  language = "en",
): { video_id: string; language: string; transcript: TranscriptApiSegment[] } {
  return {
    video_id: videoId,
    language,
    transcript: segments.map((segment) => {
      const start = timeStringToSeconds(segment.start);
      const end = timeStringToSeconds(segment.end);
      return {
        text: segment.text,
        start,
        duration: Math.max(0, end - start),
      };
    }),
  };
}
