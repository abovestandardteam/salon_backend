import { Request, Response } from "express";
import { errorResponse } from "@utils/response";
import { StatusCodes } from "http-status-codes";
import {
  createSalonUser,
  deleteSalonUser,
  getAllSalonUser,
  getSalonUserById,
  loginSalonUser,
  updateSalonUser,
} from "@services/salon-user.service";

/**
 * @createdBy - @createdAt - Disha Radadiya - 19/06/2025
 * @description Create a new salon user
 * @param {Request} req - The request object containing the user data in body
 * @param {Response} res - The response object to send the result or error message
 * @returns {Promise<Response>} - The response object with the newly created user data or error message
 */
export const Create = async (req: Request, res: Response) => {
  try {
    const result = await createSalonUser(req.body);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error creating leave:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};

/**
 * @createdBy - @createdAt - Disha Radadiya - 19/06/2025
 * @description Update an existing salon user
 * @param {Request} req - The request object containing the user ID in params and the updated data in body
 * @param {Response} res - The response object to send the result or error message
 * @returns {Promise<Response>} - The response object with the updated user data or error message
 */
export const Update = async (req: Request, res: Response) => {
  try {
    const result = await updateSalonUser(req.params.id, req.body);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error creating leave:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};

/**
 * @createdBy - @createdAt - Disha Radadiya - 19/06/2025
 * @description Login an existing salon user
 * @param {Request} req - The request object containing the user credentials in body
 * @param {Response} res - The response object to send the result or error message
 * @returns {Promise<Response>} - The response object with the logged in user data or error message
 */
export const Login = async (req: Request, res: Response) => {
  try {
    const result = await loginSalonUser(req.body);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error creating leave:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};

/**
 * @createdBy - @createdAt - Disha Radadiya - 19/06/2025
 * @description Delete an existing salon user by ID
 * @param {Request} req - The request object containing the user ID in params
 * @param {Response} res - The response object to send the result or error message
 * @returns {Promise<Response>} - The response object with the deleted user data or error message
 */
export const Delete = async (req: Request, res: Response) => {
  try {
    const result = await deleteSalonUser(req.params.id);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error creating leave:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};

/**
 * @createdBy - @createdAt - Disha Radadiya - 19/06/2025
 * @description Retrieve a salon user by its ID
 * @param {Request} req - The request object containing the user ID in params
 * @param {Response} res - The response object to send the result or error message
 * @returns {Promise<Response>} - The response object with the user data or error message
 */
export const GetById = async (req: Request, res: Response) => {
  try {
    const result = await getSalonUserById(req.params.id);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error creating leave:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};

/**
 * @createdBy - @createdAt - Disha Radadiya - 19/06/2025
 * @description Retrieve all salon users
 * @param {Request} req - The request object containing query parameters
 * @param {Response} res - The response object to send the result or error message
 * @returns {Promise<Response>} - The response object with the list of salon users or error message
 */

export const GetAll = async (req: Request, res: Response) => {
  try {
    const result = await getAllSalonUser(req.query);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error retrieving services:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};
