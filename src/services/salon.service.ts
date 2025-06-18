import { PrismaClient } from "@prisma/client";
import { CreateSalonDTO } from "../validations/salon.validation";
import { errorResponse, successResponse } from "@utils/response";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "@utils/messages";
const prisma = new PrismaClient();

export const createSalon = async (body: CreateSalonDTO) => {
  const newSalon = await prisma.salon.create({
    data: {
      ...body,
    },
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

  return successResponse(StatusCodes.OK, MESSAGES.salon.foundSuccess, salon);
};

export const getAllSalon = async (query: any) => {
  const salons = await prisma.salon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return successResponse(StatusCodes.OK, MESSAGES.salon.foundSuccess, salons);
};
