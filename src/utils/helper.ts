import { format, addMinutes, isBefore, isEqual } from "date-fns";
import { enUS } from "date-fns/locale";

export const generateTimeSlots = (start: Date, end: Date, duration: number) => {
  const slots = [];
  let current = start;

  while (
    isBefore(addMinutes(current, duration), end) ||
    isEqual(addMinutes(current, duration), end)
  ) {
    const slotEnd = addMinutes(current, duration);
    slots.push({ start: current, end: slotEnd });
    current = slotEnd;
  }

  return slots;
};

export const formatSlot = (slot: { start: Date; end: Date }) => ({
  start: format(slot.start, "hh:mm a").toLowerCase(),
  end: format(slot.end, "hh:mm a").toLowerCase(),
});

/**
 * Format a given date to a string in "hh:mm a" format.
 * If the date is null or undefined, return null.
 * @param {Date | null | undefined} date Date to format
 * @returns {string | null} Formatted time string or null
 */
export const formatTime = (date?: Date | null): string | null => {
  return date ? format(date, "hh:mm a").toLowerCase() : null;
};

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
