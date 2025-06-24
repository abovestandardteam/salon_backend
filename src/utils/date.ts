import { format } from "date-fns";
import { enUS } from "date-fns/locale";

/**
 * Format a given date to a string in "yyyy-MM-dd" format, e.g. "2022-04-14".
 * If the date is null or undefined, return null.
 * @param {Date | null | undefined} date Date to format
 * @returns {string | null} Formatted date string or null
 */
export const formatDate = (date?: Date | null): string | null => {
  return date ? format(date, "yyyy-MM-dd") : null;
};

/**
 * Format a given date to a string in "ddth MMMM, yyyy" format, e.g. "14th April, 2022".
 * If the date is null or undefined, return null.
 * @param {Date | null | undefined} date Date to format
 * @returns {string | null} Formatted date string or null
 */
export const formatDateWithSuffix = (date: Date | null): string | null => {
  if (!date) return null;

  const day = format(date, "do", { locale: enUS });
  const monthYear = format(date, "MMMM,yyyy");
  return `${day} ${monthYear}`;
};
