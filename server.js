import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";

dotenv.config();

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json()); // Parse JSON requests

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payments", paymentRoutes);

// Default Route
app.get("/", (req, res) => res.send("Hello Chandu, the server is running!"));

// Error Middleware (Handles Errors Globally)
app.use(errorMiddleware);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on PORT: ${PORT}`);
});
