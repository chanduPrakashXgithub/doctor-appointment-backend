import express from "express";
import { processPayment, getPayments, createCheckoutSession } from "../controllers/paymentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/process", authMiddleware, processPayment);
router.get("/history", authMiddleware, getPayments);

router.post("/create-checkout-session", authMiddleware, createCheckoutSession);

export default router;
