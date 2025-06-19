import { Request, Response } from "express";
import { errorResponse } from "@utils/response";
import { StatusCodes } from "http-status-codes";
import {
  createAppointment,
  deleteAppointment,
  getAllAppointment,
  getAppointmentById,
  updateAppointment,
  updateAppointmentStatus,
  GetSlot,
} from "@services/appointment.service";

/**
 * @createdBy - @createdAt - Disha Radadiya - 18/06/2025
 * @description Create a new appointment
 * @param {Request} req - The request object containing the appointment data in body
 * @param {Response} res - The response object to send the result or error message
 * @returns {Promise<Response>} - The response object with the newly created appointment data or error message
 */

export const Create = async (req: Request, res: Response) => {
  try {
    const result = await createAppointment(req.body);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};

/**
 * @createdBy - @createdAt - Disha Radadiya - 18/06/2025
 * @description Update an existing appointment by ID
 * @param {Request} req - The request object containing the appointment ID in params and the updated data in body
 * @param {Response} res - The response object to send the result or error message
 * @returns {Promise<Response>} - The response object with the updated appointment data or error message
 */
export const Update = async (req: Request, res: Response) => {
  try {
    const result = await updateAppointment(Number(req.params.id), req.body);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};

/**
 * @createdBy - @createdAt - Disha Radadiya - 18/06/2025
 * @description Update the status of an existing appointment by ID
 * @param {Request} req - The request object containing the appointment ID in params and the updated status in body
 * @param {Response} res - The response object to send the result or error message
 * @returns {Promise<Response>} - The response object with the updated appointment data or error message
 */

export const UpdateStatus = async (req: Request, res: Response) => {
  try {
    const result = await updateAppointmentStatus(
      Number(req.params.id),
      req.body
    );
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};

/**
 * @createdBy - @createdAt - Disha Radadiya - 18/06/2025
 * @description Delete an existing appointment by ID
 * @param {Request} req - The request object containing the appointment ID in params
 * @param {Response} res - The response object to send the result or error message
 * @returns {Promise<Response>} - The response object with the deleted appointment data or error message
 */
export const Delete = async (req: Request, res: Response) => {
  try {
    const result = await deleteAppointment(Number(req.params.id));
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};

/**
 * @createdBy - @createdAt - Disha Radadiya - 18/06/2025
 * @description Retrieve an appointment by its ID
 * @param {Request} req - The request object containing the appointment ID in params
 * @param {Response} res - The response object to send the result or error message
 * @returns {Promise<Response>} - The response object with the appointment data or error message
 */

export const GetById = async (req: Request, res: Response) => {
  try {
    const result = await getAppointmentById(Number(req.params.id));
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error getting appointment:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};

/**
 * @createdBy - @createdAt - Disha Radadiya - 18/06/2025
 * @description Retrieve all appointments for the user
 * @param {Request} req - The request object containing the user information
 * @param {Response} res - The response object to send the result or error message
 * @returns {Promise<Response>} - The response object with the list of appointments or error message
 */

export const GetAll = async (req: Request, res: Response) => {
  try {
    const result = await getAllAppointment(req.user, req.query);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error retrieving appointments:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};

export const GetSlots = async (req: Request, res: Response) => {
  try {
    const result = await GetSlot();
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error getting appointment:", error);
    res.send(errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error));
  }
};
