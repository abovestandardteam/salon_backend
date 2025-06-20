import { PrismaClient, SalonUser } from "@prisma/client";
import { CreateServiceDTO } from "../validations/service.validation";
import { errorResponse, successResponse } from "@utils/response";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "@utils/messages";
import { AppointmentStatus } from "@utils/enum";
const prisma = new PrismaClient();

export const createService = async (
  body: CreateServiceDTO,
  user: SalonUser
) => {
  // Check if a service with the same name already exists for the user
  const existingService = await prisma.service.findFirst({
    where: {
      name: body.name,
      userId: user.id,
    },
  });

  if (existingService) {
    return errorResponse(
      StatusCodes.BAD_REQUEST,
      `Service name : ${body.name} already exists.`
    );
  }

  const newService = await prisma.service.create({
    data: {
      ...body,
      userId: user.id,
      createdBy: user.id,
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
  data: Partial<CreateServiceDTO>,
  user: SalonUser
) => {
  // If the name is being updated, check for conflicts
  if (data.name) {
    const existingService = await prisma.service.findFirst({
      where: {
        name: data.name,
        userId: user.id,
        NOT: {
          id: id,
        },
      },
    });

    if (existingService) {
      return errorResponse(
        StatusCodes.BAD_REQUEST,
        `Another service with the name : ${data.name} already exists.`
      );
    }
  }

  const service = await prisma.service.update({
    where: { id },
    data: {
      ...data,
      updatedBy: user.id,
    },
  });

  return successResponse(
    StatusCodes.OK,
    MESSAGES.service.updateSuccess,
    service
  );
};

export const deleteService = async (id: number, user: SalonUser) => {
  // 🔍 Check if the service exists
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) {
    return errorResponse(StatusCodes.NOT_FOUND, MESSAGES.service.notFound);
  }

  // 🧾 Check if the service is linked to any PENDING appointment
  const isInUse = await prisma.appointment.findFirst({
    where: {
      status: AppointmentStatus.PENDING,
      services: {
        some: { id },
      },
    },
  });

  if (isInUse) {
    return errorResponse(StatusCodes.BAD_REQUEST, MESSAGES.service.isInUse);
  }

  // 🗑️ Soft delete
  await prisma.service.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      deletedBy: user.id,
    },
  });

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
    where: {
      deletedAt: null,
    },
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
