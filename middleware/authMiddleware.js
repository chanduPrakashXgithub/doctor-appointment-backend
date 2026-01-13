import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access Denied. No Token Provided"
      });
    }

    const token = authHeader.split(" ")[1];

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined");
      return res.status(500).json({
        success: false,
        message: "Server configuration error"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user details to request
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please log in again."
      });
    }
    return res.status(403).json({
      success: false,
      message: "Invalid or Expired Token"
    });
  }
};

/**
 * Optional Authentication Middleware
 * Attaches user if token exists, continues as guest otherwise
 */
export const optionalAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    }
  } catch (error) {
    req.user = null; // Proceed as guest user
  }
  next();
};

/**
 * Role-based Authorization Middleware
 * @param {string|string[]} requiredRoles - Single role or array of allowed roles
 */
export const roleMiddleware = (requiredRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }

  // Convert to array if single role provided
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Insufficient Permissions"
    });
  }
  next();
};
