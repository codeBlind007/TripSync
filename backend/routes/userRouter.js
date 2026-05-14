import express from "express";
import userController from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
const router = express.Router();

// router.route('/').get(userController.getAllUsers);
router
  .route("/invitations/:tripId/respond")
  .post(authMiddleware, userController.respondToInvite);
router
  .route("/user/upcoming-trips")
  .get(authMiddleware, userController.upComingTrips);
router
  .route("/user/ongoing-trips")
  .get(authMiddleware, userController.ongoingTrips);
router
  .route("/user/upcoming-trips-dashboard")
  .get(authMiddleware, userController.upComingTripsDashboard);
router
  .route("/user/completed-trips")
  .get(authMiddleware, userController.completedTrips);
router
  .route("/user/completed-trips-dashboard")
  .get(authMiddleware, userController.completedTripsDashboard);
router
  .route("/user/all-trips")
  .get(authMiddleware, userController.allUserTrips);
router.route("/user/me").get(authMiddleware, userController.getUserInfo);
// router.route('/my-bookmark').get(authController.protect, userController.getUserBookmark);
// router.route('/add-to-bookmark').post(authController.protect, userController.addToBookmark);
// router.route('/remove-bookmark').delete(authController.protect, userController.removeBookmark);
// router.route('/delete-trip/:id').delete(authController.protect, userController.deleteTrip);
// router.route('/update-is-favourite/:id').put(authController.protect, userController.updateFav);

export default router;
