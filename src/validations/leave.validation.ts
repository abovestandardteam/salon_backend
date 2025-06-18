import { z } from "zod";
import { LeaveType } from "@utils/enum"; // assumed to be DAY | HOURS

const LeaveTypes = z.nativeEnum(LeaveType);

export const createLeaveSchema = z
  .object({
    salonId: z.string().uuid("Invalid salon ID"),
    date: z.coerce.date({ required_error: "Leave date is required" }),
    type: LeaveTypes,
    reason: z.string().optional(),
    timeStart: z.string().optional(),
    timeEnd: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === LeaveType.HOURS) {
      if (!data.timeStart || !data.timeEnd) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "timeStart and timeEnd are required when leave type is HOURS",
          path: ["timeStart"],
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
    timeStart: z.string().optional(),
    timeEnd: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === LeaveType.HOURS) {
      if (!data.timeStart || !data.timeEnd) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Both timeStart and timeEnd are required when leave type is HOURS",
          path: ["timeStart"],
        });
      }
    }
  });

export type UpdateLeaveDTO = z.infer<typeof updateLeaveSchema>;
