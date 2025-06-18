import { Router } from "express";
import { validateSchema } from "@middlewares/validateSchema";
import * as customerController from "@controllers/customer.controller";
import {
  createCustomerSchema,
  updateCustomerSchema,
} from "@validations/customer.validation";
const router = Router();

router.post(
  "/add",
  validateSchema(createCustomerSchema),
  customerController.Create
);

router.put(
  "/update/:id",
  validateSchema(updateCustomerSchema),
  customerController.Update
);

router.delete("/delete/:id", customerController.Delete);

router.get("/get/:id", customerController.GetById);

router.get("/get-all", customerController.GetAll);

export default router;
