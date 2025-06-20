import prisma from "config/prisma";
import { match } from "path-to-regexp";
import { verifyToken } from "@utils/jwt";
import { MESSAGES } from "@utils/messages";
import { StatusCodes } from "http-status-codes";
import { errorResponse } from "@utils/response";
import { protectedRoutes } from "./protected.routes";
import { Request, Response, NextFunction } from "express";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const isProtected = protectedRoutes.some((route) => {
    const isMethodMatch = route.method.includes(req.method);
    const matcher = match(route.path, { decode: decodeURIComponent });
    return isMethodMatch && matcher(req.path);
  });

  if (!isProtected) return next(); // Not a protected route

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json(
        errorResponse(StatusCodes.UNAUTHORIZED, MESSAGES.common.pleaseLogin)
      );
    return;
  }

  try {
    const { id, userType } = await verifyToken(token);

    let user = null;

    if (userType === "customer") {
      user = await prisma.customer.findUnique({ where: { id } });
    } else if (userType === "salonUser") {
      user = await prisma.salonUser.findUnique({ where: { id } });
    }

    if (!user) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json(errorResponse(StatusCodes.NOT_FOUND, MESSAGES.customer.notFound));
    }

    req.user = { ...user, userType };

    return next();
  } catch (err) {
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Unauthorized: Invalid token" });
  }
};
