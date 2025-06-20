import { PrismaClient } from "@prisma/client";
import {
  CreateSalonUserDTO,
  LoginSalonUserDTO,
} from "../validations/salon-user.validation";
import { errorResponse, successResponse } from "@utils/response";
import { StatusCodes } from "http-status-codes";
import { CONSTANTS } from "@utils/constants";
import { comparePassword, hashPassword } from "@utils/password";
import { generateToken } from "@utils/jwt";
const prisma = new PrismaClient();

export const createSalonUser = async (body: CreateSalonUserDTO) => {
  body.password = await hashPassword(body.password);
  const newSalonUser = await prisma.salonUser.create({
    data: {
      ...body,
    },
  });

  return successResponse(
    StatusCodes.OK,
    CONSTANTS.salonUser.createSuccess,
    newSalonUser
  );
};

export const updateSalonUser = async (
  id: string,
  data: Partial<CreateSalonUserDTO>
) => {
  let salonUser = await prisma.salonUser.findUnique({ where: { id } });
  if (!salonUser) {
    return errorResponse(StatusCodes.NOT_FOUND, CONSTANTS.salonUser.notFound);
  }

  // If password is being updated, hash it
  if (data.password) {
    data.password = await hashPassword(data.password);
  }

  salonUser = await prisma.salonUser.update({
    where: { id },
    data,
  });

  return successResponse(
    StatusCodes.OK,
    CONSTANTS.salonUser.updateSuccess,
    salonUser
  );
};

export const loginSalonUser = async (body: LoginSalonUserDTO) => {
  const salonUser = await prisma.salonUser.findUnique({
    where: { email: body.email },
  });

  if (!salonUser) {
    return errorResponse(StatusCodes.NOT_FOUND, CONSTANTS.salonUser.notFound);
  }

  const isPasswordValid = await comparePassword(
    body.password,
    salonUser.password
  );
  if (!isPasswordValid) {
    return errorResponse(
      StatusCodes.UNAUTHORIZED,
      CONSTANTS.salonUser.invalidCredntials
    );
  }
  const { password, ...safeUser } = salonUser;
  const token = generateToken({
    id: salonUser.id,
    role: salonUser.role,
    userType: "salonUser",
  });

  return successResponse(StatusCodes.OK, CONSTANTS.salonUser.loginSuccess, {
    ...safeUser,
    token,
  });
};

export const deleteSalonUser = async (id: string) => {
  const salonUser = await prisma.salonUser.findUnique({ where: { id } });
  if (!salonUser) {
    return errorResponse(StatusCodes.NOT_FOUND, CONSTANTS.salonUser.notFound);
  }

  const now = new Date();
  await prisma.salonUser.update({
    where: { id },
    data: { deletedAt: now },
  });

  return successResponse(StatusCodes.OK, CONSTANTS.salonUser.deleteSuccess);
};

export const getSalonUserById = async (id: string) => {
  const salonUser = await prisma.salonUser.findUnique({
    where: { id },
    include: {
      salon: true,
    },
  });
  if (!salonUser) {
    return errorResponse(StatusCodes.NOT_FOUND, CONSTANTS.salonUser.notFound);
  }

  return successResponse(
    StatusCodes.OK,
    CONSTANTS.salonUser.foundSuccess,
    salonUser
  );
};

export const getAllSalonUser = async (query: any) => {
  const leaves = await prisma.salonUser.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      salon: true,
    },
  });

  return successResponse(
    StatusCodes.OK,
    CONSTANTS.salonUser.foundSuccess,
    leaves
  );
};
