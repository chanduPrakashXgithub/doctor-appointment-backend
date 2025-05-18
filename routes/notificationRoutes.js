import express from "express";
import { notifyPatient } from "../controllers/notificationController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/send", authMiddleware, roleMiddleware(["admin", "doctor"]), notifyPatient);

export default router;
