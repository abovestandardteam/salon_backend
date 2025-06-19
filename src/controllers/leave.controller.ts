import { Request, Response } from "express";
import { errorResponse } from "@utils/response";
import { StatusCodes } from "http-status-codes";
import {
  createLeave,
  deleteLeave,
  getAllLeave,
  getLeaveById,
  updateLeave,
} from "@services/leave.service";

export const Create = async (req: Request, res: Response) => {
  try {
    const result = await createLeave(req.body, req.user);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error creating leave:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};

export const Update = async (req: Request, res: Response) => {
  try {
    const result = await updateLeave(Number(req.params.id), req.body);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error creating leave:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};

export const Delete = async (req: Request, res: Response) => {
  try {
    const result = await deleteLeave(Number(req.params.id));
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error creating leave:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};

export const GetById = async (req: Request, res: Response) => {
  try {
    const result = await getLeaveById(Number(req.params.id));
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error creating leave:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};

export const GetAll = async (req: Request, res: Response) => {
  try {
    const result = await getAllLeave(req.query);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error retrieving services:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};
