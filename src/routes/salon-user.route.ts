import { Router } from "express";
import { validateSchema } from "@middlewares/validateSchema";
import * as salonUserController from "@controllers/salon-user.controller";
import {
  createSalonUserSchema,
  updateSalonUserSchema,
} from "@validations/salon-user.validation";
const router = Router();

router.post(
  "/add",
  validateSchema(createSalonUserSchema),
  salonUserController.Create
);

router.put(
  "/update/:id",
  validateSchema(updateSalonUserSchema),
  salonUserController.Update
);

router.post("/login", salonUserController.Login);

router.delete("/delete/:id", salonUserController.Delete);

router.get("/get/:id", salonUserController.GetById);

router.get("/get-all", salonUserController.GetAll);

export default router;
