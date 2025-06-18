import { Prisma, PrismaClient } from "@prisma/client";
import { CreateUserDTO } from "../validations/customer.validation";
import { errorResponse, successResponse } from "@utils/response";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "@utils/messages";
import { generateToken } from "@utils/jwt";
const prisma = new PrismaClient();

export const createUser = async (body: CreateUserDTO) => {
  // Step 1: Check if the user already exists
  const existingUser = await prisma.user.findUnique({
    where: { mobileNumber: body.mobileNumber },
  });

  if (existingUser) {
    // Step 2: If user exists, generate a token for that user
    const tokenPayload = {
      id: existingUser.id,
      role: existingUser.role,
      mobileNumber: existingUser.mobileNumber,
    };

    const token = await generateToken(tokenPayload);

    // Step 3: Return existing user with token
    return successResponse(StatusCodes.OK, MESSAGES.user.foundSuccess, {
      ...existingUser,
      token,
    });
  }

  // Step 4: If not found, create a new user
  const newUser = await prisma.user.create({
    data: {
      ...body,
    },
  });

  const tokenPayload = {
    id: newUser.id,
    role: newUser.role,
    mobileNumber: newUser.mobileNumber,
  };

  const token = await generateToken(tokenPayload);

  return successResponse(StatusCodes.OK, MESSAGES.user.createSuccess, {
    ...newUser,
    token,
  });
};

export const updateUser = async (id: number, data: Partial<CreateUserDTO>) => {
  // Step 1: Check if mobileNumber is being updated
  if (data.mobileNumber) {
    const existingUser = await prisma.user.findFirst({
      where: {
        mobileNumber: data.mobileNumber,
        NOT: { id }, // exclude the current user
      },
    });

    if (existingUser) {
      return errorResponse(
        StatusCodes.CONFLICT,
        MESSAGES.user.mobileAlreadyExists
      );
    }
  }

  // Step 2: Proceed with update
  const user = await prisma.user.update({
    where: { id },
    data,
  });

  return successResponse(StatusCodes.OK, MESSAGES.user.updateSuccess, user);
};

export const deleteUser = async (id: number) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return errorResponse(StatusCodes.NOT_FOUND, MESSAGES.user.notFound);
  }

  const deletedUser = await prisma.user.delete({
    where: { id },
  });

  return successResponse(
    StatusCodes.OK,
    MESSAGES.user.deleteSuccess,
    deletedUser
  );
};

export const getUserById = async (id: number) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      appointments: {
        include: {
          services: true,
        },
      },
    },
  });
  if (!user) {
    return errorResponse(StatusCodes.NOT_FOUND, MESSAGES.user.notFound);
  }

  return successResponse(StatusCodes.OK, MESSAGES.user.foundSuccess, user);
};

export const getAllUser = async (query: any) => {
  // Build a simple where-clause: either the search OR empty (fetch all)
  const whereFilter: Prisma.UserWhereInput = query.search
    ? {
        OR: [
          { firstName: { contains: query.search, mode: "insensitive" } },
          { lastName: { contains: query.search, mode: "insensitive" } },
          { mobileNumber: { contains: query.search, mode: "insensitive" } },
        ],
      }
    : {};

  const users: any[] = await prisma.user.findMany({
    where: whereFilter,
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { appointments: true } },
      appointments: {
        where: { status: "COMPLETED" },
        orderBy: { updatedAt: "desc" },
        take: 1,
        select: { updatedAt: true },
      },
    },
  });

  const usersWithExtras = users.map(({ _count, appointments, ...user }) => ({
    ...user,
    totalAppointments: _count.appointments,
    lastCompletedAt: appointments[0]?.updatedAt ?? null,
  }));

  return successResponse(
    StatusCodes.OK,
    MESSAGES.user.foundSuccess,
    usersWithExtras
  );
};
