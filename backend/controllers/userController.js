import express from "express";
import User from "../models/User.js";
import mongoose from "mongoose";
import TripModel from "../models/Trips.js";
import { clerkClient } from "@clerk/express";

const getAllUsers = async (req, res, next) => {
  try {
    const users = await userSchema.find({});
    res.status(200).json({
      status: "success",
      data: users,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ status: "error", message: error.message });
  }
};

const getUserMongoId = async (identifier, email) => {
  // If identifier looks like a Mongo ObjectId, try by _id first
  if (identifier && mongoose.Types.ObjectId.isValid(identifier)) {
    try {
      const byId = await User.findById(identifier);
      if (byId) return byId._id;
    } catch (err) {
      // ignore
    }
  }

  // Try lookup by clerkUserId
  if (identifier) {
    const byClerk = await User.findOne({ clerkUserId: identifier });
    if (byClerk) return byClerk._id;
  }

  // Fallback: try email
  if (email) {
    const byEmail = await User.findOne({ email: String(email).toLowerCase() });
    if (byEmail) return byEmail._id;
  }

  throw new Error("User not found");
};

const respondToInvite = async (req, res, next) => {
  try {
    const clerkUserId = req.auth?.userId;
    const userId = await getUserMongoId(clerkUserId, req.user?.email);
    const { tripId } = req.params;
    const { status } = req.body; // expected: 'accepted' or 'rejected'

    if (!tripId || !status) {
      return res.status(400).json({
        message: "Trip ID and status are required.",
      });
    }

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be either 'accepted' or 'rejected'.",
      });
    }

    const trip = await TripModel.findById(tripId);
    if (!trip) {
      return res.status(404).json({
        message: "Trip not found.",
      });
    }

    const invitationIndex = trip.pendingInvites.findIndex(
      (inv) => inv.user.toString() === userId.toString(),
    );

    if (invitationIndex === -1) {
      return res.status(403).json({
        message: "You have not been invited to this trip.",
      });
    }

    const alreadyCollaborator = trip.collaborators.includes(userId);
    if (alreadyCollaborator && status === "accepted") {
      return res.status(400).json({
        message: "You are already a collaborator.",
      });
    }

    // Update invitation status
    trip.pendingInvites[invitationIndex].status = status;

    if (status === "accepted") {
      trip.collaborators.push(userId);
    }

    await trip.save();
    const user = await User.findOne({ _id: userId });
    user.tripsJoined.push(tripId);
    await user.save();

    // Update related notification

    // Optional real-time event
    // io.to(trip.owner.toString()).emit("trip:inviteResponse", { userId, tripId, status });

    return res.status(200).json({
      message: `You have successfully ${status} the invitation.`,
      tripId: trip._id,
    });
  } catch (error) {
    console.error("respondToInvite error:", error);
    return res.status(500).json({
      message: "Something went wrong.",
      error: error.message,
    });
  }
};

const upComingTrips = async (req, res, next) => {
  try {
    await TripModel.updateMany(
      { "itinerary.is_deleted": { $exists: false } },
      { $set: { "itinerary.$[].is_deleted": false } },
    );
    const clerkUserId = req.auth?.userId;
    const userId = await getUserMongoId(clerkUserId, req.user?.email);
    const upComingTrips = await TripModel.find({
      $and: [
        {
          $or: [{ owner: userId }, { collaborators: userId }],
        },
        {
          startDate: { $gte: new Date() },
        },
      ],
    }).populate("collaborators", "name email");

    if (!upComingTrips) {
      return res.status(400).json({
        message: "No upcoming trips found!",
      });
    }
    res.status(200).json({
      status: "success",
      results: upComingTrips.length,
      data: {
        upComingTrips,
      },
    });
  } catch (error) {
    console.error("upcoming error:", error);
    return res.status(500).json({
      message: "Something went wrong.",
      error: error.message,
    });
  }
};

const ongoingTrips = async (req, res, next) => {
  try {
    const clerkUserId = req.auth?.userId;
    const userId = await getUserMongoId(clerkUserId, req.user?.email);
    const trips = await TripModel.find({
      $and: [
        { $or: [{ owner: userId }, { collaborators: userId }] },
        { startDate: { $lte: new Date() } },
        { endDate: { $gt: new Date() } },
      ],
    }).populate("collaborators", "name email");

    if (!trips.length) {
      return res.json({
        message: "No Ongoing Trips!",
      });
    }

    res.status(200).json({
      status: "success",
      results: trips.length,
      data: {
        trips,
      },
    });
  } catch (error) {
    console.error("ongoing trips error:", error);
    return res.status(500).json({
      message: "Something went wrong.",
      error: error.message,
    });
  }
};

const upComingTripsDashboard = async (req, res, next) => {
  try {
    const clerkUserId = req.auth?.userId;
    const userId = await getUserMongoId(clerkUserId, req.user?.email);
    const upComingTrips = await TripModel.find({
      $and: [
        {
          $or: [{ owner: userId }, { collaborators: userId }],
        },
        {
          startDate: { $gte: new Date() },
        },
      ],
    })
      .populate("collaborators", "name email")
      .sort({ startDate: 1 })
      .limit(3);

    if (!upComingTrips) {
      return res.status(400).json({
        message: "No upcoming trips found!",
      });
    }
    res.status(200).json({
      status: "success",
      results: upComingTrips.length,
      data: {
        upComingTrips,
      },
    });
  } catch (error) {
    console.error("upcoming error:", error);
    return res.status(500).json({
      message: "Something went wrong.",
      error: error.message,
    });
  }
};

const completedTrips = async (req, res, next) => {
  try {
    const clerkUserId = req.auth?.userId;
    const userId = await getUserMongoId(clerkUserId, req.user?.email);
    const completedTrips = await TripModel.find({
      $and: [
        {
          $or: [{ owner: userId }, { collaborators: userId }],
        },
        {
          endDate: { $lte: new Date() },
        },
      ],
    }).populate("collaborators", "name email");

    if (!completedTrips) {
      return res.status(400).json({
        message: "No upcoming trips found!",
      });
    }
    res.status(200).json({
      status: "success",
      results: completedTrips.length,
      data: {
        completedTrips,
      },
    });
  } catch (error) {
    console.error("completetd error:", error);
    return res.status(500).json({
      message: "Something went wrong.",
      error: error.message,
    });
  }
};

const completedTripsDashboard = async (req, res, next) => {
  try {
    const clerkUserId = req.auth?.userId;
    const userId = await getUserMongoId(clerkUserId, req.user?.email);
    const completedTrips = await TripModel.find({
      $and: [
        {
          $or: [{ owner: userId }, { collaborators: userId }],
        },
        {
          endDate: { $lte: new Date() },
        },
      ],
    })
      .sort({ endDate: -1 })
      .limit(3);

    if (!completedTrips) {
      return res.status(400).json({
        message: "No upcoming trips found!",
      });
    }
    res.status(200).json({
      status: "success",
      results: completedTrips.length,
      data: {
        completedTrips,
      },
    });
  } catch (error) {
    console.error("completetd error:", error);
    return res.status(500).json({
      message: "Something went wrong.",
      error: error.message,
    });
  }
};

const allUserTrips = async (req, res, next) => {
  try {
    const clerkUserId = req.auth?.userId;
    const userId = await getUserMongoId(clerkUserId, req.user?.email);
    const allTrips = await TripModel.find({
      $or: [{ owner: userId }, { collaborators: userId }],
    });

    if (!allTrips || allTrips.length === 0) {
      return res.status(400).json({
        message: "No upcoming trips found!",
      });
    }

    res.status(200).json({
      status: "success",
      results: allTrips.length,
      data: {
        allTrips,
      },
    });
  } catch (error) {
    console.error("error fetching All Trips:", error);
    return res.status(500).json({
      message: "Something went wrong.",
      error: error.message,
    });
  }
};

export const getUserInfo = async (req, res, next) => {
  try {
    const authUserId = req.auth?.userId;

    if (!authUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Try to find by clerkUserId first, then fallback to _id (used by our backend token)
    let user = await User.findOne({ clerkUserId: authUserId });

    if (!user) {
      // If the authUserId is actually a MongoDB _id, try that
      try {
        user = await User.findById(authUserId);
      } catch (err) {
        user = null;
      }
    }

    // If still not found, assume this is a Clerk ID and attempt to reconcile via Clerk
    if (!user) {
      const clerkUser = await clerkClient.users.getUser(authUserId);
      const primaryEmail = clerkUser.emailAddresses.find(
        (email) => email.id === clerkUser.primaryEmailAddressId,
      )?.emailAddress;

      const email = primaryEmail || `clerk-${authUserId}@example.com`;
      const name =
        clerkUser.fullName ||
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
        clerkUser.username ||
        "User";

      // Reconcile existing account by email (e.g., user signed up via email/password earlier)
      const existingByEmail = await User.findOne({ email });
      if (existingByEmail) {
        existingByEmail.clerkUserId = authUserId;
        await existingByEmail.save();
        user = existingByEmail;
      } else {
        try {
          user = await User.create({
            name,
            email,
            clerkUserId: authUserId,
            avatarUrl: clerkUser.imageUrl || "",
          });
        } catch (err) {
          if (err && err.code === 11000) {
            // Race condition: another process inserted this email concurrently
            const found = await User.findOne({ email });
            if (found) {
              found.clerkUserId = authUserId;
              await found.save();
              user = found;
            } else {
              throw err;
            }
          } else {
            throw err;
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "User info fetched successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        clerkUserId: user.clerkUserId,
      },
    });
  } catch (error) {
    next(error);
  }
};

const userController = {
  getAllUsers,
  respondToInvite,
  upComingTrips,
  completedTrips,
  getUserInfo,
  allUserTrips,
  upComingTripsDashboard,
  completedTripsDashboard,
  ongoingTrips,
};

export default userController;

/* exports.getUserTrips = async (req, res, next) => {
  try {
    const userTrip = await TripModel.find({ userId: req.user.userId });

    if (!userTrip) {
      return res.status(200).json({
        message: "You have no tales",
      });
    }

    res.status(200).json({
      status: "success",
      data: userTrip,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.addToBookmark = async (req, res, next) => {
  try {
    const { tripId } = req.body;

    if (!tripId) {
      return res.status(400).json({ message: "tripId is required." });
    }

    const user = await userSchema.findOne({ _id: req.user.userId });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.bookmark.includes(tripId)) {
      return res.status(200).json({ message: "Trip already bookmarked." });
    }

    user.bookmark.push(tripId);
    await user.save();

    res.status(200).json({
      message: "Trip added to bookmarks successfully.",
      bookmark: user.bookmark,
    });
  } catch (error) {
    console.error("Error adding to bookmark:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.removeBookmark = async (req, res, next) => {
  try {
    const { tripId } = req.body;

    if (!tripId) {
      return res.status(400).json({ message: "tripId is required." });
    }

    const user = await userSchema.findOne({ _id: req.user.userId });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Ensure user.bookmark is an array
    if (!Array.isArray(user.bookmark)) {
      user.bookmark = [];
    }

    // Check if tripId exists in bookmark
    const tripIdStr = tripId.toString();
    const isBookmarked = user.bookmark.some(
      (id) => id.toString() === tripIdStr
    );

    if (!isBookmarked) {
      return res.status(200).json({ message: "Trip is not bookmarked." });
    }

    // Remove the tripId from bookmarks
    user.bookmark = user.bookmark.filter((id) => id.toString() !== tripIdStr);

    await user.save();

    res.status(200).json({
      status: "success",
      message: "Bookmark removed successfully.",
      data: user.bookmark,
    });
  } catch (error) {
    console.error("Error removing bookmark:", error);
    res.status(500).json({
      status: "error",
      message: "Something went wrong.",
      error: error.message,
    });
  }
};

exports.getUserBookmark = async (req, res, next) => {
  try {
    const user = await userSchema.findOne({ _id: req.user.userId });
    const bookmarks = user.bookmark;
    console.log(bookmarks);

    if (!bookmarks) {
      return res.status(200).json({
        message: "You have no bookmarks",
      });
    }
    res.status(200).json({
      status: "success",
      data: bookmarks,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.deleteTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    if (!id) {
      return res.status(400).json({ message: "TripId is required" });
    }

    const trip = await TripModel.findOneAndDelete({ _id: id, userId });

    if (!trip) {
      return res
        .status(404)
        .json({ message: "Trip not found or not authorized" });
    }

    res.status(200).json({
      status: "success",
      message: "Trip deleted successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ status: "error", message: error.message });
  }
};
 */
