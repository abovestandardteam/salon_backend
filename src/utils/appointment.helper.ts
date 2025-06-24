import { PrismaClient } from "@prisma/client";
import { format } from "date-fns";
import { StatusCodes } from "http-status-codes";
import { AppointmentStatus } from "@utils/enum";
import { getSalonCloseDateTime } from "@utils/salonTime";
import { errorResponse } from "@utils/response";
const prisma = new PrismaClient();

/**
 * Validates that a customer with the given ID exists.
 * Returns an error response if the customer does not exist, or null if it does.
 * @param {number} customerId ID of the customer to validate
 * @returns {Promise<null | ReturnType<typeof errorResponse>>}
 */
export const validateCustomerExists = async (customerId: number) => {
  if (!customerId) return null;

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  });

  if (!customer) {
    return errorResponse(
      StatusCodes.NOT_FOUND,
      `Customer with ID ${customerId} not found`
    );
  }

  return null;
};

/**
 * Validates the given service IDs and retrieves the corresponding services.
 * Also calculates the total duration of the services.
 *
 * @param {number[]} serviceIds - Array of service IDs to validate and fetch.
 * @param {boolean} [includeUser=false] - Whether to include user information with each service.
 * @returns {Promise<{ error: ReturnType<typeof errorResponse> } | { services: any[]; totalDuration: number }>}
 * Returns an object with services and their total duration if all IDs are valid,
 * or an error response if any service ID is invalid.
 */

export const validateAndFetchServices = async (
  serviceIds: number[],
  includeUser: boolean = false
): Promise<
  | { error: ReturnType<typeof errorResponse> }
  | { services: any[]; totalDuration: number }
> => {
  if (!serviceIds || serviceIds.length === 0) {
    return { services: [], totalDuration: 0 };
  }

  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds } },
    select: {
      id: true,
      duration: true,
      ...(includeUser ? { user: true } : {}),
    },
  });

  const foundServiceIds = new Set(services.map((s) => s.id));
  const invalidIds = serviceIds.filter((id) => !foundServiceIds.has(id));

  if (invalidIds.length > 0) {
    return {
      error: errorResponse(
        StatusCodes.BAD_REQUEST,
        `Invalid service(s): ${invalidIds.join(", ")}`
      ),
    };
  }

  const totalDuration = services.reduce((sum, s) => sum + s.duration, 0);
  return { services, totalDuration };
};

/**
 * Checks if the given time slot is available for booking.
 * @param date - The date of the appointment.
 * @param start - The start time of the appointment.
 * @param end - The end time of the appointment.
 * @param startTimeLabel - The text to display for the start time in the error message.
 * @param excludeId - The ID of the appointment to exclude from the check.
 * @returns A conflict error response if there is a conflicting appointment, otherwise null.
 */
export const checkOverlappingAppointment = async (
  date: Date,
  start: Date,
  end: Date,
  startTimeLabel: string,
  excludeId?: number
) => {
  const where: any = {
    status: AppointmentStatus.PENDING,
    date,
    startTime: { lt: end },
    endTime: { gt: start },
  };

  if (excludeId) {
    where.id = { not: excludeId };
  }

  const overlap = await prisma.appointment.findFirst({ where });

  if (overlap) {
    return errorResponse(
      StatusCodes.CONFLICT,
      `Time slot already booked from ${startTimeLabel} to ${format(
        end,
        "hh:mm a"
      ).toLowerCase()}`
    );
  }

  return null; // means no conflict
};

/**
 * Validates whether an appointment can be scheduled based on the salon's closing time.
 *
 * This function checks if the given start time for a service is within the operating
 * hours of the salon. If the salon's closing time on the specified date is earlier
 * than the provided start time, an error response is returned indicating that the
 * appointment cannot be scheduled.
 *
 * @param serviceId - The ID of the service to check.
 * @param startTime - The start time of the appointment to validate.
 * @returns A promise that resolves to `true` if the appointment can be scheduled,
 *          or an error response if the salon will be closed at the given start time.
 */
export const validateSalonClosingTime = async (
  serviceId: number,
  startTime: Date
): Promise<true | ReturnType<typeof errorResponse>> => {
  const serviceWithUser = await prisma.service.findFirst({
    where: { id: serviceId },
    include: { user: true },
  });

  if (!serviceWithUser?.user?.salonId) {
    return errorResponse(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Salon ID not found for the service"
    );
  }

  const salon = await prisma.salon.findFirst({
    where: { id: serviceWithUser.user.salonId },
  });

  if (!salon || !salon.closeTime) {
    return errorResponse(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Salon closing time is not configured"
    );
  }

  const salonCloseDateTime = getSalonCloseDateTime(salon.closeTime, startTime);

  if (startTime >= salonCloseDateTime) {
    return errorResponse(
      StatusCodes.BAD_REQUEST,
      `Salon closes at ${format(
        salonCloseDateTime,
        "hh:mm a"
      ).toLowerCase()}. Appointment not allowed after that.`
    );
  }

  return true;
};
