import { Router } from "express";
import { validateSchema } from "@middlewares/validateSchema";
import * as salonController from "@controllers/salon.controller";
import {
  createSalonSchema,
  updateSalonSchema,
} from "@validations/salon.validation";
const router = Router();

router.post(
  "/add",
  validateSchema(createSalonSchema),
  salonController.Create
);

router.put(
  "/update/:id",
  validateSchema(updateSalonSchema),
  salonController.Update
);

router.delete("/delete/:id", salonController.Delete);

router.get("/get/:id", salonController.GetById);

router.get("/get-all", salonController.GetAll);

export default router;
