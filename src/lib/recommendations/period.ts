const RESET_HOUR = 8;
const TIMEZONE = "Asia/Jakarta";

type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
};

function getZonedParts(date: Date, timeZone: string): ZonedParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((part) => part.type === type)?.value ?? "0";

  const hourRaw = get("hour");
  // Some engines emit "24" for midnight.
  const hour = hourRaw === "24" ? 0 : Number(hourRaw);

  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour,
  };
}

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Daily recommendation bucket that resets at 08:00 Asia/Jakarta.
 * Before 8am, belongs to the previous calendar day's period.
 */
export function getRecommendationPeriodKey(now = new Date()): string {
  const { year, month, day, hour } = getZonedParts(now, TIMEZONE);

  if (hour >= RESET_HOUR) {
    return formatDateKey(year, month, day);
  }

  // Step back one calendar day in the local timezone.
  const noonUtc = Date.UTC(year, month - 1, day, 12, 0, 0);
  const previous = new Date(noonUtc - 24 * 60 * 60 * 1000);
  const prev = getZonedParts(previous, TIMEZONE);
  return formatDateKey(prev.year, prev.month, prev.day);
}
