import { z } from "zod";

// ✅ Create Service Schema
export const createServiceSchema = z.object({
  salonId: z.string().uuid({ message: "Salon ID must be a valid UUID" }),
  name: z.string().min(1, "Name is required"),
  price: z.coerce.number({ invalid_type_error: "Price must be a number" }),
  duration: z.coerce.number({
    invalid_type_error: "Duration must be a number",
  }),
  image: z.string().optional(),
});

export type CreateServiceDTO = z.infer<typeof createServiceSchema>;

// ✅ Update Service Schema
export const updateServiceSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  price: z.coerce
    .number({ invalid_type_error: "Price must be a number" })
    .optional(),
  duration: z.coerce
    .number({ invalid_type_error: "Duration must be a number" })
    .optional(),
  image: z.string().optional(),
});

export type UpdateServiceDTO = z.infer<typeof updateServiceSchema>;
