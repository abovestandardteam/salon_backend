import { PrismaClient, SalonUser } from "@prisma/client";
import { TimeZone } from "@utils/enum";
import { parse, format } from "date-fns";
import { MESSAGES } from "@utils/messages";
import { fromZonedTime } from "date-fns-tz";
import { StatusCodes } from "http-status-codes";
import { CreateLeaveDTO } from "@validations/leave.validation";
import { errorResponse, successResponse } from "@utils/response";
import { formatTime } from "@utils/helper";
const prisma = new PrismaClient();

export const createLeave = async (body: CreateLeaveDTO, user: SalonUser) => {
  console.log("hello");
  const { date: dateString, startTime, endTime, ...rest } = body;

  // Parse only the date portion
  const parsedDate = parse(dateString, "yyyy-MM-dd", new Date());

  // Combine date + time and convert from user's timezone to UTC
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
  const existingLeave = await prisma.leave.findUnique({ where: { id } });

  if (!existingLeave) {
    return errorResponse(StatusCodes.NOT_FOUND, MESSAGES.leave.notFound);
  }

  const updates: any = { ...data };

  // 🗓️ Ensure parsedDate is available for time parsing
  const dateInput = data.date ?? existingLeave.date;
  const parsedDate =
    typeof dateInput === "string"
      ? parse(dateInput, "yyyy-MM-dd", new Date())
      : dateInput;

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
    MESSAGES.leave.updateSuccess,
    updatedLeave
  );
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

  const formattedLeave = {
    ...leave,
    startTime: formatTime(leave.startTime),
    endTime: formatTime(leave.endTime),
    date: format(leave.date, "yyyy-MM-dd"),
  };

  return successResponse(
    StatusCodes.OK,
    MESSAGES.leave.foundSuccess,
    formattedLeave
  );
};

export const getAllLeave = async (query: any) => {
  const leaves = await prisma.leave.findMany({
    orderBy: { createdAt: "desc" },
  });

  const formattedLeaves = leaves.map((leave) => ({
    ...leave,
    startTime: formatTime(leave.startTime),
    endTime: formatTime(leave.endTime),
    date: format(leave.date, "yyyy-MM-dd"),
  }));

  return successResponse(
    StatusCodes.OK,
    MESSAGES.leave.foundSuccess,
    formattedLeaves
  );
};
