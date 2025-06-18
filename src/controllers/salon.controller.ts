import { Request, Response } from "express";
import { errorResponse } from "@utils/response";
import { StatusCodes } from "http-status-codes";
import {
  createSalon,
  deleteSalon,
  getAllSalon,
  getSalonById,
  updateSalon,
} from "@services/salon.service";

export const Create = async (req: Request, res: Response) => {
  try {
    const result = await createSalon(req.body);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error creating salon:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};

export const Update = async (req: Request, res: Response) => {
  try {
    const result = await updateSalon(req.params.id, req.body);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error creating salon:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};

export const Delete = async (req: Request, res: Response) => {
  try {
    const result = await deleteSalon(req.params.id);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error creating salon:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};

export const GetById = async (req: Request, res: Response) => {
  try {
    const result = await getSalonById(req.params.id);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error creating salon:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};

export const GetAll = async (req: Request, res: Response) => {
  try {
    const result = await getAllSalon(req.query);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error retrieving services:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};
