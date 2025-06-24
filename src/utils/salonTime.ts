import { format, setSeconds, setHours, setMinutes, addDays } from "date-fns";

/**
 * Returns a Date object representing the salon close time on the given reference date.
 * The returned date will be the same date as the reference date, but with the time set
 * to the salon close time. If the salon close time is 12:00 AM, the returned date will
 * be the next day midnight.
 *
 * @param {Date} salonCloseTime - Salon close time in 12 hour format
 * @param {Date} referenceDate - Reference date to get the close time for
 * @returns {Date} Date object representing the salon close time on the reference date
 */
export const getSalonCloseDateTime = (
  salonCloseTime: Date,
  referenceDate: Date
): Date => {
  const closeHours = salonCloseTime.getHours();
  const closeMinutes = salonCloseTime.getMinutes();

  let closeDateTime = setSeconds(
    setMinutes(setHours(referenceDate, closeHours), closeMinutes),
    0
  );

  // Special handling: if time is 12:00 AM, treat as next day midnight
  if (format(closeDateTime, "hh:mm a").toLowerCase() === "12:00 am") {
    closeDateTime = addDays(closeDateTime, 1);
  }

  return closeDateTime;
};
