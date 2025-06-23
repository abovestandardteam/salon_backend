import { PrismaClient } from "@prisma/client";
import { CONSTANTS } from "@utils/constants";
import {
  endOfDay,
  format,
  isAfter,
  isBefore,
  isEqual,
  parse,
  startOfDay,
} from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import { StatusCodes } from "http-status-codes";
import { AppointmentStatus, LeaveType, TimeZone } from "@utils/enum";
import {
  formatDateWithSuffix,
  formatSlot,
  formatTime,
  generateTimeSlots,
} from "@utils/helper";
import { errorResponse, successResponse } from "@utils/response";
import { CreateAppointmentDTO } from "@validations/appointment.validation";
import { getPaginationMeta, getPaginationParams } from "@utils/pagination";
const prisma = new PrismaClient();

export const createAppointment = async (body: CreateAppointmentDTO) => {
  const { serviceIds, date: dateObject, startTime, endTime, ...rest } = body;

  // ✅ Validate that all provided service IDs exist
  const foundServices = await prisma.service.findMany({
    where: { id: { in: serviceIds } },
    select: { id: true },
  });

  const foundServiceIds = new Set(foundServices.map((s) => s.id));
  const invalidIds = serviceIds.filter((id) => !foundServiceIds.has(id));

  if (invalidIds.length > 0) {
    return errorResponse(
      StatusCodes.BAD_REQUEST,
      `Service not found: ${invalidIds.join(", ")}`
    );
  }

  // ✅ Check if customer exists
  const existingCustomer = await prisma.customer.findUnique({
    where: { id: body.customerId },
  });

  if (!existingCustomer) {
    return errorResponse(
      StatusCodes.NOT_FOUND,
      `Customer with ID ${body.customerId} not found`
    );
  }

  // Convert date to YYYY-MM-DD string
  const dateString = dateObject.toISOString().split("T")[0];

  // Combine date + time and convert from user's timezone to UTC
  const parsedStartTime = startTime
    ? fromZonedTime(
        parse(`${dateString} ${startTime}`, "yyyy-MM-dd hh:mm a", new Date()),
        TimeZone.IST
      )
    : undefined;

  const parsedEndTime = endTime
    ? fromZonedTime(
        parse(`${dateString} ${endTime}`, "yyyy-MM-dd hh:mm a", new Date()),
        TimeZone.IST
      )
    : undefined;

  // 🚫 Reject if start time is in the past
  const now = new Date(); // Current UTC time
  if (parsedStartTime && parsedStartTime < now) {
    return errorResponse(
      StatusCodes.BAD_REQUEST,
      `You cannot book an appointment in the past`
    );
  }

  // ✅ Check for overlapping appointments
  const overlappingAppointment = await prisma.appointment.findFirst({
    where: {
      status: AppointmentStatus.PENDING,
      date: dateObject,
      startTime: { lt: parsedEndTime },
      endTime: { gt: parsedStartTime },
    },
  });

  if (overlappingAppointment) {
    return errorResponse(
      StatusCodes.CONFLICT,
      `Time slot already booked from ${startTime} to ${endTime}`
    );
  }

  const newAppointment = await prisma.appointment.create({
    data: {
      ...rest,
      date: dateObject,
      startTime: parsedStartTime,
      endTime: parsedEndTime,
      services: {
        connect: serviceIds.map((id) => ({ id })),
      },
    },
    include: {
      services: true,
    },
  });

  return successResponse(
    StatusCodes.OK,
    CONSTANTS.appointment.createSuccess,
    newAppointment
  );
};

export const updateAppointment = async (
  id: number,
  data: Partial<CreateAppointmentDTO>
) => {
  const existing = await prisma.appointment.findUnique({
    where: { id: id },
  });
  if (!existing) {
    return errorResponse(StatusCodes.NOT_FOUND, CONSTANTS.appointment.notFound);
  }

  const { serviceIds, date: dateObject, startTime, endTime, ...rest } = data;

  // 🧪 Validate serviceIds if provided
  if (serviceIds && serviceIds.length > 0) {
    const foundServices = await prisma.service.findMany({
      where: { id: { in: serviceIds } },
      select: { id: true },
    });

    const foundServiceIds = new Set(foundServices.map((s) => s.id));
    const invalidIds = serviceIds.filter((id) => !foundServiceIds.has(id));

    if (invalidIds.length > 0) {
      return errorResponse(
        StatusCodes.BAD_REQUEST,
        `Service not found: ${invalidIds.join(", ")}`
      );
    }
  }

  // ✅ Check if customer exists
  const existingCustomer = await prisma.customer.findUnique({
    where: { id: data.customerId },
  });

  if (!existingCustomer) {
    return errorResponse(
      StatusCodes.NOT_FOUND,
      `Customer with ID ${data.customerId} not found`
    );
  }

  // 🕒 Parse date/time if provided
  const dateString = dateObject
    ? dateObject.toISOString().split("T")[0]
    : undefined;

  let parsedStartTime = undefined;
  let parsedEndTime = undefined;

  if (dateString && startTime) {
    parsedStartTime = fromZonedTime(
      parse(`${dateString} ${startTime}`, "yyyy-MM-dd hh:mm a", new Date()),
      TimeZone.IST
    );
  }

  if (dateString && endTime) {
    parsedEndTime = fromZonedTime(
      parse(`${dateString} ${endTime}`, "yyyy-MM-dd hh:mm a", new Date()),
      TimeZone.IST
    );
  }

  // 🚫 Reject if start time is in the past
  const now = new Date(); // Current UTC time
  if (parsedStartTime && parsedStartTime < now) {
    return errorResponse(
      StatusCodes.BAD_REQUEST,
      `You cannot book an appointment in the past`
    );
  }

  // ❌ Check for overlapping appointments if time is being updated
  if (parsedStartTime && parsedEndTime && dateObject) {
    const overlap = await prisma.appointment.findFirst({
      where: {
        id: { not: id },
        status: AppointmentStatus.PENDING,
        date: dateObject,
        startTime: { lt: parsedEndTime },
        endTime: { gt: parsedStartTime },
      },
    });

    if (overlap) {
      return errorResponse(
        StatusCodes.CONFLICT,
        `Time slot already booked from ${startTime} to ${endTime}`
      );
    }
  }

  // 🛠️ Construct update object
  const updateData: any = {
    ...rest,
    ...(dateObject && { date: dateObject }),
    ...(parsedStartTime && { startTime: parsedStartTime }),
    ...(parsedEndTime && { endTime: parsedEndTime }),
    ...(serviceIds && {
      services: {
        set: serviceIds.map((id) => ({ id })),
      },
    }),
  };

  const appointment = await prisma.appointment.update({
    where: { id },
    data: updateData,
    include: { services: true },
  });
  return successResponse(
    StatusCodes.OK,
    CONSTANTS.appointment.updateSuccess,
    appointment
  );
};

export const updateAppointmentStatus = async (
  appointmentId: number,
  body: { status: AppointmentStatus }
) => {
  const existing = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!existing) {
    return errorResponse(StatusCodes.NOT_FOUND, CONSTANTS.appointment.notFound);
  }

  const updated = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: body.status },
  });

  return successResponse(
    StatusCodes.OK,
    CONSTANTS.appointment.updateSuccess,
    updated
  );
};

export const deleteAppointment = async (id: number) => {
  const appointment = await prisma.appointment.findUnique({ where: { id } });

  if (!appointment) {
    return errorResponse(StatusCodes.NOT_FOUND, CONSTANTS.appointment.notFound);
  }

  const deletedService = await prisma.appointment.delete({
    where: { id },
  });

  return successResponse(
    StatusCodes.OK,
    CONSTANTS.appointment.deleteSuccess,
    deletedService
  );
};

export const getAppointmentById = async (id: number) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      services: true,
      customer: true,
    },
  });

  if (!appointment) {
    return errorResponse(StatusCodes.NOT_FOUND, CONSTANTS.appointment.notFound);
  }

  const formattedSlot = {
    ...appointment,
    startTime: formatTime(appointment.startTime),
    endTime: formatTime(appointment.endTime),
  };
  return successResponse(
    StatusCodes.OK,
    CONSTANTS.appointment.foundSuccess,
    formattedSlot
  );
};

export const getAllAppointment = async (user: any, query: any) => {
  const { page, limit, skip } = getPaginationParams(query);

  // 1) Is customer?
  const isCustomer = user.userType === "customer";

  // 2) Base filter
  const baseFilter = isCustomer ? { customerId: user.id } : {};

  // 3) Optional status filter
  const statusFilter = query.status ? { status: query.status } : {};

  // 4) Merge filters
  const whereCondition = {
    ...baseFilter,
    ...statusFilter,
  };

  // 5) Get total count for pagination
  const total = await prisma.appointment.count({ where: whereCondition });

  // 6) Get paginated appointments
  const appointments = await prisma.appointment.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      date: true,
      startTime: true,
      endTime: true,
      status: true,
      services: {
        select: { name: true, duration: true, price: true },
      },
      customer: {
        select: { firstName: true, lastName: true, mobileNumber: true },
      },
    },
  });

  // 7) Format output
  const formattedAppointments = appointments.map((a) => ({
    ...a,
    date: formatDateWithSuffix(a.date),
    startTime: formatTime(a.startTime),
    endTime: formatTime(a.endTime),
  }));

  // 8) Return with pagination
  return successResponse(
    StatusCodes.OK,
    CONSTANTS.appointment.foundSuccess,
    formattedAppointments,
    getPaginationMeta(total, page, limit)
  );
};

export const GetSlot = async (query: any) => {
  const inputDate = query.date ? new Date(query.date) : new Date();
  const today = isNaN(inputDate.getTime()) ? new Date() : inputDate;

  // 📅 Get today's date, day name, and time range
  const currentDate = format(today, "yyyy-MM-dd");
  const currentDay = format(today, "EEEE");

  // 🏠 Fetch salon info
  const salon = await prisma.salon.findFirst();
  if (!salon) {
    return errorResponse(StatusCodes.NOT_FOUND, CONSTANTS.salon.notFound);
  }

  const { openTime, closeTime } = salon;
  if (!openTime || !closeTime) {
    throw new Error("Open or Close time is missing");
  }

  // 💇‍♀️ Get all services and determine shortest duration
  const services = await prisma.service.findMany();
  if (services.length === 0) {
    return errorResponse(StatusCodes.NOT_FOUND, CONSTANTS.service.notFound);
  }

  const minDuration = Math.min(...services.map((s) => s.duration));

  // ⏳ Define today's range in UTC (adjusted from IST)
  const start = startOfDay(today);
  const end = endOfDay(today);

  // 📆 Check if there's a leave today
  const leaveToday = await prisma.leave.findFirst({
    where: {
      date: {
        gte: start,
        lte: end,
      },
    },
  });

  // 🚫 If it's a full-day leave, return no slots
  if (leaveToday?.type === LeaveType.DAY) {
    return successResponse(StatusCodes.OK, CONSTANTS.salon.close, {
      date: currentDate,
      day: currentDay,
      slots: [],
    });
  }

  // 📋 Get today's pending appointments
  const appointments = await prisma.appointment.findMany({
    where: {
      status: AppointmentStatus.PENDING,
      date: {
        gte: start,
        lte: end,
      },
    },
    select: {
      startTime: true,
      endTime: true,
    },
  });

  // 🕰️ Generate time slots between openTime and closeTime
  const allSlots = generateTimeSlots(openTime, closeTime, minDuration);

  // ❌ Remove slots that overlap with existing appointments
  let availableSlots = allSlots.filter((slot) => {
    return !appointments.some((appt) => {
      if (!appt.startTime || !appt.endTime) return false;
      return (
        (isBefore(slot.start, appt.endTime) &&
          isAfter(slot.end, appt.startTime)) ||
        isEqual(slot.start, appt.startTime)
      );
    });
  });

  // ⛔ Remove slots affected by hour-based leave
  if (
    leaveToday?.type === LeaveType.HOURS &&
    leaveToday.startTime &&
    leaveToday.endTime
  ) {
    const leaveStart = new Date(leaveToday.startTime);
    const leaveEnd = new Date(leaveToday.endTime);

    availableSlots = availableSlots.filter((slot) => {
      return !(slot.start < leaveEnd && slot.end > leaveStart);
    });
  }

  // ✅ Format remaining slots to { start: "hh:mm am/pm", end: "hh:mm am/pm" }
  const formattedSlots = availableSlots.map(formatSlot);

  // 🎉 Return response
  return successResponse(
    StatusCodes.OK,
    "Available slots fetched successfully",
    {
      totalSlots: formattedSlots.length,
      date: currentDate,
      day: currentDay,
      slots: formattedSlots,
    }
  );
};
