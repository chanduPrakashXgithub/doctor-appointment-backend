import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Access Denied. No Token Provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = decoded; // Attach user details to request
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: "Invalid or Expired Token" });
  }
};

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

export const roleMiddleware = (requiredRole) => (req, res, next) => {
  if (!req.user || req.user.role !== requiredRole) {
    return res.status(403).json({ success: false, message: "Forbidden: Insufficient Permissions" });
  }
  next();
};
