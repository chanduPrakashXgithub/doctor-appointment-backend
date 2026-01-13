import express from "express";
import { login, register, getUser } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

// Validation middleware handler
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// Validation rules
const validateRegister = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters"),
  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required"),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required"),
  body("role")
    .optional()
    .isIn(["patient", "doctor"])
    .withMessage("Invalid role"),
];

const validateLogin = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

// Routes
router.post("/register", validateRegister, handleValidation, register);
router.post("/login", validateLogin, handleValidation, login);
router.get("/user", authMiddleware, getUser);

export default router;
