import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Safe JSON for embedding in `<script type="application/ld+json">` tags. */
type JsonLdValue =
  | string
  | number
  | boolean
  | null
  | JsonLdValue[]
  | { [key: string]: JsonLdValue };

export function serializeJsonLd(data: JsonLdValue): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

/** Strip common XSS vectors from trusted static HTML before rendering. */
/** Shared date format options for consistent SSR/client rendering. */
const DISPLAY_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
};

const DISPLAY_DATETIME_OPTIONS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
};

export function formatDisplayDate(date: Date | string | number): string {
  return new Date(date).toLocaleDateString("en-US", DISPLAY_DATE_OPTIONS);
}

export function formatDisplayDateTime(date: Date | string | number): string {
  return new Date(date).toLocaleString("en-US", DISPLAY_DATETIME_OPTIONS);
}
