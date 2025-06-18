import { errorResponse } from "@utils/response";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodSchema } from "zod";

export const validateSchema = (schema: ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      }));

      res.send(errorResponse(StatusCodes.BAD_REQUEST, errors));
    }

    req.body = result.data;

    next();
  };
};
