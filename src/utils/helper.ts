import { format, addMinutes, isBefore, isEqual } from "date-fns";

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
