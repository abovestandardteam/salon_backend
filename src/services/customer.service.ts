import { Prisma, PrismaClient } from "@prisma/client";
import { CreateCustomerDTO } from "../validations/customer.validation";
import { errorResponse, successResponse } from "@utils/response";
import { StatusCodes } from "http-status-codes";
import { CONSTANTS } from "@utils/constants";
import { generateToken } from "@utils/jwt";
import { AppointmentStatus } from "@utils/enum";
import { formatDateWithSuffix, formatTime } from "@utils/helper";
import { getPaginationMeta, getPaginationParams } from "@utils/pagination";
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
    return successResponse(StatusCodes.OK, CONSTANTS.customer.createSuccess, {
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

  return successResponse(StatusCodes.OK, CONSTANTS.customer.createSuccess, {
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
        CONSTANTS.customer.mobileAlreadyExists
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
    CONSTANTS.customer.updateSuccess,
    customer
  );
};

export const deleteCustomer = async (id: number) => {
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) {
    return errorResponse(StatusCodes.NOT_FOUND, CONSTANTS.customer.notFound);
  }

  const now = new Date();
  await prisma.customer.update({
    where: { id },
    data: { deletedAt: now },
  });

  return successResponse(StatusCodes.OK, CONSTANTS.customer.deleteSuccess);
};

export const getCustomerById = async (id: number) => {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      appointments: {
        select: {
          id: true,
          date: true,
          startTime: true,
          endTime: true,
          status: true,
          services: {
            select: { name: true, duration: true, price: true },
          },
        },
      },
    },
  });
  if (!customer) {
    return errorResponse(StatusCodes.NOT_FOUND, CONSTANTS.customer.notFound);
  }

  const formattedAppointments = customer.appointments.map((appointment) => ({
    ...appointment,
    date: formatDateWithSuffix(appointment.date),
    startTime: formatTime(appointment.startTime),
    endTime: formatTime(appointment.endTime),
  }));

  const formattedCustomer = {
    ...customer,
    appointments: formattedAppointments,
  };

  return successResponse(
    StatusCodes.OK,
    CONSTANTS.customer.foundSuccess,
    formattedCustomer
  );
};

export const getAllCustomer = async (query: any) => {
  const { page, limit, skip } = getPaginationParams(query);

  // 🔍 Search filter
  const whereFilter: Prisma.CustomerWhereInput = query.search
    ? {
        OR: [
          { firstName: { contains: query.search, mode: "insensitive" } },
          { lastName: { contains: query.search, mode: "insensitive" } },
          { mobileNumber: { contains: query.search, mode: "insensitive" } },
        ],
      }
    : {};

  // 🔢 Get total for pagination
  const total = await prisma.customer.count({ where: whereFilter });

  // 📦 Fetch paginated customers
  const users = await prisma.customer.findMany({
    where: whereFilter,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      appointments: {
        where: { status: AppointmentStatus.COMPLETED },
        orderBy: { updatedAt: "desc" },
        select: { updatedAt: true },
      },
    },
  });

  // 🎯 Add computed fields
  const usersWithExtras = users.map(({ appointments, ...customer }) => ({
    ...customer,
    totalAppointments: appointments.length,
    lastVisit: appointments[0]?.updatedAt
      ? formatDateWithSuffix(appointments[0].updatedAt)
      : null,
  }));

  return successResponse(
    StatusCodes.OK,
    CONSTANTS.customer.foundSuccess,
    usersWithExtras,
    getPaginationMeta(total, page, limit)
  );
};
