import { Request, Response } from "express";
import { errorResponse } from "@utils/response";
import { StatusCodes } from "http-status-codes";
import {
  createCustomer,
  deleteCustomer,
  getAllCustomer,
  getCustomerById,
  updateCustomer,
} from "@services/customer.service";

/**
 * @createdBy - @createdAt - Disha Radadiya - 18/06/2025
 * @description Create a new customer
 * @param {Request} req - The request object containing the customer data in body
 * @param {Response} res - The response object to send the result or error message
 * @returns {Promise<Response>} - The response object with the newly created customer data or error message
 */
export const Create = async (req: Request, res: Response) => {
  try {
    const result = await createCustomer(req.body);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error creating customer:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};

/**
 * @createdBy - @createdAt - Disha Radadiya - 18/06/2025
 * @description Update a customer by its ID
 * @param {Request} req - The request object containing the customer ID in params and the updated data in body
 * @param {Response} res - The response object to send the result or error message
 * @returns {Promise<Response>} - The response object with the updated customer data or error message
 */
export const Update = async (req: Request, res: Response) => {
  try {
    const result = await updateCustomer(Number(req.params.id), req.body);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error creating customer:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};

/**
 * @createdBy - @createdAt - Disha Radadiya - 18/06/2025
 * @description Delete a customer by its ID
 * @param {Request} req - The request object containing the customer ID in params
 * @param {Response} res - The response object to send the result or error message
 * @returns {Promise<Response>} - The response object with the deleted customer data or error message
 */
export const Delete = async (req: Request, res: Response) => {
  try {
    const result = await deleteCustomer(Number(req.params.id));
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error creating customer:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};

/**
 * @createdBy - @createdAt - Disha Radadiya - 18/06/2025
 * @description Retrieve a customer by its ID
 * @param {Request} req - The request object containing the customer ID in params
 * @param {Response} res - The response object to send the result or error message
 * @returns {Promise<Response>} - The response object with the customer data or error message
 */
export const GetById = async (req: Request, res: Response) => {
  try {
    const result = await getCustomerById(Number(req.params.id));
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error creating customer:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};

/**
 * @createdBy - @createdAt - Disha Radadiya - 18/06/2025
 * @description Retrieve all customers
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Promise<Response>} - The response object with the list of customers or error message
 */
export const GetAll = async (req: Request, res: Response) => {
  try {
    const result = await getAllCustomer(req.query);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error retrieving services:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};
