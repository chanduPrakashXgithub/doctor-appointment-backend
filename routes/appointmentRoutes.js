import express from "express";
import { 
  bookAppointment, 
  getAppointments, 
  cancelAppointment 
} from "../controllers/appointmentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/book", authMiddleware, bookAppointment);
router.get("/appointments", authMiddleware, getAppointments);
router.delete("/:id", authMiddleware, cancelAppointment);

export default router;
