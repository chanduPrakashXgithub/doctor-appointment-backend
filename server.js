import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

// ===========================================
// 1. TRUST PROXY - Must be FIRST for Railway/Vercel
// ===========================================
// Railway uses reverse proxies, so we must trust the X-Forwarded-* headers
app.set("trust proxy", 1);

// ===========================================
// 2. CORS Configuration - Before other middleware
// ===========================================
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://doctor-appointment-frontend-ruby.vercel.app",
  // Add more origins from env if needed
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim()) : [])
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl, server-to-server)
    if (!origin) {
      return callback(null, true);
    }
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Log rejected origins for debugging
    console.warn(`CORS blocked origin: ${origin}`);
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  maxAge: 86400, // 24 hours - cache preflight requests
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight OPTIONS requests explicitly for all routes
app.options("*", cors(corsOptions));

// ===========================================
// 3. Security Middleware
// ===========================================
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
}));
app.use(compression());
app.use(mongoSanitize());

// ===========================================
// 4. Body Parser - Before routes
// ===========================================
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ===========================================
// 5. Rate Limiting - After body parser
// ===========================================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === "production" ? 100 : 1000,
  message: { success: false, message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  // Fix for ERR_ERL_UNEXPECTED_X_FORWARDED_FOR
  validate: { xForwardedForHeader: false },
  // Use the first IP from X-Forwarded-For (set by Railway's proxy)
  keyGenerator: (req) => {
    return req.ip || req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || "unknown";
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: NODE_ENV === "production" ? 20 : 100,
  message: { success: false, message: "Too many login attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  keyGenerator: (req) => {
    return req.ip || req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || "unknown";
  },
});

// Apply general rate limiter to API routes
app.use("/api/", limiter);

// ===========================================
// 6. Routes
// ===========================================
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payments", paymentRoutes);

// ===========================================
// 7. Health Check & Default Routes
// ===========================================
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  });
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Doctor Appointment API is running",
    version: "1.0.0",
    environment: NODE_ENV,
  });
});

// ===========================================
// 8. Error Handling
// ===========================================
// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global Error Middleware
app.use(errorMiddleware);

// ===========================================
// 9. Server Startup
// ===========================================
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${NODE_ENV} mode on PORT: ${PORT}`);
  console.log(`✅ CORS enabled for: ${allowedOrigins.join(", ")}`);
});

// Graceful Shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Process terminated.");
    process.exit(0);
  });
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err.message);
  server.close(() => process.exit(1));
});

export default app;

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err.message);
  server.close(() => process.exit(1));
});

export default app;
