import { Router } from "express";
import { validateSchema } from "@middlewares/validateSchema";
import * as leaveController from "@controllers/leave.controller";
import {
  createLeaveSchema,
  updateLeaveSchema,
} from "@validations/leave.validation";
const router = Router();

router.post("/add", validateSchema(createLeaveSchema), leaveController.Create);

router.put(
  "/update/:id",
  validateSchema(updateLeaveSchema),
  leaveController.Update
);

router.delete("/delete/:id", leaveController.Delete);

router.get("/get/:id", leaveController.GetById);

router.get("/get-all", leaveController.GetAll);

export default router;
