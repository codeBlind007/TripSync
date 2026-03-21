import express from "express";
import authController from "../controllers/authController.js";
import upload from "../utils/multer.js";
import tripController from "../controllers/tripController.js";
import tripRoomController from "../controllers/tripRoomController.js";
import { createTripValidation } from "../middlewares/tripValidation.js";
import { validateInvitationRequest, getRecievedInvitation, getSentInvitation, acceptReceivedInvitation } from "../controllers/invitationController.js";
const router = express.Router();

router
  .route("/trips")
  .get(authController.protect, tripController.getAllUserTrips)
  .post(authController.protect, createTripValidation, tripController.createTrip);

router
  .route("/trips/:tripId")
  .get(authController.protect, tripController.getTrip)
  .delete(authController.protect, tripController.deleteTrip);

router
  .route("/trips/:tripId/collaborators").get(authController.protect, tripController.getTripCollaborators)
  .put(authController.protect, tripController.addCollaborators);

router
  .route("/trips/:tripId/collaborators/:collaboratorId")
  .delete(authController.protect, tripController.deleteCollaborators);

router
  .route("/trips/:tripId/itinerary")
  .get(authController.protect, tripController.getTripItinerary)
  .post(authController.protect, tripController.addItinerary);

router
  .route("/trips/:tripId/itinerary/:itineraryId")
  .post(authController.protect, tripController.addItineraryActivity)
  .put(authController.protect, tripController.editItinerary)
  .delete(authController.protect, tripController.deleteItinerary);

router
  .route("/trips/:tripId/itinerary/:itineraryId/activities/:activityId")
  .get(authController.protect, tripController.getItineraryActivity)
  .put(authController.protect, tripController.editItineraryActivity)
  .delete(authController.protect, tripController.deleteItineraryActivity);

router
  .route("/trips/:tripId/tasks")
  .get(authController.protect, tripController.getTripTasks)
  .post(authController.protect, tripController.addTask);

router
  .route("/trips/:tripId/tasks/:taskId")
  .put(authController.protect, tripController.editTask)
  .delete(authController.protect, tripController.deleteTask);

router
  .route("/trips/:tripId/expenses")
  .get(authController.protect, tripController.getTripExpenses)
  .post(authController.protect, tripController.addExpenses);

router
  .route("/trips/:tripId/expenses/:expenseId")
  .put(authController.protect, tripController.editExpenses);

router
  .route("/trips/:tripId/invite")
  .post(authController.protect, tripController.inviteCollaborator);

router.route("/trips/:tripId/story").get(authController.protect, tripController.getTripStory);

// TripRoom routes
router.route("/trips/tripRooms/:tripId/messages").get(authController.protect, tripRoomController.getTripRoomMessage);
router.route("/trips/tripRooms/:tripId/collaborators").get(authController.protect, tripController.getTripCollaborators);

// Trip invitation

router.route("/trips/invitations/validate").get(validateInvitationRequest);
router.route("/trips/invitations/recieved").get(authController.protect, getRecievedInvitation);
router.route("/trips/invitations/sent/:tripId").get(authController.protect, getSentInvitation);
router.route("/trips/:tripId/invitations/:invitationId").patch(authController.protect, acceptReceivedInvitation);
export default router;
