import { getAuth } from "@clerk/express";
import AppError from "../utils/AppError.js";

const authMiddleware = (req, res, next) => {
  try {
    const auth = getAuth(req);

    if (auth?.userId) {
      req.auth = auth;
      return next();
    }

    throw new AppError("Unauthorized - Authentication required", 401);
  } catch (error) {
    next(error);
  }
};

export default authMiddleware;
