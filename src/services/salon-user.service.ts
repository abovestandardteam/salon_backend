import { PrismaClient } from "@prisma/client";
import { CreateSalonUserDTO } from "../validations/salon-user.validation";
import { errorResponse, successResponse } from "@utils/response";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "@utils/messages";
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
    MESSAGES.salonUser.createSuccess,
    newSalonUser
  );
};

export const updateSalonUser = async (
  id: string,
  data: Partial<CreateSalonUserDTO>
) => {
  let salonUser = await prisma.salonUser.findUnique({ where: { id } });
  if (!salonUser) {
    return errorResponse(StatusCodes.NOT_FOUND, MESSAGES.salonUser.notFound);
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
    MESSAGES.salonUser.updateSuccess,
    salonUser
  );
};

export const loginSalonUser = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const salonUser = await prisma.salonUser.findUnique({
    where: { email },
  });

  if (!salonUser) {
    return errorResponse(StatusCodes.NOT_FOUND, MESSAGES.salonUser.notFound);
  }

  const isPasswordValid = await comparePassword(password, salonUser.password);
  if (!isPasswordValid) {
    return errorResponse(
      StatusCodes.UNAUTHORIZED,
      MESSAGES.salonUser.invalidCredntials
    );
  }

  const token = generateToken({
    id: salonUser.id,
    role: salonUser.role,
    userType: "salonUser",
  });

  return successResponse(StatusCodes.OK, "Login successful", {
    user: {
      id: salonUser.id,
      name: salonUser.name,
      email: salonUser.email,
      phone: salonUser.phone,
      role: salonUser.role,
      salonId: salonUser.salonId,
    },
    token,
  });
};

export const deleteSalonUser = async (id: string) => {
  const salonUser = await prisma.salonUser.findUnique({ where: { id } });
  if (!salonUser) {
    return errorResponse(StatusCodes.NOT_FOUND, MESSAGES.salonUser.notFound);
  }

  const now = new Date();
  // await prisma.salonUser.update({
  //   where: { id },
  //   data: { deletedAt: now },
  // });

  return successResponse(StatusCodes.OK, MESSAGES.salonUser.deleteSuccess);
};

export const getSalonUserById = async (id: string) => {
  const salonUser = await prisma.salonUser.findUnique({
    where: { id },
  });
  if (!salonUser) {
    return errorResponse(StatusCodes.NOT_FOUND, MESSAGES.salonUser.notFound);
  }

  return successResponse(
    StatusCodes.OK,
    MESSAGES.salonUser.foundSuccess,
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
    MESSAGES.salonUser.foundSuccess,
    leaves
  );
};
