import { format, addMinutes, isBefore, isEqual } from "date-fns";

/**
 * Generates a list of time slots between a start and end time.
 * Each time slot has a specified duration.
 *
 * @param {Date} start - The start time for generating slots.
 * @param {Date} end - The end time by which slots should be generated.
 * @param {number} duration - The duration of each slot in minutes.
 * @returns {Array<{ start: Date, end: Date }>} An array of time slots, each with a start and end time.
 */

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

/**
 * Format a time slot object to a string representation
 * @param {Object} slot - A time slot object with `start` and `end` properties
 * @returns {Object} Formatted time slot object with `start` and `end` in "hh:mm a" format
 */
export const formatSlot = (slot: { start: Date; end: Date }) => ({
  start: format(slot.start, "hh:mm a").toLowerCase(),
  end: format(slot.end, "hh:mm a").toLowerCase(),
});
