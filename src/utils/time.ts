import { format } from "date-fns";

/**
 * Format a given date to a string in "hh:mm a" format.
 * If the date is null or undefined, return null.
 * @param {Date | null | undefined} date Date to format
 * @returns {string | null} Formatted time string or null
 */
export const formatTime = (date?: Date | null): string | null => {
  return date ? format(date, "hh:mm a").toLowerCase() : null;
};

/**
 * Converts a duration in minutes to a human-readable string format.
 *
 * @param {number} minutes - Duration in minutes to be formatted.
 * @returns {string} A string representing the duration in hours and minutes,
 *                   e.g., "1 hr and 30 min", "2 hrs", "45 min".
 */

export const formatDuration = (minutes: number): string => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hrs && mins) return `${hrs} hr${hrs > 1 ? "s" : ""} and ${mins} min`;
  if (hrs) return `${hrs} hr${hrs > 1 ? "s" : ""}`;
  return `${mins} min`;
};
