/**
 * Centralized Date and Time Utilities for GlarusAcademy
 * 
 * STANDARD FORMATS:
 * - Date: "DD MMM YYYY" (e.g. "10 Sep 2026")
 * - Time: "hh:mm AM/PM" (e.g. "11:00 AM", "09:00 PM")
 * - DateTime: "DD MMM YYYY, hh:mm AM/PM" (e.g. "10 Sep 2026, 11:00 AM")
 * 
 * Ensures timezone safety, prevents accidental UTC date shifting,
 * and maintains backward-compatibility with backend ISO / 24h data models.
 */

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const MONTHS_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * Safely parses any date representation into a local Date object.
 * Special handling for "YYYY-MM-DD" strings to prevent timezone day-offsetting.
 */
export function parseDate(value: string | Date | number | null | undefined): Date | null {
  if (!value) return null;

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "number") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    // Check if it matches pure "YYYY-MM-DD" or "YYYY/MM/DD"
    const dateOnlyMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (dateOnlyMatch) {
      const year = parseInt(dateOnlyMatch[1], 10);
      const month = parseInt(dateOnlyMatch[2], 10) - 1;
      const day = parseInt(dateOnlyMatch[3], 10);
      const d = new Date(year, month, day, 12, 0, 0);
      return isNaN(d.getTime()) ? null : d;
    }

    // Attempt standard Date parsing
    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
}

/**
 * Formats a date into the standard "DD MMM YYYY" format (e.g., "10 Sep 2026").
 */
export function formatDate(
  value: string | Date | number | null | undefined,
  fallback = ""
): string {
  if (!value) return fallback;

  // Optimized fast-path for pure "YYYY-MM-DD" strings without timezone overhead
  if (typeof value === "string") {
    const trimmed = value.trim();
    const dateOnlyMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (dateOnlyMatch && !trimmed.includes("T")) {
      const year = dateOnlyMatch[1];
      const monthIdx = parseInt(dateOnlyMatch[2], 10) - 1;
      const day = parseInt(dateOnlyMatch[3], 10);
      if (monthIdx >= 0 && monthIdx < 12 && day >= 1 && day <= 31) {
        const dd = day < 10 ? `0${day}` : `${day}`;
        return `${dd} ${MONTHS_SHORT[monthIdx]} ${year}`;
      }
    }
  }

  const d = parseDate(value);
  if (!d) return fallback;

  const day = d.getDate();
  const dd = day < 10 ? `0${day}` : `${day}`;
  const month = MONTHS_SHORT[d.getMonth()];
  const year = d.getFullYear();

  return `${dd} ${month} ${year}`;
}

/**
 * Formats a time into the standard "hh:mm AM/PM" format (e.g., "11:00 AM", "09:00 PM").
 * Accepts 24-hour strings ("14:30"), 12-hour strings ("2:30pm", "09:00 PM"), Date objects, or timestamps.
 */
export function formatTime(
  value: string | Date | number | null | undefined,
  fallback = ""
): string {
  if (!value && value !== 0) return fallback;

  if (value instanceof Date || typeof value === "number") {
    const d = parseDate(value);
    if (!d) return fallback;
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const hh = hours < 10 ? `0${hours}` : `${hours}`;
    const mm = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${hh}:${mm} ${period}`;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return fallback;

    // Check if ISO string was passed
    if (trimmed.includes("T") || trimmed.includes("Z")) {
      const d = parseDate(trimmed);
      if (d) {
        let hours = d.getHours();
        const minutes = d.getMinutes();
        const period = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        const hh = hours < 10 ? `0${hours}` : `${hours}`;
        const mm = minutes < 10 ? `0${minutes}` : `${minutes}`;
        return `${hh}:${mm} ${period}`;
      }
    }

    // Match 12h or 24h formats like "11:00 AM", "11:00am", "11:00", "9:30", "21:00", "9pm"
    const timeMatch = trimmed.match(/^(\d{1,2})(?::(\d{1,2}))?\s*(am|pm|AM|PM)?$/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const periodRaw = timeMatch[3] ? timeMatch[3].toUpperCase() : null;

      if (minutes < 0 || minutes > 59) return fallback;

      if (periodRaw) {
        // Explicit 12-hour period provided
        if (hours < 1 || hours > 12) return fallback;
        const hh = hours < 10 ? `0${hours}` : `${hours}`;
        const mm = minutes < 10 ? `0${minutes}` : `${minutes}`;
        return `${hh}:${mm} ${periodRaw}`;
      } else {
        // 24-hour time string without AM/PM
        if (hours < 0 || hours > 23) return fallback;
        const period = hours >= 12 ? "PM" : "AM";
        const displayHours = hours % 12 || 12;
        const hh = displayHours < 10 ? `0${displayHours}` : `${displayHours}`;
        const mm = minutes < 10 ? `0${minutes}` : `${minutes}`;
        return `${hh}:${mm} ${period}`;
      }
    }

    return trimmed;
  }

  return fallback;
}

/**
 * Formats a datetime into standard "DD MMM YYYY, hh:mm AM/PM" (e.g. "10 Sep 2026, 11:00 AM").
 */
export function formatDateTime(
  value: string | Date | number | null | undefined,
  fallback = ""
): string {
  if (!value) return fallback;
  const d = parseDate(value);
  if (!d) return fallback;

  const dateFormatted = formatDate(d);
  const timeFormatted = formatTime(d);
  if (!dateFormatted) return fallback;

  return `${dateFormatted}, ${timeFormatted}`;
}

/**
 * Formats a Date object or string for standard HTML/DB "YYYY-MM-DD" format.
 */
export function formatDateForInput(value: string | Date | number | null | undefined): string {
  if (!value) return "";

  if (typeof value === "string") {
    const trimmed = value.trim();
    const dateOnlyMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (dateOnlyMatch && !trimmed.includes("T")) {
      const year = dateOnlyMatch[1];
      const month = parseInt(dateOnlyMatch[2], 10);
      const day = parseInt(dateOnlyMatch[3], 10);
      const mm = month < 10 ? `0${month}` : `${month}`;
      const dd = day < 10 ? `0${day}` : `${day}`;
      return `${year}-${mm}-${dd}`;
    }
  }

  const d = parseDate(value);
  if (!d) return "";

  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const mm = month < 10 ? `0${month}` : `${month}`;
  const dd = day < 10 ? `0${day}` : `${day}`;

  return `${year}-${mm}-${dd}`;
}

/**
 * Formats time for storage or input.
 * Default output is "24h" ("HH:mm") or "12h" ("hh:mm AM/PM").
 */
export function formatTimeForInput(
  value: string | Date | number | null | undefined,
  outputFormat: "12h" | "24h" = "24h"
): string {
  if (!value && value !== 0) return "";

  const parsed = parseTime(value as any);
  if (!parsed) return "";

  if (outputFormat === "24h") {
    const hh = parsed.hours24 < 10 ? `0${parsed.hours24}` : `${parsed.hours24}`;
    const mm = parsed.minutes < 10 ? `0${parsed.minutes}` : `${parsed.minutes}`;
    return `${hh}:${mm}`;
  }

  return parsed.formatted12;
}

/**
 * Detailed parser for time strings in any format.
 */
export function parseTime(value: string | Date | number | null | undefined): {
  hours12: number;
  hours24: number;
  minutes: number;
  period: "AM" | "PM";
  formatted12: string;
  raw24: string;
  totalMinutes: number;
} | null {
  if (!value && value !== 0) return null;

  let h24 = 0;
  let min = 0;

  if (value instanceof Date || typeof value === "number") {
    const d = parseDate(value);
    if (!d) return null;
    h24 = d.getHours();
    min = d.getMinutes();
  } else if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    if (trimmed.includes("T") || trimmed.includes("Z")) {
      const d = parseDate(trimmed);
      if (!d) return null;
      h24 = d.getHours();
      min = d.getMinutes();
    } else {
      const match = trimmed.match(/^(\d{1,2})(?::(\d{1,2}))?\s*(am|pm|AM|PM)?$/i);
      if (!match) return null;

      const rawH = parseInt(match[1], 10);
      min = match[2] ? parseInt(match[2], 10) : 0;
      const period = match[3] ? match[3].toUpperCase() : null;

      if (min < 0 || min > 59) return null;

      if (period) {
        if (rawH < 1 || rawH > 12) return null;
        if (period === "AM") {
          h24 = rawH === 12 ? 0 : rawH;
        } else {
          h24 = rawH === 12 ? 12 : rawH + 12;
        }
      } else {
        if (rawH < 0 || rawH > 23) return null;
        h24 = rawH;
      }
    }
  } else {
    return null;
  }

  const period: "AM" | "PM" = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 || 12;
  const hh12 = h12 < 10 ? `0${h12}` : `${h12}`;
  const mm = min < 10 ? `0${min}` : `${min}`;
  const hh24 = h24 < 10 ? `0${h24}` : `${h24}`;

  return {
    hours12: h12,
    hours24: h24,
    minutes: min,
    period,
    formatted12: `${hh12}:${mm} ${period}`,
    raw24: `${hh24}:${mm}`,
    totalMinutes: h24 * 60 + min,
  };
}

/**
 * Combines a date string/object with a time string to construct a Date object.
 */
export function combineDateAndTime(
  dateValue: string | Date | null | undefined,
  timeValue: string | null | undefined
): Date | null {
  const baseDate = parseDate(dateValue);
  if (!baseDate) return null;

  if (!timeValue) return baseDate;

  const timeParsed = parseTime(timeValue);
  if (!timeParsed) return baseDate;

  const combined = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate(),
    timeParsed.hours24,
    timeParsed.minutes,
    0,
    0
  );

  return combined;
}

/**
 * Validates start and end time range.
 * Returns valid true if endTime is strictly after startTime.
 */
export function validateTimeRange(
  startTime: string | null | undefined,
  endTime: string | null | undefined,
  options?: { allowCrossingMidnight?: boolean }
): { isValid: boolean; error?: string } {
  if (!startTime || !startTime.trim()) {
    return { isValid: false, error: "Start time is required" };
  }

  if (!endTime || !endTime.trim()) {
    return { isValid: false, error: "End time is required" };
  }

  const start = parseTime(startTime);
  if (!start) {
    return { isValid: false, error: "Invalid start time format" };
  }

  const end = parseTime(endTime);
  if (!end) {
    return { isValid: false, error: "Invalid end time format" };
  }

  if (end.totalMinutes <= start.totalMinutes) {
    if (options?.allowCrossingMidnight) {
      return { isValid: true };
    }
    return { isValid: false, error: "End time must be after start time" };
  }

  return { isValid: true };
}

/**
 * Validates start and end date range.
 */
export function validateDateRange(
  startDate: string | Date | null | undefined,
  endDate: string | Date | null | undefined
): { isValid: boolean; error?: string } {
  if (!startDate) {
    return { isValid: false, error: "Start date is required" };
  }

  const start = parseDate(startDate);
  if (!start) {
    return { isValid: false, error: "Invalid start date" };
  }

  if (endDate) {
    const end = parseDate(endDate);
    if (!end) {
      return { isValid: false, error: "Invalid end date" };
    }

    if (end.getTime() < start.getTime()) {
      return { isValid: false, error: "End date cannot be before start date" };
    }
  }

  return { isValid: true };
}
