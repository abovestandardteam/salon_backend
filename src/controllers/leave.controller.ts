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

/**
 * @createdBy - @createdAt - Disha Radadiya - 19/06/2025
 * @description Create a new leave
 * @param {Request} req - The request object containing the leave data in body
 * @param {Response} res - The response object to send the result or error message
 * @returns {Promise<Response>} - The response object with the newly created leave data or error message
 */
export const Create = async (req: Request, res: Response) => {
  try {
    const result = await createLeave(req.body, req.user);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error creating leave:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};

/**
 * @createdBy - @createdAt - Disha Radadiya - 19/06/2025
 * @description Update an existing leave by ID
 * @param {Request} req - The request object containing the leave ID in params and the updated data in body
 * @param {Response} res - The response object to send the result or error message
 * @returns {Promise<Response>} - The response object with the updated leave data or error message
 */
export const Update = async (req: Request, res: Response) => {
  try {
    const result = await updateLeave(Number(req.params.id), req.body);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error creating leave:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};

/**
 * @createdBy - @createdAt - Disha Radadiya - 19/06/2025
 * @description Delete an existing leave by ID
 * @param {Request} req - The request object containing the leave ID in params
 * @param {Response} res - The response object to send the result or error message
 * @returns {Promise<Response>} - The response object with the deleted leave data or error message
 */
export const Delete = async (req: Request, res: Response) => {
  try {
    const result = await deleteLeave(Number(req.params.id));
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error creating leave:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};

/**
 * @createdBy - @createdAt - Disha Radadiya - 19/06/2025
 * @description Retrieve a leave by its ID
 * @param {Request} req - The request object containing the leave ID in params
 * @param {Response} res - The response object to send the result or error message
 * @returns {Promise<Response>} - The response object with the leave data or error message
 */
export const GetById = async (req: Request, res: Response) => {
  try {
    const result = await getLeaveById(Number(req.params.id));
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error creating leave:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};

/**
 * @createdBy - @createdAt - Disha Radadiya - 19/06/2025
 * @description Retrieve all leaves
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Promise<Response>} - The response object with the list of leaves or error message
 */
export const GetAll = async (req: Request, res: Response) => {
  try {
    const result = await getAllLeave(req.query);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error retrieving services:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};
