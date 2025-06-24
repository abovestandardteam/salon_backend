import { PrismaClient, SalonUser } from "@prisma/client";
import { LeaveType, TimeZone } from "@utils/enum";
import { parse, format } from "date-fns";
import { CONSTANTS } from "@utils/constants";
import { fromZonedTime } from "date-fns-tz";
import { StatusCodes } from "http-status-codes";
import { CreateLeaveDTO } from "@validations/leave.validation";
import { errorResponse, successResponse } from "@utils/response";
import { getPaginationMeta, getPaginationParams } from "@utils/pagination";
import { formatTime } from "@utils/time";
const prisma = new PrismaClient();

export const createLeave = async (body: CreateLeaveDTO, user: SalonUser) => {
  const { date: dateString, startTime, endTime, type, ...rest } = body;

  // Parse date only
  const parsedDate = parse(dateString, "yyyy-MM-dd", new Date());

  // 🔍 Check if a DAY leave already exists for that date
  if (type === LeaveType.DAY) {
    const existingDayLeave = await prisma.leave.findFirst({
      where: {
        date: parsedDate,
        type: LeaveType.DAY,
        userId: user.id,
      },
    });

    if (existingDayLeave) {
      return errorResponse(
        StatusCodes.BAD_REQUEST,
        `You’ve already scheduled a full-day leave on ${dateString}.`
      );
    }
  }

  // ⏱ Parse start and end time (for HOUR-based leave)
  const parsedStartTime = startTime
    ? fromZonedTime(
        parse(`${dateString} ${startTime}`, "yyyy-MM-dd hh:mm a", new Date()),
        TimeZone.IST
      )
    : null;

  const parsedEndTime = endTime
    ? fromZonedTime(
        parse(`${dateString} ${endTime}`, "yyyy-MM-dd hh:mm a", new Date()),
        TimeZone.IST
      )
    : null;

  const newLeave = await prisma.leave.create({
    data: {
      ...rest,
      userId: user.id,
      date: parsedDate,
      startTime: parsedStartTime,
      endTime: parsedEndTime,
      type,
    },
  });

  return successResponse(
    StatusCodes.CREATED,
    CONSTANTS.leave.createSuccess,
    newLeave
  );
};

export const updateLeave = async (
  id: number,
  data: Partial<CreateLeaveDTO>
) => {
  const existingLeave = await prisma.leave.findUnique({ where: { id } });

  if (!existingLeave) {
    return errorResponse(StatusCodes.NOT_FOUND, CONSTANTS.leave.notFound);
  }

  const updates: any = { ...data };

  // 🗓️ Determine the date for validation and parsing
  const dateInput = data.date ?? existingLeave.date;
  const parsedDate =
    typeof dateInput === "string"
      ? parse(dateInput, "yyyy-MM-dd", new Date())
      : dateInput;

  // ❌ Prevent duplicate full-day leave on same date
  if (data.type === LeaveType.DAY) {
    const existingDayLeave = await prisma.leave.findFirst({
      where: {
        id: { not: id }, // Exclude current leave
        userId: existingLeave.userId,
        date: parsedDate,
        type: LeaveType.DAY,
      },
    });

    if (existingDayLeave) {
      return errorResponse(
        StatusCodes.BAD_REQUEST,
        `You’ve already scheduled a full-day leave on ${format(
          parsedDate,
          "yyyy-MM-dd"
        )}.`
      );
    }
  }

  // Update parsed date
  if (data.date) {
    updates.date = parsedDate;
  }

  // ⏰ Convert startTime to UTC
  if (data.startTime) {
    const combinedStart = parse(
      `${format(parsedDate, "yyyy-MM-dd")} ${data.startTime}`,
      "yyyy-MM-dd hh:mm a",
      new Date()
    );
    updates.startTime = fromZonedTime(combinedStart, TimeZone.IST);
  }

  // ⏰ Convert endTime to UTC
  if (data.endTime) {
    const combinedEnd = parse(
      `${format(parsedDate, "yyyy-MM-dd")} ${data.endTime}`,
      "yyyy-MM-dd hh:mm a",
      new Date()
    );
    updates.endTime = fromZonedTime(combinedEnd, TimeZone.IST);
  }

  const updatedLeave = await prisma.leave.update({
    where: { id },
    data: updates,
  });

  return successResponse(
    StatusCodes.OK,
    CONSTANTS.leave.updateSuccess,
    updatedLeave
  );
};

export const deleteLeave = async (id: number) => {
  const leave = await prisma.leave.findUnique({ where: { id } });
  if (!leave) {
    return errorResponse(StatusCodes.NOT_FOUND, CONSTANTS.leave.notFound);
  }

  const deletedLeave = await prisma.leave.delete({
    where: { id },
  });

  return successResponse(
    StatusCodes.OK,
    CONSTANTS.leave.deleteSuccess,
    deletedLeave
  );
};

export const getLeaveById = async (id: number) => {
  const leave = await prisma.leave.findUnique({
    where: { id },
  });
  if (!leave) {
    return errorResponse(StatusCodes.NOT_FOUND, CONSTANTS.leave.notFound);
  }

  const formattedLeave = {
    ...leave,
    startTime: formatTime(leave.startTime),
    endTime: formatTime(leave.endTime),
    date: format(leave.date, "yyyy-MM-dd"),
  };

  return successResponse(
    StatusCodes.OK,
    CONSTANTS.leave.foundSuccess,
    formattedLeave
  );
};

export const getAllLeave = async (query: any) => {
  const { page, limit, skip } = getPaginationParams(query);

  // 1. Get total count
  const total = await prisma.leave.count();

  // 2. Get paginated leave records
  const leaves = await prisma.leave.findMany({
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  // 3. Format results
  const formattedLeaves = leaves.map((leave) => ({
    ...leave,
    startTime: leave.startTime ? formatTime(leave.startTime) : null,
    endTime: leave.endTime ? formatTime(leave.endTime) : null,
    date: format(leave.date, "yyyy-MM-dd"),
  }));

  // 4. Return response with pagination meta
  return successResponse(
    StatusCodes.OK,
    CONSTANTS.leave.foundSuccess,
    formattedLeaves,
    getPaginationMeta(total, page, limit)
  );
};
