import { getAuth } from "@clerk/express";
import AppError from "../utils/AppError.js";

const authMiddleware = (req, res, next) => {
  try {
    const auth = getAuth(req);

    if (!auth.userId) {
      throw new AppError("Unauthorized - Authentication required", 401);
    }

    req.auth = auth;
    next();
  } catch (error) {
    next(error);
  }
};

export default authMiddleware;
