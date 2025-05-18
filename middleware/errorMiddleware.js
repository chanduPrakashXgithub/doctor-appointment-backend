export const errorMiddleware = (err, req, res, next) => {
  console.error("Error:", err.message);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });

  next(err); // Ensure error propagation
};
