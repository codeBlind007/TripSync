import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import tripRoomController from "../controllers/tripRoomController.js";

const router = express.Router();

router
  .route("/tripRooms/:tripId/messages")
  .get(authMiddleware, tripRoomController.getTripRoomMessage);

export default router;
