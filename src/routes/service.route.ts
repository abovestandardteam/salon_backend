import { Router } from "express";
import { validateSchema } from "@middlewares/validateSchema";
import * as serviceController from "@controllers/service.controller";
import {
  createServiceSchema,
  updateServiceSchema,
} from "@validations/service.validation";
import { transformFlatToNested } from "@middlewares/transformFlatToNested";
const router = Router();

router.post(
  "/add",
  transformFlatToNested,
  validateSchema(createServiceSchema),
  serviceController.Create
);

router.put(
  "/update/:id",
  transformFlatToNested,
  validateSchema(updateServiceSchema),
  serviceController.Update
);

router.delete("/delete/:id", serviceController.Delete);

router.get("/get/:id", serviceController.GetById);

router.get("/get-all", serviceController.GetAll);

export default router;
