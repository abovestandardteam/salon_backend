import { z } from "zod";
import { UserRole } from "@utils/enum"; // Ensure this exports values like OWNER, MANAGER, STAFF

// Create a native enum schema for user roles
const UserRoles = z.nativeEnum(UserRole);

// Schema for creating a new SalonUser
export const createSalonUserSchema = z.object({
  salonId: z.string().uuid("Invalid Salon ID").optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be at most 15 digits")
    .regex(/^[0-9]+$/, "Phone number must contain only digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: UserRoles.default(UserRole.OWNER),
});

export type CreateSalonUserDTO = z.infer<typeof createSalonUserSchema>;

// Schema for updating an existing SalonUser
export const updateSalonUserSchema = z.object({
  salonId: z.string().uuid("Invalid Salon ID").optional(),
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email format").optional(),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be at most 15 digits")
    .regex(/^[0-9]+$/, "Phone number must contain only digits")
    .optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
  role: UserRoles.optional(),
});

export type UpdateSalonUserDTO = z.infer<typeof updateSalonUserSchema>;

export const loginSalonUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginSalonUserDTO = z.infer<typeof loginSalonUserSchema>;
