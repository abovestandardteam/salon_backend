import { z } from "zod";
import { LeaveType } from "@utils/enum"; // assumed to be DAY | HOURS

const LeaveTypes = z.nativeEnum(LeaveType);

export const createLeaveSchema = z
  .object({
    date: z
      .string({ required_error: "Leave date is required" })
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    type: LeaveTypes,
    reason: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === LeaveType.HOURS) {
      if (!data.startTime || !data.endTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "startTime and endTime are required when leave type is HOURS",
          path: ["startTime"],
        });
      }
    }
  });

export type CreateLeaveDTO = z.infer<typeof createLeaveSchema>;

export const updateLeaveSchema = z
  .object({
    salonId: z.string().uuid().optional(),
    date: z.coerce.date().optional(),
    type: LeaveTypes.optional(),
    reason: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === LeaveType.HOURS) {
      if (!data.startTime || !data.endTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Both startTime and endTime are required when leave type is HOURS",
          path: ["startTime"],
        });
      }
    }
  });

export type UpdateLeaveDTO = z.infer<typeof updateLeaveSchema>;
