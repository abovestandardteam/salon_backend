import { Request, Response, NextFunction } from "express";
import { protectedRoutes } from "./protected.routes";
import { verifyToken } from "@utils/jwt";
import prisma from "config/prisma";
import { errorResponse } from "@utils/response";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "@utils/messages";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const matched = protectedRoutes.some(
    (route) => route.path === req.path && route.method.includes(req.method)
  );

  if (!matched) return next(); // ✅ Not a protected route → skip auth

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json(
        errorResponse(StatusCodes.UNAUTHORIZED, MESSAGES.customer.notFound)
      );
    return;
  }

  try {
    const { id } = await verifyToken(token);

    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      res.send(
        errorResponse(StatusCodes.NOT_FOUND, MESSAGES.customer.notFound)
      );
    }

    req.user = customer;
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
