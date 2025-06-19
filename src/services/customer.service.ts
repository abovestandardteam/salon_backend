import { Prisma, PrismaClient } from "@prisma/client";
import { CreateCustomerDTO } from "../validations/customer.validation";
import { errorResponse, successResponse } from "@utils/response";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "@utils/messages";
import { generateToken } from "@utils/jwt";
const prisma = new PrismaClient();

export const createCustomer = async (body: CreateCustomerDTO) => {
  // Step 1: Check if the customer already exists
  const existingCustomer = await prisma.customer.findUnique({
    where: { mobileNumber: body.mobileNumber },
  });

  if (existingCustomer) {
    // Step 2: If customer exists, generate a token for that customer
    const tokenPayload = {
      id: existingCustomer.id,
      mobileNumber: existingCustomer.mobileNumber,
      userType: "customer",
    };

    const token = await generateToken(tokenPayload);

    // Step 3: Return existing customer with token
    return successResponse(StatusCodes.OK, MESSAGES.customer.foundSuccess, {
      ...existingCustomer,
      token,
    });
  }

  // Step 4: If not found, create a new customer
  const newCustomer = await prisma.customer.create({
    data: {
      ...body,
    },
  });

  const tokenPayload = {
    id: newCustomer.id,
    mobileNumber: newCustomer.mobileNumber,
    userType: "customer",
  };

  const token = await generateToken(tokenPayload);

  return successResponse(StatusCodes.OK, MESSAGES.customer.createSuccess, {
    ...newCustomer,
    token,
  });
};

export const updateCustomer = async (
  id: number,
  data: Partial<CreateCustomerDTO>
) => {
  // Step 1: Check if mobileNumber is being updated
  if (data.mobileNumber) {
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        mobileNumber: data.mobileNumber,
        NOT: { id }, // exclude the current customer
      },
    });

    if (existingCustomer) {
      return errorResponse(
        StatusCodes.CONFLICT,
        MESSAGES.customer.mobileAlreadyExists
      );
    }
  }

  // Step 2: Proceed with update
  const customer = await prisma.customer.update({
    where: { id },
    data,
  });

  return successResponse(
    StatusCodes.OK,
    MESSAGES.customer.updateSuccess,
    customer
  );
};

export const deleteCustomer = async (id: number) => {
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) {
    return errorResponse(StatusCodes.NOT_FOUND, MESSAGES.customer.notFound);
  }

  const now = new Date();
  // await prisma.customer.update({
  //   where: { id },
  //   data: { deletedAt: now },
  // });

  return successResponse(StatusCodes.OK, MESSAGES.customer.deleteSuccess);
};

export const getCustomerById = async (id: number) => {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      appointments: {
        include: {
          services: true,
        },
      },
    },
  });
  if (!customer) {
    return errorResponse(StatusCodes.NOT_FOUND, MESSAGES.customer.notFound);
  }

  return successResponse(
    StatusCodes.OK,
    MESSAGES.customer.foundSuccess,
    customer
  );
};

export const getAllCustomer = async (query: any) => {
  // Build a simple where-clause: either the search OR empty (fetch all)
  const whereFilter: Prisma.CustomerWhereInput = query.search
    ? {
        OR: [
          { firstName: { contains: query.search, mode: "insensitive" } },
          { lastName: { contains: query.search, mode: "insensitive" } },
          { mobileNumber: { contains: query.search, mode: "insensitive" } },
        ],
      }
    : {};

  const users: any[] = await prisma.customer.findMany({
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

  const usersWithExtras = users.map(
    ({ _count, appointments, ...customer }) => ({
      ...customer,
      totalAppointments: _count.appointments,
      lastCompletedAt: appointments[0]?.updatedAt ?? null,
    })
  );

  return successResponse(
    StatusCodes.OK,
    MESSAGES.customer.foundSuccess,
    usersWithExtras
  );
};
