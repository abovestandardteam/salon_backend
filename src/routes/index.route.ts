import { Router } from "express";
import leaveRoute from "./leave.route";
import salonRoute from "./salon.route";
import salonUserRoute from "./salon-user.route";
import serviceRoute from "./service.route";
import customerRoute from "./customer.route";
import appointmentRoute from "./appointment.route";

const router = Router();

// salon
router.use("/salon", salonRoute);

// salon-user
router.use("/salon-user", salonUserRoute);

// customer
router.use("/customer", customerRoute);

// appointment
router.use("/leave", leaveRoute);

// service
router.use("/service", serviceRoute);

// appointment
router.use("/appointment", appointmentRoute);

export default router;
