import { PrismaClient } from "@prisma/client";
import { MESSAGES } from "@utils/messages";
import { parse, parseISO } from "date-fns";
import { StatusCodes } from "http-status-codes";
import { CreateLeaveDTO } from "@validations/leave.validation";
import { errorResponse, successResponse } from "@utils/response";
const prisma = new PrismaClient();
import { format } from "date-fns";
import { fromZonedTime } from "date-fns-tz"; // ✅ correct

export const createLeave = async (body: CreateLeaveDTO, user: any) => {
  const { date: dateString, startTime, endTime, ...rest } = body;

  // Fallback to UTC if user's timezone is not defined
  const userTimeZone = user.timeZone || "UTC";

  // Parse only the date portion
  const parsedDate = parse(dateString, "yyyy-MM-dd", new Date());

  // Combine date + time and convert from user's timezone to UTC
  const parsedStartTime = startTime
    ? fromZonedTime(
        parse(`${dateString} ${startTime}`, "yyyy-MM-dd hh:mm a", new Date()),
        userTimeZone
      )
    : null;

  const parsedEndTime = endTime
    ? fromZonedTime(
        parse(`${dateString} ${endTime}`, "yyyy-MM-dd hh:mm a", new Date()),
        userTimeZone
      )
    : null;

  const newLeave = await prisma.leave.create({
    data: {
      ...rest,
      userId: user.id,
      date: parsedDate, // This stores the date (no time component)
      startTime: parsedStartTime,
      endTime: parsedEndTime,
    },
  });

  return successResponse(
    StatusCodes.CREATED,
    MESSAGES.leave.createSuccess,
    newLeave
  );
};

export const updateLeave = async (
  id: number,
  data: Partial<CreateLeaveDTO>
) => {
  let leave = await prisma.leave.findUnique({ where: { id } });
  if (!leave) {
    return errorResponse(StatusCodes.NOT_FOUND, MESSAGES.leave.notFound);
  }

  leave = await prisma.leave.update({
    where: { id },
    data,
  });

  return successResponse(StatusCodes.OK, MESSAGES.leave.updateSuccess, leave);
};

export const deleteLeave = async (id: number) => {
  const leave = await prisma.leave.findUnique({ where: { id } });
  if (!leave) {
    return errorResponse(StatusCodes.NOT_FOUND, MESSAGES.leave.notFound);
  }

  const deletedLeave = await prisma.leave.delete({
    where: { id },
  });

  return successResponse(
    StatusCodes.OK,
    MESSAGES.leave.deleteSuccess,
    deletedLeave
  );
};

export const getLeaveById = async (id: number) => {
  const leave = await prisma.leave.findUnique({
    where: { id },
  });
  if (!leave) {
    return errorResponse(StatusCodes.NOT_FOUND, MESSAGES.leave.notFound);
  }

  return successResponse(StatusCodes.OK, MESSAGES.leave.foundSuccess, leave);
};

export const getAllLeave = async (query: any) => {
  const leaves = await prisma.leave.findMany({
    orderBy: { createdAt: "desc" },
  });

  const formattedLeaves = leaves.map((leave) => ({
    ...leave,
    startTime: leave.startTime
      ? format(leave.startTime, "hh:mm a").toLowerCase()
      : null,
    endTime: leave.endTime
      ? format(leave.endTime, "hh:mm a").toLowerCase()
      : null,
    date: format(leave.date, "yyyy-MM-dd"),
  }));

  return successResponse(
    StatusCodes.OK,
    MESSAGES.leave.foundSuccess,
    formattedLeaves
  );
};
