import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { MESSAGES } from "@utils/messages";
import { StatusCodes } from "http-status-codes";
import { errorResponse, successResponse } from "@utils/response";
import { CreateAppointmentDTO } from "@validations/appointment.validation";
import { AppointmentStatus } from "@utils/enum";

export const createAppointment = async (body: CreateAppointmentDTO) => {
  const { serviceIds, ...rest } = body;

  const newAppointment = await prisma.appointment.create({
    data: {
      ...rest,
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
