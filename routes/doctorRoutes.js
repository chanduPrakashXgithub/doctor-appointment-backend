import express from "express";
import { addDoctor, getDoctors, getDoctorById } from "../controllers/doctorController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", authMiddleware,roleMiddleware("admin"), addDoctor);

router.get("/", getDoctors);

router.get("/:id", getDoctorById);

export default router;
