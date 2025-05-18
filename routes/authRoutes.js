import express from "express";
import { login, register, getUser } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { body } from "express-validator";

const router = express.Router();

const validateRegister = [
  body("email").isEmail().withMessage("Invalid email format"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

const validateLogin = [
  body("email").isEmail().withMessage("Invalid email format"),
  body("password").notEmpty().withMessage("Password is required"),
];

router.post("/login", validateLogin, login);
router.post("/register", validateRegister, register);
router.get("/user", authMiddleware, getUser);

export default router;
