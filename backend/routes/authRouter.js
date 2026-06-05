import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import authController from "../controllers/authController.js";

const router = express.Router();

router
  .route("/auth/oauth-callback")
  .post(authMiddleware, authController.oauthCallback);

export default router;
