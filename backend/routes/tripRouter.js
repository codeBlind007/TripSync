import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import upload from "../utils/multer.js";
import tripController from "../controllers/tripController.js";
import tripRoomController from "../controllers/tripRoomController.js";
import {
  createTripValidation,
  addItineraryActivitiesValidation,
  addTaskValidation,
  addExpensesValidation,
} from "../middlewares/tripValidation.js";

import {
  validateInvitationRequest,
  getRecievedInvitation,
  getSentInvitation,
  acceptReceivedInvitation,
} from "../controllers/invitationController.js";

const router = express.Router();

router
  .route("/trips")
  .get(authMiddleware, tripController.getAllUserTrips)
  .post(authMiddleware, createTripValidation, tripController.createTrip);

router
  .route("/trips/:tripId")
  .get(authMiddleware, tripController.getTrip)
  .delete(authMiddleware, tripController.deleteTrip);

router
  .route("/trips/:tripId/collaborators")
  .get(authMiddleware, tripController.getTripCollaborators)
  .put(authMiddleware, tripController.addCollaborators);

router
  .route("/trips/:tripId/collaborators/:collaboratorId")
  .delete(authMiddleware, tripController.deleteCollaborators);

router
  .route("/trips/:tripId/itinerary")
  .get(authMiddleware, tripController.getTripItinerary)
  .post(authMiddleware, tripController.addItinerary);

router
  .route("/trips/:tripId/itinerary/:itineraryId")
  .post(
    authMiddleware,
    addItineraryActivitiesValidation,
    tripController.addItineraryActivity,
  )
  .put(authMiddleware, tripController.editItinerary)
  .delete(authMiddleware, tripController.deleteItinerary);

router
  .route("/trips/:tripId/itinerary/:itineraryId/activities/:activityId")
  .get(authMiddleware, tripController.getItineraryActivity)
  .put(authMiddleware, tripController.editItineraryActivity)
  .delete(authMiddleware, tripController.deleteItineraryActivity);

router
  .route("/trips/:tripId/tasks")
  .get(authMiddleware, tripController.getTripTasks)
  .post(authMiddleware, addTaskValidation, tripController.addTask);

router
  .route("/trips/:tripId/tasks/:taskId")
  .put(authMiddleware, tripController.editTask)
  .delete(authMiddleware, tripController.deleteTask);

router
  .route("/trips/:tripId/expenses")
  .get(authMiddleware, tripController.getTripExpenses)
  .post(authMiddleware, addExpensesValidation, tripController.addExpenses);

router
  .route("/trips/:tripId/expenses/:expenseId")
  .put(authMiddleware, tripController.editExpenses);

router
  .route("/trips/:tripId/invite")
  .get(authMiddleware, tripController.generateInviteLink);


// TripRoom routes
router
  .route("/trips/tripRooms/:tripId/messages")
  .get(authMiddleware, tripRoomController.getTripRoomMessage);
router
  .route("/trips/tripRooms/:tripId/collaborators")
  .get(authMiddleware, tripController.getTripCollaborators);

// Trip invitation

router.route("/trips/invitations/validate").get(validateInvitationRequest);
router
  .route("/trips/invitations/recieved")
  .get(authMiddleware, getRecievedInvitation);
router
  .route("/trips/invitations/sent/:tripId")
  .get(authMiddleware, getSentInvitation);
router
  .route("/trips/:tripId/invitations/:invitationId")
  .patch(authMiddleware, acceptReceivedInvitation);

router.post(
  "/trips/join/:inviteCode",
  authMiddleware,
  tripController.joinTripByInviteLink,
);
export default router;
