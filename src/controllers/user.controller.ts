import { Request, Response } from "express";
import { errorResponse } from "@utils/response";
import { StatusCodes } from "http-status-codes";
import {
  createUser,
  deleteUser,
  getAllUser,
  getUserById,
  updateUser,
} from "@services/user.service";

/**
 * @createdBy - @createdAt - Disha Radadiya - 18/06/2025
 * @description Create a new user
 * @param {Request} req - The request object containing the user data in body
 * @param {Response} res - The response object to send the result or error message
 * @returns {Promise<Response>} - The response object with the newly created user data or error message
 */
export const Create = async (req: Request, res: Response) => {
  try {
    const result = await createUser(req.body);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error creating user:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};

/**
 * @createdBy - @createdAt - Disha Radadiya - 18/06/2025
 * @description Update a user by its ID
 * @param {Request} req - The request object containing the user ID in params and the updated data in body
 * @param {Response} res - The response object to send the result or error message
 * @returns {Promise<Response>} - The response object with the updated user data or error message
 */
export const Update = async (req: Request, res: Response) => {
  try {
    const result = await updateUser(Number(req.params.id), req.body);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error creating user:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};

/**
 * @createdBy - @createdAt - Disha Radadiya - 18/06/2025
 * @description Delete a user by its ID
 * @param {Request} req - The request object containing the user ID in params
 * @param {Response} res - The response object to send the result or error message
 * @returns {Promise<Response>} - The response object with the deleted user data or error message
 */
export const Delete = async (req: Request, res: Response) => {
  try {
    const result = await deleteUser(Number(req.params.id));
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error creating user:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};

/**
 * @createdBy - @createdAt - Disha Radadiya - 18/06/2025
 * @description Retrieve a user by its ID
 * @param {Request} req - The request object containing the user ID in params
 * @param {Response} res - The response object to send the result or error message
 * @returns {Promise<Response>} - The response object with the user data or error message
 */
export const GetById = async (req: Request, res: Response) => {
  try {
    const result = await getUserById(Number(req.params.id));
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error creating user:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};

/**
 * @createdBy - @createdAt - Disha Radadiya - 18/06/2025
 * @description Retrieve all users
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Promise<Response>} - The response object with the list of users or error message
 */
export const GetAll = async (req: Request, res: Response) => {
  try {
    const result = await getAllUser(req.query);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error retrieving services:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};
