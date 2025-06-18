import { Request, Response } from "express";
import { errorResponse } from "@utils/response";
import { StatusCodes } from "http-status-codes";
import {
  createSalonUser,
  deleteSalonUser,
  getAllSalonUser,
  getSalonUserById,
  updateSalonUser,
} from "@services/salon-user.service";

export const Create = async (req: Request, res: Response) => {
  try {
    const result = await createSalonUser(req.body);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error creating leave:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};

export const Update = async (req: Request, res: Response) => {
  try {
    const result = await updateSalonUser(req.params.id, req.body);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error creating leave:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};

export const Delete = async (req: Request, res: Response) => {
  try {
    const result = await deleteSalonUser(req.params.id);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error creating leave:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};

export const GetById = async (req: Request, res: Response) => {
  try {
    const result = await getSalonUserById(req.params.id);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error creating leave:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};

export const GetAll = async (req: Request, res: Response) => {
  try {
    const result = await getAllSalonUser(req.query);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error retrieving services:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};
