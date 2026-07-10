import { timeStringToSeconds } from "@/lib/transcript-segments";
import { formatTime } from "@/lib/utils";

/** Matches [154s], [2:34], or [1:02:03] citation markers in summary markdown. */
export const SUMMARY_CITATION_PATTERN =
  /\[(\d+)s\]|\[(\d{1,2}):(\d{2})(?::(\d{2}))?\]/gi;

export const SUMMARY_CITATION_LINK_PREFIX = "vidiopintar-cite:";

export function parseCitationToken(token: string): number | null {
  const trimmed = token.trim();

  const secondsMatch = trimmed.match(/^\[(\d+)s\]$/i);
  if (secondsMatch) {
    const seconds = Number.parseInt(secondsMatch[1], 10);
    return Number.isFinite(seconds) && seconds >= 0 ? seconds : null;
  }

  const timeMatch = trimmed.match(/^\[(\d{1,2}):(\d{2})(?::(\d{2}))?\]$/);
  if (timeMatch) {
    const inner = trimmed.slice(1, -1);
    const seconds = timeStringToSeconds(inner);
    return seconds >= 0 ? seconds : null;
  }

  return null;
}

/** Turn raw [Ns] markers into markdown links the summary UI can render as seek chips. */
export function linkifySummaryCitations(markdown: string): string {
  return markdown.replace(SUMMARY_CITATION_PATTERN, (match) => {
    const seconds = parseCitationToken(match);
    if (seconds == null) return match;
    return `[${formatTime(seconds)}](${SUMMARY_CITATION_LINK_PREFIX}${seconds})`;
  });
}

export function isSummaryCitationHref(href?: string): boolean {
  return href?.startsWith(SUMMARY_CITATION_LINK_PREFIX) ?? false;
}

export function secondsFromCitationHref(href: string): number | null {
  if (!isSummaryCitationHref(href)) return null;
  const raw = href.slice(SUMMARY_CITATION_LINK_PREFIX.length);
  const seconds = Number.parseInt(raw, 10);
  return Number.isFinite(seconds) && seconds >= 0 ? seconds : null;
}
