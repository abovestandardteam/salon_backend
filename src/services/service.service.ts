import { PrismaClient, SalonUser } from "@prisma/client";
import { CreateServiceDTO } from "../validations/service.validation";
import { errorResponse, successResponse } from "@utils/response";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "@utils/messages";
const prisma = new PrismaClient();

export const createService = async (
  body: CreateServiceDTO,
  user: SalonUser
) => {
  const newService = await prisma.service.create({
    data: {
      ...body,
      userId: user.id,
    },
  });

  return successResponse(
    StatusCodes.OK,
    MESSAGES.service.createSuccess,
    newService
  );
};

export const updateService = async (
  id: number,
  data: Partial<CreateServiceDTO>
) => {
  const service = await prisma.service.update({
    where: { id },
    data,
  });
  return successResponse(
    StatusCodes.OK,
    MESSAGES.service.updateSuccess,
    service
  );
};

export const deleteService = async (id: number) => {
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) {
    return errorResponse(StatusCodes.NOT_FOUND, MESSAGES.service.notFound);
  }

  const now = new Date();
  // await prisma.service.update({
  //   where: { id },
  //   data: { deletedAt: now },
  // });

  return successResponse(StatusCodes.OK, MESSAGES.service.deleteSuccess);
};

export const getServiceById = async (id: number) => {
  const service = await prisma.service.findUnique({
    where: { id },
    include: {
      appointments: true,
    },
  });
  if (!service) {
    return errorResponse(StatusCodes.NOT_FOUND, MESSAGES.service.notFound);
  }

  return successResponse(
    StatusCodes.OK,
    MESSAGES.service.foundSuccess,
    service
  );
};

export const getAllService = async () => {
  const services = await prisma.service.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return successResponse(
    StatusCodes.OK,
    MESSAGES.service.foundSuccess,
    services
  );
};
