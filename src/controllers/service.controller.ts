import { Request, Response } from "express";
import { errorResponse } from "@utils/response";
import { StatusCodes } from "http-status-codes";
import {
  createService,
  deleteService,
  getAllService,
  getServiceById,
  updateService,
} from "@services/service.service";

/**
 * @createdBy - @createdAt - Disha Radadiya - 17/06/2025
 * @description Create a new service
 * @param {Request} req - The request object containing the service data in body
 * @param {Response} res - The response object to send the result or error message
 * @returns {Promise<Response>} - The response object with the newly created service data or error message
 */
export const Create = async (req: Request, res: Response) => {
  try {
    const result = await createService(req.body);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error creating service:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};

/**
 * @createdBy - @createdAt - Disha Radadiya - 17/06/2025
 * @description Update a service by its ID
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Promise<Response>} - The response object
 */
export const Update = async (req: Request, res: Response) => {
  try {
    const result = await updateService(Number(req.params.id), req.body);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error creating service:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};

/**
 * @createdBy - @createdAt - Disha Radadiya - 17/06/2025
 * @description Delete a service by ID
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Promise<Response>} - The response object
 */
export const Delete = async (req: Request, res: Response) => {
  try {
    const result = await deleteService(Number(req.params.id));
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error creating service:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};

/**
 * @createdBy - @createdAt - Disha Radadiya - 17/06/2025
 * @description Retrieve a service by its ID
 * @param {Request} req - The request object containing the service ID in params
 * @param {Response} res - The response object to send the result or error message
 * @returns {Promise<Response>} - The response object with the service data or error message
 */
export const GetById = async (req: Request, res: Response) => {
  try {
    const result = await getServiceById(Number(req.params.id));
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error creating service:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};

/**
 * @createdBy - @createdAt - Disha Radadiya - 17/06/2025
 * @description Get all services
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Promise<Response>} - The response object
 */
export const GetAll = async (req: Request, res: Response) => {
  try {
    const result = await getAllService();
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error retrieving services:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};
