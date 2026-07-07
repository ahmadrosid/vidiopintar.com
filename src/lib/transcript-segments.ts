import { addSeconds, format } from "date-fns";
import type { TranscriptApiSegment } from "@/lib/transcript-api";
import { formatTime } from "@/lib/utils";

export interface StoredTranscriptSegment {
  start: string;
  end: string;
  text: string;
  isChapterStart: boolean;
}

function timeStringToSeconds(time: string): number {
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
