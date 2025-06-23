import { PrismaClient, SalonUser } from "@prisma/client";
import { TimeZone } from "@utils/enum";
import { parse, format } from "date-fns";
import { CONSTANTS } from "@utils/constants";
import { fromZonedTime } from "date-fns-tz";
import { StatusCodes } from "http-status-codes";
import { CreateSalonDTO } from "../validations/salon.validation";
import { errorResponse, successResponse } from "@utils/response";
import { formatTime } from "@utils/helper";
const prisma = new PrismaClient();

export const createSalon = async (body: CreateSalonDTO, user: SalonUser) => {
  const { openTime: openTimeStr, closeTime: closeTimeStr, ...rest } = body;

  // Parse time strings into Date objects (use today's date as base)
  const today = new Date();
  const todayString = today.toISOString().split("T")[0]; // e.g., "2025-06-19"

  const openTime = fromZonedTime(
    parse(`${todayString} ${openTimeStr}`, "yyyy-MM-dd hh:mm a", new Date()),
    TimeZone.IST
  );

  const closeTime = fromZonedTime(
    parse(`${todayString} ${closeTimeStr}`, "yyyy-MM-dd hh:mm a", new Date()),
    TimeZone.IST
  );

  // Create salon
  const newSalon = await prisma.salon.create({
    data: {
      ...rest,
      openTime,
      closeTime,
    },
  });

  // Update SalonUser to attach the salonId to the owner
  await prisma.salonUser.update({
    where: { id: user.id },
    data: { salonId: newSalon.id },
  });

  return successResponse(
    StatusCodes.OK,
    CONSTANTS.salon.createSuccess,
    newSalon
  );
};

export const updateSalon = async (
  id: string,
  data: Partial<CreateSalonDTO>
) => {
  let salon = await prisma.salon.findUnique({ where: { id } });
  if (!salon) {
    return errorResponse(StatusCodes.NOT_FOUND, CONSTANTS.salon.notFound);
  }

  const { openTime: openTimeStr, closeTime: closeTimeStr, ...rest } = data;

  const today = new Date();
  const todayString = today.toISOString().split("T")[0]; // "yyyy-MM-dd"

  // Handle openTime
  let openTime;
  if (openTimeStr) {
    openTime = fromZonedTime(
      parse(`${todayString} ${openTimeStr}`, "yyyy-MM-dd hh:mm a", new Date()),
      TimeZone.IST
    );
  }

  // Handle closeTime
  let closeTime;
  if (closeTimeStr) {
    closeTime = fromZonedTime(
      parse(`${todayString} ${closeTimeStr}`, "yyyy-MM-dd hh:mm a", new Date()),
      TimeZone.IST
    );
  }

  // Perform update
  salon = await prisma.salon.update({
    where: { id },
    data: {
      ...rest,
      ...(openTime && { openTime }),
      ...(closeTime && { closeTime }),
    },
  });

  return successResponse(StatusCodes.OK, CONSTANTS.salon.updateSuccess, salon);
};

export const deleteSalon = async (id: string) => {
  const salon = await prisma.salon.findUnique({ where: { id } });
  if (!salon) {
    return errorResponse(StatusCodes.NOT_FOUND, CONSTANTS.salon.notFound);
  }

  const deletedSalon = await prisma.salon.delete({
    where: { id },
  });

  return successResponse(
    StatusCodes.OK,
    CONSTANTS.salon.deleteSuccess,
    deletedSalon
  );
};

export const getSalonById = async (id: string) => {
  const salon = await prisma.salon.findUnique({
    where: { id },
  });
  if (!salon) {
    return errorResponse(StatusCodes.NOT_FOUND, CONSTANTS.salon.notFound);
  }

  const formattedSalon = {
    ...salon,
    openTime: formatTime(salon.openTime),
    closeTime: formatTime(salon.closeTime),
  };

  return successResponse(
    StatusCodes.OK,
    CONSTANTS.salon.foundSuccess,
    formattedSalon
  );
};

export const getAllSalon = async (query: any) => {
  const salons = await prisma.salon.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      users: true,
    },
  });

  // Format openTime and closeTime for display
  const formattedSalons = salons.map((salon) => ({
    ...salon,
    openTime: formatTime(salon.openTime),
    closeTime: formatTime(salon.closeTime),
  }));

  return successResponse(
    StatusCodes.OK,
    CONSTANTS.salon.foundSuccess,
    formattedSalons
  );
};
