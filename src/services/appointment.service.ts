import { PrismaClient } from "@prisma/client";
import { MESSAGES } from "@utils/messages";
import {
  endOfDay,
  format,
  isAfter,
  isBefore,
  isEqual,
  parse,
  startOfDay,
} from "date-fns";
import { AppointmentStatus, LeaveType } from "@utils/enum";
import { StatusCodes } from "http-status-codes";
import { formatSlot, generateTimeSlots } from "@utils/helper";
import { errorResponse, successResponse } from "@utils/response";
import { CreateAppointmentDTO } from "@validations/appointment.validation";
const prisma = new PrismaClient();

export const createAppointment = async (body: CreateAppointmentDTO) => {
  const { serviceIds, date: dateObject, startTime, endTime, ...rest } = body;

  // Convert date to YYYY-MM-DD string
  const dateString = dateObject.toISOString().split("T")[0];

  // Parse times using the provided date as base (local time assumed)
  const parsedStartTime = parse(
    `${dateString} ${startTime}`,
    "yyyy-MM-dd hh:mm a",
    new Date()
  );

  const parsedEndTime = parse(
    `${dateString} ${endTime}`,
    "yyyy-MM-dd hh:mm a",
    new Date()
  );

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
    MESSAGES.appointment.createSuccess,
    newAppointment
  );
};

export const updateAppointment = async (
  id: number,
  data: Partial<CreateAppointmentDTO>
) => {
  const appointment = await prisma.appointment.update({
    where: { id },
    data,
  });
  return successResponse(
    StatusCodes.OK,
    MESSAGES.appointment.updateSuccess,
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
    return errorResponse(StatusCodes.NOT_FOUND, MESSAGES.appointment.notFound);
  }

  const updated = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: body.status },
  });

  return successResponse(
    StatusCodes.OK,
    MESSAGES.appointment.updateSuccess,
    updated
  );
};

export const deleteAppointment = async (id: number) => {
  const appointment = await prisma.appointment.findUnique({ where: { id } });

  if (!appointment) {
    return errorResponse(StatusCodes.NOT_FOUND, MESSAGES.appointment.notFound);
  }

  const deletedService = await prisma.appointment.delete({
    where: { id },
  });

  return successResponse(
    StatusCodes.OK,
    MESSAGES.appointment.deleteSuccess,
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
    return errorResponse(StatusCodes.NOT_FOUND, MESSAGES.appointment.notFound);
  }

  return successResponse(
    StatusCodes.OK,
    MESSAGES.appointment.foundSuccess,
    appointment
  );
};

export const getAllAppointment = async (authUser: any, query: any) => {
  // 1) Base filter: if a plain USER, only their own appointments
  const baseFilter =
    authUser.role === "USER" ? { customerId: authUser.id } : {};

  // 2) Status filter: only apply if query.status is provided
  const statusFilter = query.status ? { status: query.status } : {};

  // 3) Merge filters
  const whereCondition = {
    ...baseFilter,
    ...statusFilter,
  };

  // 4) Fetch
  const appointments = await prisma.appointment.findMany({
    where: whereCondition,
    orderBy: { createdAt: "desc" },
    include: {
      services: true,
      customer: true,
    },
  });

  return successResponse(
    StatusCodes.OK,
    MESSAGES.appointment.foundSuccess,
    appointments
  );
};

export const GetSlot = async () => {
  // Get today's full date range
  const today = new Date();
  const currentDate = format(new Date(), "yyyy-MM-dd");
  const currentDay = format(new Date(), "EEEE");

  const salon = await prisma.salon.findFirst();
  if (!salon) {
    return errorResponse(StatusCodes.NOT_FOUND, MESSAGES.salon.notFound);
  }

  const { openTime, closeTime } = salon;
  if (!openTime || !closeTime) {
    throw new Error("Open or Close time is missing");
  }

  const services = await prisma.service.findMany();
  if (services.length === 0) {
    return errorResponse(StatusCodes.NOT_FOUND, MESSAGES.service.notFound);
  }

  const minDuration = Math.min(...services.map((s) => s.duration));

  const start = startOfDay(today);
  const end = endOfDay(today);
  console.log(start);
  console.log(end);
  const leaveToday = await prisma.leave.findFirst({
    where: {
      date: {
        gte: start,
        lte: end,
      },
    },
  });
  console.log(leaveToday);
  // 💡 Return empty if it's a full-day leave
  if (leaveToday?.type === LeaveType.DAY) {
    return successResponse(
      StatusCodes.OK,
      "Salon is closed today due to leave",
      {
        date: currentDate,
        day: currentDay,
        slots: [],
      }
    );
  }

  const todayStart = new Date(today.setHours(0, 0, 0, 0));
  const todayEnd = new Date(today.setHours(23, 59, 59, 999));

  // Get pending appointments
  const appointments = await prisma.appointment.findMany({
    where: {
      status: AppointmentStatus.PENDING,
      startTime: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
    select: {
      startTime: true,
      endTime: true,
    },
  });

  // Generate all slots
  const allSlots = generateTimeSlots(openTime, closeTime, minDuration);

  // Exclude slots booked by appointments
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
  console.log(leaveToday);
  // 💡 If leave type is HOURS, remove affected slots
  if (
    leaveToday?.type === LeaveType.HOURS &&
    leaveToday.startTime &&
    leaveToday.endTime
  ) {
    console.log(leaveToday.startTime);
    console.log(leaveToday.endTime);
    // const leaveStart = parse(leaveToday.startTime, "hh:mm a", new Date());
    // const leaveEnd = parse(leaveToday.endTime, "hh:mm a", new Date());
    const leaveStart = new Date(leaveToday.startTime);
    const leaveEnd = new Date(leaveToday.endTime);

    availableSlots = availableSlots.filter((slot) => {
      return isBefore(slot.end, leaveStart) || isAfter(slot.start, leaveEnd);
    });
  }

  // Format slots
  const formattedSlots = availableSlots.map(formatSlot);

  return successResponse(
    StatusCodes.OK,
    "Available slots fetched successfully",
    {
      date: currentDate,
      day: currentDay,
      slots: formattedSlots,
    }
  );
};
