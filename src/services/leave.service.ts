import { Prisma, PrismaClient } from "@prisma/client";
import { CreateLeaveDTO } from "../validations/leave.validation";
import { errorResponse, successResponse } from "@utils/response";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "@utils/messages";
import { generateToken } from "@utils/jwt";
const prisma = new PrismaClient();

export const createLeave = async (body: CreateLeaveDTO) => {
  const newLeave = await prisma.leave.create({
    data: {
      ...body,
    },
  });

  return successResponse(
    StatusCodes.OK,
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

  return successResponse(StatusCodes.OK, MESSAGES.leave.foundSuccess, leaves);
};
