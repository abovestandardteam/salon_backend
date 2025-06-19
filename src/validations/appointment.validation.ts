import { AppointmentStatus } from "@utils/enum";
import { z } from "zod";

// Create Appointment Schema
export const createAppointmentSchema = z.object({
  date: z.coerce.date({ invalid_type_error: "Invalid date format" }),
  startTime: z.string().regex(/^([0-9]{1,2}):([0-9]{2}) (AM|PM)$/, {
    message: "startTime must be in format HH:MM AM/PM",
  }),
  endTime: z.string().regex(/^([0-9]{1,2}):([0-9]{2}) (AM|PM)$/, {
    message: "endTime must be in format HH:MM AM/PM",
  }),
  customerId: z.number({ invalid_type_error: "Customer ID must be a number" }),
  userId: z.string().uuid({ message: "User ID must be a valid UUID" }), // SalonUser
  serviceIds: z
    .array(z.number().int().positive())
    .min(1, "At least one service is required")
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "Service IDs must be unique",
    }),
  notes: z.string().optional(),
});

export type CreateAppointmentDTO = z.infer<typeof createAppointmentSchema>;

// Update Appointment Schema
export const updateAppointmentSchema = z.object({
  date: z.coerce.date({ invalid_type_error: "Invalid date format" }).optional(),
  customerId: z
    .number({ invalid_type_error: "Customer ID must be a number" })
    .optional(),
  salonId: z
    .string()
    .uuid({ message: "Salon ID must be a valid UUID" })
    .optional(),
  serviceIds: z
    .array(z.number({ invalid_type_error: "Service ID must be a number" }))
    .optional(),
});

export type UpdateAppointmentDTO = z.infer<typeof updateAppointmentSchema>;

// Update Appointment Status Schema
export const updateAppointmentStatusSchema = z.object({
  status: z.enum(Object.values(AppointmentStatus) as [string, ...string[]]),
});

export type UpdateAppointmentStatusDTO = z.infer<
  typeof updateAppointmentStatusSchema
>;
