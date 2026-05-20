import { getAuth } from "@clerk/express";
import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";

// Accept either Clerk auth (primary) or our own backend JWT cookie named `token`.
const authMiddleware = (req, res, next) => {
  try {
    const auth = getAuth(req);

    // If Clerk provides a userId, attach and continue.
    if (auth && auth.userId) {
      req.auth = auth;
      return next();
    }

    // Fallback: accept a signed JWT stored in an HttpOnly cookie named `token`.
    const token = req.cookies?.token || null;

    if (!token) {
      throw new AppError("Unauthorized - Authentication required", 401);
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || "");
    } catch (err) {
      throw new AppError("Invalid or expired authentication token", 401);
    }

    // Attach a minimal `auth`-like object and `user` payload for downstream handlers.
    req.user = decoded;
    req.auth = {
      userId: decoded.id || decoded._id || null,
      sessionId: null,
      sessionStatus: null,
      getToken: async () => token,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export default authMiddleware;
