import { PrismaClient, SalonUser } from "@prisma/client";
import { TimeZone } from "@utils/enum";
import { parse, format } from "date-fns";
import { MESSAGES } from "@utils/messages";
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
    MESSAGES.salon.createSuccess,
    newSalon
  );
};

export const updateSalon = async (
  id: string,
  data: Partial<CreateSalonDTO>
) => {
  let salon = await prisma.salon.findUnique({ where: { id } });
  if (!salon) {
    return errorResponse(StatusCodes.NOT_FOUND, MESSAGES.salon.notFound);
  }

  salon = await prisma.salon.update({
    where: { id },
    data,
  });

  return successResponse(StatusCodes.OK, MESSAGES.salon.updateSuccess, salon);
};

export const deleteSalon = async (id: string) => {
  const salon = await prisma.salon.findUnique({ where: { id } });
  if (!salon) {
    return errorResponse(StatusCodes.NOT_FOUND, MESSAGES.salon.notFound);
  }

  const deletedSalon = await prisma.salon.delete({
    where: { id },
  });

  return successResponse(
    StatusCodes.OK,
    MESSAGES.salon.deleteSuccess,
    deletedSalon
  );
};

export const getSalonById = async (id: string) => {
  const salon = await prisma.salon.findUnique({
    where: { id },
  });
  if (!salon) {
    return errorResponse(StatusCodes.NOT_FOUND, MESSAGES.salon.notFound);
  }

  const formattedSalon = {
    ...salon,
    openTime: formatTime(salon.openTime),
    closeTime: formatTime(salon.closeTime),
  };

  return successResponse(
    StatusCodes.OK,
    MESSAGES.salon.foundSuccess,
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
    MESSAGES.salon.foundSuccess,
    formattedSalons
  );
};
