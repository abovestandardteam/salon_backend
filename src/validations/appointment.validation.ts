import { AppointmentStatus } from "@utils/enum";
import { z } from "zod";

// Create Appointment Schema
export const createAppointmentSchema = z.object({
  date: z.coerce.date({ invalid_type_error: "Invalid date format" }),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  customerId: z.number({ invalid_type_error: "Customer ID must be a number" }),
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
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  customerId: z
    .number({ invalid_type_error: "Customer ID must be a number" })
    .optional(),
  serviceIds: z
    .array(z.number({ invalid_type_error: "Service ID must be a number" }))
    .optional(),
  notes: z.string().optional(),
});

export type UpdateAppointmentDTO = z.infer<typeof updateAppointmentSchema>;

// Update Appointment Status Schema
export const updateAppointmentStatusSchema = z.object({
  status: z.enum(Object.values(AppointmentStatus) as [string, ...string[]]),
});

export type UpdateAppointmentStatusDTO = z.infer<
  typeof updateAppointmentStatusSchema
>;
