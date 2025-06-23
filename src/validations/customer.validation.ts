import { z } from "zod";

export const createCustomerSchema = z.object({
  firstName: z.string().min(1, "firstName is required"),
  lastName: z.string().min(1, "lastName is required"),
  mobileNumber: z
    .string()
    .min(10, "Mobile number must be at least 10 digits")
    .max(15, "Mobile number must be at most 15 digits")
    .regex(/^[0-9]+$/, "Mobile number must contain only digits"),
  notificationToken: z.string().optional(),
});

export type CreateCustomerDTO = z.infer<typeof createCustomerSchema>;

export const updateCustomerSchema = z.object({
  firstName: z.string().min(1, "firstName is required").optional(),
  lastName: z.string().min(1, "lastName is required").optional(),
  mobileNumber: z
    .string()
    .min(10, "Mobile number must be at least 10 digits")
    .max(15, "Mobile number must be at most 15 digits")
    .regex(/^[0-9]+$/, "Mobile number must contain only digits")
    .optional(),
  notificationToken: z.string().optional(),
});

export type UpdateCustomerDTO = z.infer<typeof updateCustomerSchema>;
