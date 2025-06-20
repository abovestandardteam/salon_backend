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

/**
 * @createdBy - @createdAt - Disha Radadiya - 17/06/2025
 * @description Create a new salon
 * @param {Request} req - The request object containing the salon data in body
 * @param {Response} res - The response object to send the result or error message
 * @returns {Promise<Response>} - The response object with the newly created salon data or error message
 */
export const Create = async (req: Request, res: Response) => {
  try {
    const result = await createSalon(req.body, req.user);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error creating salon:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};

/**
 * @createdBy - @createdAt - Disha Radadiya - 17/06/2025
 * @description Update an existing salon by ID
 * @param {Request} req - The request object containing the salon ID in params and the updated data in body
 * @param {Response} res - The response object to send the result or error message
 * @returns {Promise<Response>} - The response object with the updated salon data or error message
 */
export const Update = async (req: Request, res: Response) => {
  try {
    const result = await updateSalon(req.params.id, req.body);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error creating salon:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};

/**
 * @createdBy - @createdAt - Disha Radadiya - 17/06/2025
 * @description Delete an existing salon by ID
 * @param {Request} req - The request object containing the salon ID in params
 * @param {Response} res - The response object to send the result or error message
 * @returns {Promise<Response>} - The response object with the deleted salon data or error message
 */
export const Delete = async (req: Request, res: Response) => {
  try {
    const result = await deleteSalon(req.params.id);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error creating salon:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};

/**
 * @createdBy - @createdAt - Disha Radadiya - 17/06/2025
 * @description Retrieve a salon by its ID
 * @param {Request} req - The request object containing the salon ID in params
 * @param {Response} res - The response object to send the result or error message
 * @returns {Promise<Response>} - The response object with the salon data or error message
 */
export const GetById = async (req: Request, res: Response) => {
  try {
    const result = await getSalonById(req.params.id);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error creating salon:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};

/**
 * @createdBy - @createdAt - Disha Radadiya - 17/06/2025
 * @description Retrieve all salons
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Promise<Response>} - The response object with the list of salons or error message
 */
export const GetAll = async (req: Request, res: Response) => {
  try {
    const result = await getAllSalon(req.query);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error retrieving services:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};
