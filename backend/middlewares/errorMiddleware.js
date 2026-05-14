export const errorMiddleware = (err, req, res, next) => {
  console.error("Error:", {
    message: err.message,
    code: err.code,
    statusCode: err.statusCode,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  // Handle connection errors
  if (
    err.code === "ECONNRESET" ||
    err.code === "ECONNREFUSED" ||
    err.code === "ETIMEDOUT"
  ) {
    return res.status(503).json({
      success: false,
      message: "Service temporarily unavailable. Please try again later.",
    });
  }

  // Handle MongoDB errors
  if (err.name === "MongoNetworkError" || err.name === "MongoTimeoutError") {
    return res.status(503).json({
      success: false,
      message: "Database connection error. Please try again later.",
    });
  }

  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Something went wrong",
  });
};
