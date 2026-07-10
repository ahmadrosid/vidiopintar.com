import { timeStringToSeconds } from "@/lib/transcript-segments";
import { formatTime } from "@/lib/utils";

/** Matches citation markers: ranges first, then single points. */
export const SUMMARY_CITATION_PATTERN =
  /\[(\d+)s-(\d+)s\]|\[(\d{1,2}:\d{2}(?::\d{2})?)-(\d{1,2}:\d{2}(?::\d{2})?)\]|\[(\d+)s\]|\[(\d{1,2}):(\d{2})(?::(\d{2}))?\]/gi;

/** Hash fragment — survives react-markdown URL sanitization (custom schemes are stripped). */
export const SUMMARY_CITATION_LINK_PREFIX = "#vp-cite-";

export type CitationBounds = {
  startSeconds: number;
  endSeconds: number | null;
};

function normalizeBounds(
  start: number,
  end: number | null,
): CitationBounds | null {
  if (!Number.isFinite(start) || start < 0) return null;
  if (end == null) return { startSeconds: start, endSeconds: null };
  if (!Number.isFinite(end) || end < 0) return null;
  return {
    startSeconds: Math.min(start, end),
    endSeconds: Math.max(start, end),
  };
}

export function parseCitationBounds(token: string): CitationBounds | null {
  const trimmed = token.trim();

  const secondsRangeMatch = trimmed.match(/^\[(\d+)s-(\d+)s\]$/i);
  if (secondsRangeMatch) {
    return normalizeBounds(
      Number.parseInt(secondsRangeMatch[1], 10),
      Number.parseInt(secondsRangeMatch[2], 10),
    );
  }

  const clockRangeMatch = trimmed.match(
    /^\[(\d{1,2}:\d{2}(?::\d{2})?)-(\d{1,2}:\d{2}(?::\d{2})?)\]$/,
  );
  if (clockRangeMatch) {
    return normalizeBounds(
      timeStringToSeconds(clockRangeMatch[1]),
      timeStringToSeconds(clockRangeMatch[2]),
    );
  }

  const secondsMatch = trimmed.match(/^\[(\d+)s\]$/i);
  if (secondsMatch) {
    return normalizeBounds(Number.parseInt(secondsMatch[1], 10), null);
  }

  const timeMatch = trimmed.match(/^\[(\d{1,2}):(\d{2})(?::(\d{2}))?\]$/);
  if (timeMatch) {
    const inner = trimmed.slice(1, -1);
    return normalizeBounds(timeStringToSeconds(inner), null);
  }

  return null;
}

/** Seek target for a citation marker (start of range). */
export function parseCitationToken(token: string): number | null {
  const bounds = parseCitationBounds(token);
  return bounds?.startSeconds ?? null;
}

function formatCitationLabel(bounds: CitationBounds): string {
  if (
    bounds.endSeconds != null &&
    bounds.endSeconds !== bounds.startSeconds
  ) {
    return `${formatTime(bounds.startSeconds)}–${formatTime(bounds.endSeconds)}`;
  }
  return formatTime(bounds.startSeconds);
}

/** Turn raw citation markers into markdown links the summary UI can render as seek chips. */
export function linkifySummaryCitations(markdown: string): string {
  return markdown.replace(SUMMARY_CITATION_PATTERN, (match) => {
    const bounds = parseCitationBounds(match);
    if (bounds == null) return match;
    const label = formatCitationLabel(bounds);
    return `[${label}](${SUMMARY_CITATION_LINK_PREFIX}${bounds.startSeconds})`;
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

/** Parse seek seconds from a rendered citation chip label (e.g. "0:15–0:25"). */
export function secondsFromCitationLabel(label: string): number | null {
  const trimmed = label.trim();
  const rangeMatch = trimmed.match(
    /^(\d{1,2}:\d{2}(?::\d{2})?)[\u2013-](\d{1,2}:\d{2}(?::\d{2})?)$/,
  );
  if (rangeMatch) {
    return timeStringToSeconds(rangeMatch[1]);
  }
  const pointMatch = trimmed.match(/^(\d{1,2}:\d{2}(?::\d{2})?)$/);
  if (pointMatch) {
    return timeStringToSeconds(pointMatch[1]);
  }
  return null;
}

export function citationSeekSeconds(
  href: string | undefined,
  label: string,
): number | null {
  if (href) {
    const fromHref = secondsFromCitationHref(href);
    if (fromHref != null) return fromHref;
  }
  if (!href || href === "") {
    return secondsFromCitationLabel(label);
  }
  return null;
}
