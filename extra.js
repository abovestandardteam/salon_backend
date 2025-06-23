// export const GetSlot = async (query: any) => {
//   const inputDate = query.date ? new Date(query.date) : new Date();
//   const today = isNaN(inputDate.getTime()) ? new Date() : inputDate;

//   // 📅 Get today's date, day name, and time range
//   const currentDate = format(today, "yyyy-MM-dd");
//   const currentDay = format(today, "EEEE");

//   // 🏠 Fetch salon info
//   const salon = await prisma.salon.findFirst();
//   if (!salon) {
//     return errorResponse(StatusCodes.NOT_FOUND, CONSTANTS.salon.notFound);
//   }

//   const { openTime, closeTime } = salon;
//   if (!openTime || !closeTime) {
//     throw new Error("Open or Close time is missing");
//   }

//   // 💇‍♀️ Get all services and determine shortest duration
//   const services = await prisma.service.findMany();
//   if (services.length === 0) {
//     return errorResponse(StatusCodes.NOT_FOUND, CONSTANTS.service.notFound);
//   }

//   const minDuration = Math.min(...services.map((s) => s.duration));

//   // ⏳ Define today's range in UTC (adjusted from IST)
//   const start = startOfDay(today);
//   const end = endOfDay(today);

//   // 📆 Check if there's a leave today
//   const leaveToday = await prisma.leave.findFirst({
//     where: {
//       date: {
//         gte: start,
//         lte: end,
//       },
//     },
//   });

//   // 🚫 If it's a full-day leave, return no slots
//   if (leaveToday?.type === LeaveType.DAY) {
//     return successResponse(StatusCodes.OK, CONSTANTS.salon.close, {
//       date: currentDate,
//       day: currentDay,
//       slots: [],
//     });
//   }

//   // 📋 Get today's pending appointments
//   const appointments = await prisma.appointment.findMany({
//     where: {
//       status: AppointmentStatus.PENDING,
//       date: {
//         gte: start,
//         lte: end,
//       },
//     },
//     select: {
//       startTime: true,
//       endTime: true,
//     },
//   });

//   // 🕰️ Generate time slots between openTime and closeTime
//   const allSlots = generateTimeSlots(openTime, closeTime, minDuration);

//   // ❌ Remove slots that overlap with existing appointments
//   let availableSlots = allSlots.filter((slot) => {
//     return !appointments.some((appt) => {
//       if (!appt.startTime || !appt.endTime) return false;
//       return (
//         (isBefore(slot.start, appt.endTime) &&
//           isAfter(slot.end, appt.startTime)) ||
//         isEqual(slot.start, appt.startTime)
//       );
//     });
//   });

//   // ⛔ Remove slots affected by hour-based leave
//   if (
//     leaveToday?.type === LeaveType.HOURS &&
//     leaveToday.startTime &&
//     leaveToday.endTime
//   ) {
//     const leaveStart = new Date(leaveToday.startTime);
//     const leaveEnd = new Date(leaveToday.endTime);

//     availableSlots = availableSlots.filter((slot) => {
//       return !(slot.start < leaveEnd && slot.end > leaveStart);
//     });
//   }

//   // ✅ Format remaining slots to { start: "hh:mm am/pm", end: "hh:mm am/pm" }
//   const formattedSlots = availableSlots.map(formatSlot);

//   // 🎉 Return response
//   return successResponse(
//     StatusCodes.OK,
//     "Available slots fetched successfully",
//     {
//       totalSlots: formattedSlots.length,
//       date: currentDate,
//       day: currentDay,
//       slots: formattedSlots,
//     }
//   );
// };

// export const createAppointment = async (body: CreateAppointmentDTO) => {
//   const { serviceIds, date: dateObject, startTime, endTime, ...rest } = body;

//   // ✅ Validate that all provided service IDs exist
//   const foundServices = await prisma.service.findMany({
//     where: { id: { in: serviceIds } },
//     select: { id: true },
//   });

//   const foundServiceIds = new Set(foundServices.map((s) => s.id));
//   const invalidIds = serviceIds.filter((id) => !foundServiceIds.has(id));

//   if (invalidIds.length > 0) {
//     return errorResponse(
//       StatusCodes.BAD_REQUEST,
//       `Service not found: ${invalidIds.join(", ")}`
//     );
//   }

//   // ✅ Check if customer exists
//   const existingCustomer = await prisma.customer.findUnique({
//     where: { id: body.customerId },
//   });

//   if (!existingCustomer) {
//     return errorResponse(
//       StatusCodes.NOT_FOUND,
//       `Customer with ID ${body.customerId} not found`
//     );
//   }

//   // Convert date to YYYY-MM-DD string
//   const dateString = dateObject.toISOString().split("T")[0];

//   // Combine date + time and convert from user's timezone to UTC
//   const parsedStartTime = startTime
//     ? fromZonedTime(
//         parse(`${dateString} ${startTime}`, "yyyy-MM-dd hh:mm a", new Date()),
//         TimeZone.IST
//       )
//     : undefined;

//   const parsedEndTime = endTime
//     ? fromZonedTime(
//         parse(`${dateString} ${endTime}`, "yyyy-MM-dd hh:mm a", new Date()),
//         TimeZone.IST
//       )
//     : undefined;

//   // 🚫 Reject if start time is in the past
//   // const now = new Date(); // Current UTC time
//   // if (parsedStartTime && parsedStartTime < now) {
//   //   return errorResponse(
//   //     StatusCodes.BAD_REQUEST,
//   //     `You cannot book an appointment in the past`
//   //   );
//   // }

//   // ✅ Check for overlapping appointments
//   const overlappingAppointment = await prisma.appointment.findFirst({
//     where: {
//       status: AppointmentStatus.PENDING,
//       date: dateObject,
//       startTime: { lt: parsedEndTime },
//       endTime: { gt: parsedStartTime },
//     },
//   });

//   if (overlappingAppointment) {
//     return errorResponse(
//       StatusCodes.CONFLICT,
//       `Time slot already booked from ${startTime} to ${endTime}`
//     );
//   }

//   const newAppointment = await prisma.appointment.create({
//     data: {
//       ...rest,
//       date: dateObject,
//       startTime: parsedStartTime,
//       endTime: parsedEndTime,
//       services: {
//         connect: serviceIds.map((id) => ({ id })),
//       },
//     },
//     include: {
//       services: true,
//     },
//   });

//   return successResponse(
//     StatusCodes.OK,
//     CONSTANTS.appointment.createSuccess,
//     newAppointment
//   );
// };

// export const updateAppointment = async (
//   id: number,
//   data: Partial<CreateAppointmentDTO>
// ) => {
//   const existing = await prisma.appointment.findUnique({
//     where: { id: id },
//   });
//   if (!existing) {
//     return errorResponse(StatusCodes.NOT_FOUND, CONSTANTS.appointment.notFound);
//   }

//   const { serviceIds, date: dateObject, startTime, endTime, ...rest } = data;

//   // 🧪 Validate serviceIds if provided
//   if (serviceIds && serviceIds.length > 0) {
//     const foundServices = await prisma.service.findMany({
//       where: { id: { in: serviceIds } },
//       select: { id: true },
//     });

//     const foundServiceIds = new Set(foundServices.map((s) => s.id));
//     const invalidIds = serviceIds.filter((id) => !foundServiceIds.has(id));

//     if (invalidIds.length > 0) {
//       return errorResponse(
//         StatusCodes.BAD_REQUEST,
//         `Service not found: ${invalidIds.join(", ")}`
//       );
//     }
//   }

//   // ✅ Check if customer exists
//   const existingCustomer = await prisma.customer.findUnique({
//     where: { id: data.customerId },
//   });

//   if (!existingCustomer) {
//     return errorResponse(
//       StatusCodes.NOT_FOUND,
//       `Customer with ID ${data.customerId} not found`
//     );
//   }

//   // 🕒 Parse date/time if provided
//   const dateString = dateObject
//     ? dateObject.toISOString().split("T")[0]
//     : undefined;

//   let parsedStartTime = undefined;
//   let parsedEndTime = undefined;

//   if (dateString && startTime) {
//     parsedStartTime = fromZonedTime(
//       parse(`${dateString} ${startTime}`, "yyyy-MM-dd hh:mm a", new Date()),
//       TimeZone.IST
//     );
//   }

//   if (dateString && endTime) {
//     parsedEndTime = fromZonedTime(
//       parse(`${dateString} ${endTime}`, "yyyy-MM-dd hh:mm a", new Date()),
//       TimeZone.IST
//     );
//   }

//   // 🚫 Reject if start time is in the past
//   const now = new Date(); // Current UTC time
//   if (parsedStartTime && parsedStartTime < now) {
//     return errorResponse(
//       StatusCodes.BAD_REQUEST,
//       `You cannot book an appointment in the past`
//     );
//   }

//   // ❌ Check for overlapping appointments if time is being updated
//   if (parsedStartTime && parsedEndTime && dateObject) {
//     const overlap = await prisma.appointment.findFirst({
//       where: {
//         id: { not: id },
//         status: AppointmentStatus.PENDING,
//         date: dateObject,
//         startTime: { lt: parsedEndTime },
//         endTime: { gt: parsedStartTime },
//       },
//     });

//     if (overlap) {
//       return errorResponse(
//         StatusCodes.CONFLICT,
//         `Time slot already booked from ${startTime} to ${endTime}`
//       );
//     }
//   }

//   // 🛠️ Construct update object
//   const updateData: any = {
//     ...rest,
//     ...(dateObject && { date: dateObject }),
//     ...(parsedStartTime && { startTime: parsedStartTime }),
//     ...(parsedEndTime && { endTime: parsedEndTime }),
//     ...(serviceIds && {
//       services: {
//         set: serviceIds.map((id) => ({ id })),
//       },
//     }),
//   };

//   const appointment = await prisma.appointment.update({
//     where: { id },
//     data: updateData,
//     include: { services: true },
//   });
//   return successResponse(
//     StatusCodes.OK,
//     CONSTANTS.appointment.updateSuccess,
//     appointment
//   );
// };
