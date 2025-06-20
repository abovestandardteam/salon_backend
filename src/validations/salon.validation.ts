import { z } from "zod";

export const createSalonSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be at most 15 digits")
    .regex(/^[0-9]+$/, "Phone number must contain only digits"),
  email: z.string().email("Invalid email format").optional(),
  address: z.string().min(1, "Address is required"),
  openTime: z
    .string()
    .regex(
      /^([0-9]{1,2}):([0-9]{2}) (AM|PM)$/i,
      "Invalid open time format (e.g., 09:00 AM)"
    ),
  closeTime: z
    .string()
    .regex(
      /^([0-9]{1,2}):([0-9]{2}) (AM|PM)$/i,
      "Invalid close time format (e.g., 06:00 PM)"
    ),
  image: z.string().url("Invalid image URL").optional(),
});

export type CreateSalonDTO = z.infer<typeof createSalonSchema>;

export const updateSalonSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional(),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be at most 15 digits")
    .regex(/^[0-9]+$/, "Phone number must contain only digits")
    .optional(),
  email: z.string().email("Invalid email format").optional(),
  address: z.string().min(1, "Address is required").optional(),
  openTime: z
    .string()
    .regex(
      /^([0-9]{2}):([0-9]{2}) (am|pm)$/,
      "Invalid open time format (e.g., 09:00 am)"
    )
    .optional(),
  closeTime: z
    .string()
    .regex(
      /^([0-9]{2}):([0-9]{2}) (am|pm)$/,
      "Invalid close time format (e.g., 06:00 pm)"
    )
    .optional(),
  image: z.string().url("Invalid image URL").optional(),
});

export type UpdateSalonDTO = z.infer<typeof updateSalonSchema>;
