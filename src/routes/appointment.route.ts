import { Router } from "express";
import { validateSchema } from "@middlewares/validateSchema";
import * as appointmentController from "@controllers/appointment.controller";
import {
  createAppointmentSchema,
  updateAppointmentSchema,
  updateAppointmentStatusSchema,
} from "@validations/appointment.validation";
const router = Router();

router.post(
  "/add",
  validateSchema(createAppointmentSchema),
  appointmentController.Create
);

router.put(
  "/update/:id",
  validateSchema(updateAppointmentSchema),
  appointmentController.Update
);

router.patch(
  "/status/:id",
  validateSchema(updateAppointmentStatusSchema),
  appointmentController.UpdateStatus
);

router.delete("/delete/:id", appointmentController.Delete);

router.get("/get/:id", appointmentController.GetById);

router.get("/get-all", appointmentController.GetAll);

export default router;
