import { PrismaClient } from "@prisma/client";
import { CONSTANTS } from "@utils/constants";
import {
  addDays,
  endOfDay,
  format,
  isAfter,
  isBefore,
  isEqual,
  isSameDay,
  parse,
  parseISO,
  setHours,
  setMinutes,
  setSeconds,
  startOfDay,
} from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import { StatusCodes } from "http-status-codes";
import { AppointmentStatus, LeaveType, TimeZone } from "@utils/enum";
import { errorResponse, successResponse } from "@utils/response";
import { CreateAppointmentDTO } from "@validations/appointment.validation";
import { getPaginationMeta, getPaginationParams } from "@utils/pagination";
import { formatTime } from "@utils/time";
import { formatDateWithSuffix } from "@utils/date";
import { formatSlot, generateTimeSlots } from "@utils/slots";
import {
  checkOverlappingAppointment,
  validateAndFetchServices,
  validateCustomerExists,
  validateSalonClosingTime,
} from "@utils/appointment.helper";
const prisma = new PrismaClient();

// ---------------------------------------------------------------------------------------------------------------  [ create ]

export const createAppointment = async (body: CreateAppointmentDTO) => {
  const { serviceIds, date: dateObject, startTime, ...rest } = body;
  if (!startTime) {
    return errorResponse(
      StatusCodes.BAD_REQUEST,
      "Start time is required to create an appointment"
    );
  }

  // 📅 Step 1: Parse Date and StartTime (Handle "12:00 am")
  const dateString = dateObject.toISOString().split("T")[0];

  // Adjust the date if "12:00 am" is provided — treat it as next day midnight
  let parsedDateForTime = dateString;
  if (startTime.trim().toLowerCase() === "12:00 am") {
    const parsedDate = parseISO(dateString);
    parsedDateForTime = format(addDays(parsedDate, 1), "yyyy-MM-dd");
  }

  // Combine date + time and parse with timezone
  const start = fromZonedTime(
    parse(
      `${parsedDateForTime} ${startTime}`,
      "yyyy-MM-dd hh:mm a",
      new Date()
    ),
    TimeZone.IST
  );

  // ⛔ Step 2: Reject if StartTime is in the past
  const now = new Date();
  if (start < now) {
    return errorResponse(
      StatusCodes.BAD_REQUEST,
      `You cannot book an appointment in the past time`
    );
  }

  // 🧼 Step 3: Validate Service IDs
  const result = await validateAndFetchServices(serviceIds, true);
  if ("error" in result) return result.error;

  const { services, totalDuration } = result;

  // 👤 Step 4: Validate Customer
  const customerError = await validateCustomerExists(body.customerId);
  if (customerError) return customerError;

  // 🏠 Step 5: Fetch Salon Info and Close Time
  const validation = await validateSalonClosingTime(
    Number(services[0].id),
    start
  );
  if (validation !== true) return validation;

  // 🕓 Step 7: Calculate Appointment End Time
  const end = new Date(start.getTime() + totalDuration * 60_000);

  // ❌ Step 8: Check for Overlapping Appointments
  const conflict = await checkOverlappingAppointment(
    dateObject,
    start,
    end,
    startTime
  );
  if (conflict) return conflict;

  // ✅ Step 9: Create Appointment
  const appointment = await prisma.appointment.create({
    data: {
      ...rest,
      date: dateObject,
      startTime: start,
      endTime: end,
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
    appointment
  );
};

// ---------------------------------------------------------------------------------------------------------------  [ update ]

export const updateAppointment = async (
  id: number,
  data: Partial<CreateAppointmentDTO>
) => {
  // 🔍 Step 1: Find Existing Appointment
  const existing = await prisma.appointment.findUnique({ where: { id } });
  if (!existing) {
    return errorResponse(StatusCodes.NOT_FOUND, CONSTANTS.appointment.notFound);
  }

  // 🔄 Step 2: Extract Input
  const { serviceIds, date: dateObject, startTime, ...rest } = data;

  // 🧼 Step 3: Validate Services & Calculate Duration
  let totalDuration = 0;
  let services = [];

  // 🧼 Step 3: Validate Services & Calculate Duration
  if (serviceIds && serviceIds.length > 0) {
    const result = await validateAndFetchServices(serviceIds, true);
    if ("error" in result) return result.error;

    services = result.services;
    totalDuration = result.totalDuration;
  }

  // 👤 Step 4: Validate Customer (if updating)
  if (data.customerId) {
    const customerError = await validateCustomerExists(data.customerId);
    if (customerError) return customerError;
  }

  // 🕒 Step 5: Parse Start & End Time (if provided)
  let parsedStartTime: Date | undefined = undefined;
  let parsedEndTime: Date | undefined = undefined;

  const dateString = (dateObject ?? existing.date).toISOString().split("T")[0];

  // 🕛 Special handling for "12:00 am" — treat as next day midnight
  let parsedDateForTime = dateString;
  if (startTime && startTime.trim().toLowerCase() === "12:00 am") {
    const parsedDate = parseISO(dateString);
    parsedDateForTime = format(addDays(parsedDate, 1), "yyyy-MM-dd");
  }

  if (startTime) {
    parsedStartTime = fromZonedTime(
      parse(
        `${parsedDateForTime} ${startTime}`,
        "yyyy-MM-dd hh:mm a",
        new Date()
      ),
      TimeZone.IST
    );

    if (totalDuration > 0) {
      parsedEndTime = new Date(
        parsedStartTime.getTime() + totalDuration * 60000
      );
    }
  }

  // 🏠 Step 6: Fetch Salon Info and Close Time
  if (parsedStartTime && serviceIds && serviceIds.length > 0) {
    const validation = await validateSalonClosingTime(
      Number(serviceIds[0]),
      parsedStartTime
    );
    if (validation !== true) return validation;
  }

  // ⛔ Step 7: Reject if Start Time is in the Past
  const now = new Date();
  if (parsedStartTime && parsedStartTime < now) {
    return errorResponse(
      StatusCodes.BAD_REQUEST,
      `You cannot book an appointment in the past time`
    );
  }

  // ❌ Step 8: Check for Overlapping Appointments
  if (parsedStartTime && parsedEndTime) {
    const conflict = await checkOverlappingAppointment(
      dateObject ?? existing.date,
      parsedStartTime,
      parsedEndTime,
      startTime!,
      id // exclude current appointment
    );
    if (conflict) return conflict;
  }

  // 🛠️ Step 9: Prepare Data and Update Appointment
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

// ---------------------------------------------------------------------------------------------------------------  [ update status ]

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

// ---------------------------------------------------------------------------------------------------------------  [ delete ]

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

// ---------------------------------------------------------------------------------------------------------------  [ get one ]

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

// ---------------------------------------------------------------------------------------------------------------  [ get all ]

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

// ---------------------------------------------------------------------------------------------------------------  [ get slots ]

export const GetSlot = async (query: any) => {
  const inputDate = query.date ? new Date(query.date) : new Date();
  const today = isNaN(inputDate.getTime()) ? new Date() : inputDate;

  const currentDate = format(today, "yyyy-MM-dd");
  const currentDay = format(today, "EEEE");

  const salon = await prisma.salon.findFirst();
  if (!salon) {
    return errorResponse(StatusCodes.NOT_FOUND, CONSTANTS.salon.notFound);
  }

  const { openTime, closeTime } = salon;
  if (!openTime || !closeTime) {
    throw new Error("Open or Close time is missing");
  }

  // 🕒 Convert openTime and closeTime to today's date (time only)
  const openHours = openTime.getHours();
  const openMinutes = openTime.getMinutes();
  const closeHours = closeTime.getHours();
  const closeMinutes = closeTime.getMinutes();

  let adjustedOpenTime = setSeconds(
    setMinutes(setHours(today, openHours), openMinutes),
    0
  );
  let adjustedCloseTime = setSeconds(
    setMinutes(setHours(today, closeHours), closeMinutes),
    0
  );

  // Treat 12:00 AM as next day's midnight
  if (format(adjustedCloseTime, "hh:mm a").toLowerCase() === "12:00 am") {
    adjustedCloseTime = addDays(adjustedCloseTime, 1);
  }

  // 🎯 Get shortest service duration
  const services = await prisma.service.findMany();
  if (services.length === 0) {
    return errorResponse(StatusCodes.NOT_FOUND, CONSTANTS.service.notFound);
  }

  const minDuration = Math.min(...services.map((s) => s.duration));

  const start = startOfDay(today);
  const end = endOfDay(today);

  const leaveToday = await prisma.leave.findFirst({
    where: {
      date: {
        gte: start,
        lte: end,
      },
    },
  });

  if (leaveToday?.type === LeaveType.DAY) {
    return successResponse(StatusCodes.OK, CONSTANTS.salon.close, {
      date: currentDate,
      day: currentDay,
      slots: [],
    });
  }

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

  // ⏳ Generate all slots between open and close
  const allSlots = generateTimeSlots(
    adjustedOpenTime,
    adjustedCloseTime,
    minDuration
  );

  // ❌ Remove overlapping appointment slots
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

  // ❌ Remove past slots (if today)
  const now = new Date();
  if (isSameDay(today, now)) {
    availableSlots = availableSlots.filter((slot) => isAfter(slot.start, now));
  }

  // ❌ Remove slots overlapping with hour-based leave
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

  // ✅ Format slots to { start: "hh:mm am/pm", end: "hh:mm am/pm" }
  const formattedSlots = availableSlots.map(formatSlot);
  const startOnly = formattedSlots.map((slot) => slot.start);

  return successResponse(
    StatusCodes.OK,
    "Available slots fetched successfully",
    {
      totalFullSlots: formattedSlots.length,
      totalSlots: startOnly.length,
      date: currentDate,
      day: currentDay,
      slots: startOnly,
      fullSlots: formattedSlots,
    }
  );
};
