import express from "express";
import TripModel from "../models/Trips.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import InvitationModel from "../models/Invitation.js";
import { sendInvitationEmail } from "./invitationController.js";
import { randomBytes } from "crypto";
import AppError from "../utils/AppError.js";
// get all the stories

const getAllUserTrips = async (req, res, next) => {
  try {
    const { userId } = req.user;

    if(!userId) {
      throw new AppError("User ID is required in the request", 400);
    }

    const trips = await TripModel.find({
      $or: [{ owner: userId }, { collaborators: userId }],
    }).sort({ createdAt: -1 });

    if (trips.length === 0) {
      throw new AppError("No trips found for this user", 404);
    }
    res.status(200).json({
      success: true,
      results: trips.length,
      data: trips,
    });
  } catch (error) {
    console.error(error.message);
    next(error);
  }
};

const createTrip = async (req, res, next) => {
  try {
    const { title, description, startDate, endDate, destination } = req.validatedData;
    const { userId: ownerId } = req.user || {};
    
    if (!ownerId) {
      throw new AppError("User not authenticated", 401);
    }

    const user = await User.findById(ownerId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Create trip
    const trip = await TripModel.create({
      title,
      description,
      startDate,
      endDate,
      destination,
      owner: ownerId,
    });

    // Update user's tripsOwned
    user.tripsOwned.push(trip._id);
    await user.save();

    return res.status(201).json({
      success: true,
      data: trip,
    });

  } catch (error) {
    console.error("Error creating trip:", error);
    next(error);
  }
};

const getTrip = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    if (!tripId) {
      throw new AppError("Trip ID is required", 400);
    }

    const trip = await TripModel.findById({ _id: tripId });
    res.status(200).json({
      success: true,
      data: trip,
    });
  } catch (error) {
    console.error(error.message);
    next(error);
  }
};

const deleteTrip = async (req, res, next) => {
  try {
    const { tripId } = req.params;

    if(!tripId){
      throw new AppError("Trip ID is required", 400);
    }

    const trip = await TripModel.findByIdAndDelete({ _id: tripId });
    if (!trip) {
      throw new AppError("Trip not found", 404);
    }
    res.status(200).json({
      success: true,
      message: "Trip deleted successfully",
    });
  } catch (error) {
    console.error(error.message);
    next(error);
  }
};

const getTripCollaborators = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { userId } = req.user;

    if (!tripId) {
      throw new AppError("Trip ID is required", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      throw new AppError("Invalid Trip ID", 400);
    }
    // Find the trip and verify access
    const trip = await TripModel.findOne({
      _id: tripId,
      $or: [{ owner: userId }, { collaborators: userId }],
    }).populate({
      path: "collaborators",
      select: "name email", // Fetch only name and email
    });

    if (!trip) {
      throw new AppError("Trip not found or access denied", 404);
    }

    // Return collaborator details
    return res.status(200).json({
      success: true,
      results: trip.collaborators.length,
      collaborators: trip.collaborators, 
    });

  } catch (error) {
    console.error("Error fetching collaborators:", error);
    next(error);
  }
};

const addCollaborators = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { userId } = req.user;
    const { collaborators } = req.body;

    if (!tripId) {
      throw new AppError("Trip ID is required", 400);
    }

    if (!Array.isArray(collaborators)) {
      return res
        .status(400)
        .json({ message: "Collaborators must be an array" });
    }

    const trip = await TripModel.findOne({ _id: tripId, owner: userId });
    if (!trip) {
      return res
        .status(404)
        .json({ message: "Trip not found or not owned by you" });
    }

    for (const collab of collaborators) {
      const idToAdd = collab.userId;

      // Skip if already added or equals owner
      if (!trip.collaborators.includes(idToAdd) && idToAdd !== String(userId)) {
        trip.collaborators.push(idToAdd);
      }
    }

    await trip.save();

    res.status(200).json({
      status: "success",
      message: "Collaborators added",
      collaborators: trip.collaborators,
    });
  } catch (error) {
    console.error("Add Collaborators Error:", error.message);
    res.status(500).json({ status: "error", message: error.message });
  }
};

const deleteCollaborators = async (req, res, next) => {
  try {

    const { tripId, collaboratorId } = req.params;
    const { userId: ownerId } = req.user;

    if (!tripId || !collaboratorId) {
      throw new AppError("TripId and CollboratorsId required", 400);
    }

    const trip = await TripModel.findOne({ _id: tripId, owner: ownerId });

    if (!trip) {
      throw new AppError("Trip not found or not owned by you", 404);
    }

    // Check if the collaborator exists in the list
    const index = trip.collaborators.indexOf(collaboratorId);
    if (index === -1) {
      throw new AppError("Collaborator not found in this trip", 404);
    }

    // Remove collaborator
    trip.collaborators.splice(index, 1);
    await trip.save();

    res.status(200).json({
      success: true,
      message: "Collaborator removed successfully",
      collaborators: trip.collaborators,
    });
  } catch (error) {
    console.error("Remove Collaborator Error:", error.message);
    next(error);
  }
};

const getTripItinerary = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { userId } = req.user;

    if (!tripId) {
      throw new AppError("Trip ID is required", 400);
    }

    const trip = await TripModel.findOne({
      _id: tripId,
      $or: [{ owner: userId }, { collaborators: userId }],
    });

    if (!trip) {
      throw new AppError("Trip not found or access denied", 404);
    }

    const activeItinerary = trip.itinerary.filter(day => day.is_deleted !== true);

    if (activeItinerary.length > 0) {
      res.status(200).json({
        success: true,
        results: activeItinerary.length,
        data: activeItinerary,
      });
    } else {
      throw new AppError("No itinerary found for this trip", 404);
    }
  } catch (error) {
    console.error("Getting itinerary Error:", error.message);
    next(error);
  }
};

const addItinerary = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { userId } = req.user;
    const { date } = req.body;

    if (!date) {
      throw new AppError("Date is required to add itinerary", 400);
    }else if(isNaN(Date.parse(date))) {
      throw new AppError("Invalid date format", 400);
    }
    if(!tripId){
      throw new AppError("Trip ID is required", 400);
    }

    const trip = await TripModel.findOne({
      _id: tripId,
      $or: [{ owner: userId }, { collaborators: userId }],
    });

    if (!trip) {
      throw new AppError("Trip not found or access denied", 404);
    }

    const startDate = trip.startDate;
    const endDate = trip.endDate;

    if (new Date(date) < new Date(startDate) || new Date(date) > new Date(endDate)) {
      throw new AppError("Itinerary date must be within trip start and end dates", 400);
    }

    // Check if itinerary for the date already exists
    const existingDay = trip.itinerary.find((item) => item.date === date);

    if (existingDay) {
      throw new AppError("Itinerary for this date already exists", 400);
    }

    // Create a new itinerary day with empty activities
    trip.itinerary.push({
      date,
      activities: [],
    });

    await trip.save();

    res.status(201).json({
      success: true,
      message: "New itinerary day created",
      itinerary: trip.itinerary,
    });
  } catch (error) {
    console.error("Add Itinerary Error:", error.message);
    next(error);
  }
};

const editItinerary = async (req, res, next) => {
  try {
    const { tripId, itineraryId } = req.params;
    const { userId } = req.user;
    const { date, activities } = req.body;

    if (!tripId || !itineraryId) {
      throw new AppError("Trip ID and Itinerary ID are required", 400);
    }

    if (activities && !Array.isArray(activities)) {
      return res.status(400).json({
        message: "Activities should be an array if provided",
      });
    }

    const trip = await TripModel.findOne({
      _id: tripId,
      $or: [{ owner: userId }, { collaborators: userId }],
    });

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found or access denied",
      });
    }

    // Find the itinerary item by its _id
    const itinerary = trip.itinerary.id(itineraryId);

    if (!itinerary) {
      return res.status(404).json({
        message: "Itinerary entry not found",
      });
    }

    // Update fields only if provided
    if (date !== undefined) itinerary.date = date;
    if (activities !== undefined) itinerary.activities = activities;

    await trip.save();

    return res.status(200).json({
      message: "Itinerary updated successfully",
      updatedItinerary: itinerary,
    });
  } catch (error) {
    console.error("Edit Itinerary Error:", error);
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

const deleteItinerary = async (req, res, next) => {
  try {
    const { tripId, itineraryId } = req.params;
    const { userId } = req.user;

    if (!tripId || !itineraryId) {
      throw new AppError("Trip ID and Itinerary ID are required", 400);
    }

    const trip = await TripModel.findOne({
      _id: tripId,
      $or: [{ owner: userId }, { collaborators: userId }],
    });

    if (!trip) {
      throw new AppError("Trip not found or access denied", 404);
    }

    const result = await TripModel.updateOne(
      {
        _id: tripId,
        "itinerary._id": itineraryId,
      },
      {
        $set: {
          "itinerary.$.is_deleted": true,
        },
      }
    );

    if (result.matchedCount === 0) {
      throw new AppError("Itinerary not found", 404);
    }

    return res.status(200).json({
      success: true,
      message: "Itinerary day deleted successfully",
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};


const getItineraryActivity = async (req, res, next) => {
  try {
    const { tripId, itineraryId, activityId } = req.params;
    const { userId } = req.user;

    // Validate params
    if (!tripId || !itineraryId || !activityId) {
      throw new AppError("Trip ID, Itinerary ID, and Activity ID are required", 400);
    }

    // Find the trip for this user or collaborator
    const trip = await TripModel.findOne({
      _id: tripId,
      $or: [{ owner: userId }, { collaborators: userId }],
    });

    if (!trip) {
      throw new AppError("Trip not found or access denied", 404);
    }

    // Find the itinerary

    const itinerary = trip.itinerary.find(
      (i) => i._id.toString() === itineraryId
    );
    if (!itinerary) {
      throw new AppError("Itinerary not found", 404);
    }
    // Find the activity

    const activity = itinerary.activities.find(
      (a) => String(a.activityId).trim() === String(activityId).trim()
    );
    if (!activity) {
     throw new AppError("Activity not found", 404);
    }

    // Return the activity
    return res.status(200).json({
      success: true,
      message: "Activity fetched successfully",
      activity,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const addItineraryActivity = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { tripId, itineraryId } = req.params;
    const { time, title, location, notes } = req.validatedData;
    console.log(tripId, itineraryId, userId);
    // Validate inputs
    if (!tripId || !itineraryId) {
      throw new AppError("Trip ID and Itinerary ID are required", 400);
    }
    
    // Find the trip and ensure the user or collaborator has access
    const trip = await TripModel.findOne({ _id: tripId, $or: [{ owner: userId }, { collaborators: userId }] });
    if (!trip) {
      throw new AppError("Trip not found or access denied", 404);
    }

    // Find the itinerary within the trip
    const itinerary = trip.itinerary.find(
      (i) => i._id.toString() === itineraryId
    );
    if (!itinerary) {
      throw new AppError("Itinerary not found", 404);
    }

    // Create new activity object
    const newActivity = {
      time,
      title,
      location: location || "",
      notes: notes || "",
    };

    // Push new activity into itinerary
    itinerary.activities.push(newActivity);

    // Save trip
    await trip.save();

    return res.status(201).json({
      success: true,
      message: "Activity added successfully",
      activity: newActivity,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const editItineraryActivity = async (req, res, next) => {
  try {
    const { tripId, itineraryId, activityId } = req.params;
    const { userId } = req.user;
    const { time, title, location, notes } = req.body;

    if (!tripId || !itineraryId || !activityId) {
      throw new AppError("Trip ID, Itinerary ID, and Activity ID are required", 400);
    }

    const trip = await TripModel.findOne({
      _id: tripId,
      $or: [{ owner: userId }, { collaborators: userId }],
    });

    if (!trip) {
      throw new AppError("Trip not found or access denied", 404);
    }

    // Find the specific itinerary day
    const itinerary = trip.itinerary.id(itineraryId);
    if (!itinerary) {
      throw new AppError("Itinerary day not found", 404);
    }

    // Find the specific activity by its _id
    const activity = itinerary.activities.find(
      (a) => String(a.activityId).trim() === String(activityId).trim()
    );
    if (!activity) {
      throw new AppError("Activity not found", 404);
    }

    if (time !== undefined) activity.time = time;
    if (title !== undefined) activity.title = title;
    if (location !== undefined) activity.location = location;
    if (notes !== undefined) activity.notes = notes;

    await trip.save();

    return res.status(200).json({
      success: true,
      message: "Activity updated successfully",
      updatedActivity: activity,
    });
  } catch (error) {
    console.error("Edit Activity Error:", error);
    next(error);
  }
};

const deleteItineraryActivity = async (req, res, next) => {
  try {
    const { tripId, itineraryId, activityId } = req.params;
    const { userId } = req.user;

    if (!tripId || !itineraryId || !activityId) {
      throw new AppError("Trip ID, Itinerary ID, and Activity ID are required", 400);
    }

    const trip = await TripModel.findOne({
      _id: tripId,
      $or: [{ owner: userId }, { collaborators: userId }],
    });

    if (!trip) {
      throw new AppError("Trip not found or access denied", 404);
    }

    // Find the specific itinerary day
    const itinerary = trip.itinerary.id(itineraryId);
    if (!itinerary) {
      throw new AppError("Itinerary day not found", 404);
    }

    const activity = itinerary.activities.find(
      (a) => String(a.activityId).trim() === String(activityId).trim()
    );
    if (!activity) {
      throw new AppError("Activity not found", 404);
    }

    activity.deleteOne();

    await trip.save();

    return res.status(200).json({
      success: true,
      message: "Activity deleted successfully",
      itinerary,
    });
  } catch (error) {
    console.error("Error deleting itinerary activity:", error);
    next(error);
  }
};

const getTripTasks = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { userId } = req.user;

    if (!tripId) {
      throw new AppError("Trip ID is required", 400);
    }

    const trip = await TripModel.findOne({
      _id: tripId,
      $or: [{ owner: userId }, { collaborators: userId }],
    }).populate('tasks.assignedTo', 'name');

    if (!trip) {
      throw new AppError("Trip not found or access denied", 404);
    }

    if (trip.tasks.length > 0) {
      res.status(200).json({
        success: true,
        results: trip.tasks.length,
        data: trip.tasks,
      });
    } else {
      res.status(200).json({
        success: true,  
        message: "No tasks found for this trip",
      })
    }
  } catch (error) {
    console.error("Getting Task Error:", error.message);
    next(error);
  }
};

const addTask = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { userId } = req.user;
    const { text, assignedTo, completed } = req.validatedData;


    const trip = await TripModel.findOne({
      _id: tripId,
      $or: [{ owner: userId }, { collaborators: userId }],
    });

    if (!trip) {
      throw new AppError("Trip not found or access denied", 404);
    }

    const newTask = {
      taskId: new mongoose.Types.ObjectId().toString(),
      text: text || "",
      assignedTo: new mongoose.Types.ObjectId(assignedTo),
      completed,
    };

    trip.tasks.push(newTask);
    await trip.save();

    res.status(201).json({
      success: true,
      message: "Task added",
      task: newTask,
    });
  } catch (error) {
    console.error("Adding Task Error:", error.message);
    next(error);
  }
};

const editTask = async (req, res, next) => {
  try {
    const { tripId, taskId } = req.params;
    const { userId } = req.user;
    const { text, assignedTo, completed } = req.body;

    const trip = await TripModel.findOne({
      _id: tripId,
      $or: [{ owner: userId }, { collaborators: userId }],
    });

    if (!trip) {
      throw new AppError("Trip not found or access denied", 404);
    }

    const task = trip.tasks.find((t) => t.taskId === taskId);
    if (!task) {
      throw new AppError("Task not found", 404);
    }

    // Update allowed fields
    if (text !== undefined) task.text = text;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (completed !== undefined) task.completed = completed;

    await trip.save();

    res.status(200).json({
      success: true,
      message: "Task updated",
      task,
    });
  } catch (error) {
    console.error("Edit Task Error:", error.message);
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const { tripId, taskId } = req.params;
    const { userId } = req.user;
    if(!tripId || !taskId) {
      throw new AppError("Trip ID and Task ID are required", 400);
    }

    const trip = await TripModel.findOne({
      _id: tripId,
      $or: [{ owner: userId }, { collaborators: userId }],
    });

    if (!trip) {
      throw new AppError("Trip not found or access denied", 404);
    }

    const initialLength = trip.tasks.length;
    trip.tasks = trip.tasks.filter((t) => t.taskId !== taskId);

    if (trip.tasks.length === initialLength) {
      throw new AppError("Task not found", 404);
    }

    await trip.save();

    res.status(200).json({
      success: true,
      message: "Task deleted",
    });
  } catch (error) {
    console.error("Delete Task Error:", error.message);
    next(error);
  }
};

const getTripExpenses = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { userId } = req.user;

    if (!tripId) {
      throw new AppError("Trip ID is required", 400);
    }

    const trip = await TripModel.findOne({
      _id: tripId,
      $or: [{ owner: userId }, { collaborators: userId }],
    }).populate([
      {
        path: "expenses.spentBy",
        model: "User",
        select: "name email",
      },
      {
        path: "expenses.sharedWith",
        model: "User",
        select: "name email",
      },
    ]);

    if (!trip) {
      throw new AppError("Trip not found or access denied", 404);
    }

    if (trip.expenses.length > 0) {
      return res.status(200).json({
        sucess: true,
        results: trip.expenses.length,
        data: trip.expenses,
      });
    } else {
      return res.status(200).json({
        sucess: true,
        message: "No expenses added for this trip.",
      });
    }
  } catch (error) {
    console.error("Get Expense Error:", error.message);
    next(error);
  }
};

const addExpenses = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { userId } = req.user;
    const { amount, category, spentBy, sharedWith, note, date } = req.validatedData;

    if (!tripId) {
      throw new AppError("Trip ID is required", 400);
    }

    const trip = await TripModel.findOne({
      _id: tripId,
      $or: [{ owner: userId }, { collaborators: userId }],
    });

    if (!trip) {
      throw new AppError("Trip not found or access denied", 404);
    }

    const startDate = trip.startDate;
    const endDate = trip.endDate;

    if (new Date(date) < new Date(startDate) || new Date(date) > new Date(endDate)) {
      throw new AppError("Expense date must be within trip start and end dates", 400);
    }

    const newExpense = {
      amount: amount,
      category: category,
      spentBy: spentBy,
      sharedWith: sharedWith || null,
      note: note,
      date: date,
    };

    trip.expenses.push(newExpense);
    await trip.save();

    res.status(200).json({
      success: true,
      message: "Expense added successfully.",
      data: newExpense,
    });
  } catch (error) {
    console.error("Add Expense Error:", error.message);
    next(error);
  }
};

const editExpenses = async (req, res, next) => {
  try {
    const { tripId, expenseId } = req.params;
    const { userId } = req.user;
    const { amount, category, spentBy, sharedWith, note, date } = req.body;

    if (!tripId || !expenseId) {
      throw new AppError("Trip ID and Expense ID are required", 400);
    }

    const trip = await TripModel.findOne({ _id: tripId, owner: userId });

    if (!trip) {
      throw new AppError("Trip not found or access denied", 404);
    }

    const startDate = trip.startDate;
    const endDate = trip.endDate; 
    if (date && (new Date(date) < new Date(startDate) || new Date(date) > new Date(endDate))) {
      throw new AppError("Expense date must be within trip start and end dates", 400);
    }

    const expense = trip.expenses.find((e) => e._id.toString() === expenseId);

    if (!expense) {
      throw new AppError("Expense not found", 404);
    }

    // Update fields if provided
    if (amount !== undefined) expense.amount = amount;
    if (category !== undefined) expense.category = category;
    if (spentBy !== undefined) expense.spentBy = spentBy;
    if (sharedWith !== undefined) expense.sharedWith = sharedWith;
    if (note !== undefined) expense.note = note;
    if (date !== undefined) expense.date = date;

    await trip.save();

    return res.status(200).json({
      success: true,
      message: "Expense updated successfully.",
      updatedExpense: expense,
    });
  } catch (error) {
    console.error("Edit expense error:", error);
    next(error);
  }
};

const inviteCollaborator = async (req, res) => {
  try {
    const { userId } = req.user;
    const { tripId } = req.params;
    const { email } = req.body;

    if (!tripId || !email) {
      throw new AppError("Trip ID and email are required", 400);
    }

    const trip = await TripModel.findById(tripId);
    if (!trip) {
      throw new AppError("Trip not found", 404);
    }

    if (trip.owner.toString() !== userId.toString()) {
      throw new AppError("Only the trip owner can invite collaborators", 403);
    }

    const user = await User.findOne({ email });
    const inviter = await User.findOne({_id: userId})
    const isUserAccExist = !!user;

    if (user) {
      const isAlreadyCollaborator = trip.collaborators.some(
        (c) => c.toString() === user._id.toString()
      );

      if (isAlreadyCollaborator) {
        throw new AppError("User is already a collaborator", 400);
      }
    }

    const existingInvite = await InvitationModel.findOne({
      tripId,
      email,
      status: "PENDING"
    });

    if (existingInvite) {
      throw new AppError("An invitation has already been sent to this email for this trip", 400);
    }

    // Generate secure token
    const token = randomBytes(32).toString("hex");

    const invitation = await InvitationModel.create({
      invitedBy: userId,
      tripId,
      email,
      token,
      status: "PENDING",
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48h
      acceptedAt: null
    });

    // Send email (non-blocking)
    await sendInvitationEmail({
      email,
      token,
      tripName: trip.title,
      inviterName: inviter.name,
      expiresAt: invitation.expiresAt
    }).catch(console.error);

    return res.status(200).json({
      success: true,
      message: "Invitation sent successfully.",
      isUserAccExist,
      invitation,
    });

  } catch (error) {
    console.error("inviteCollaborator error:", error);
    next(error);
  }
};

const acceptInvitation = async (inviteToken) => {

  console.log(inviteToken);
  const invitation = await InvitationModel.findOne({
    token:inviteToken,
    status: "PENDING"
  });
  console.log(invitation);
  if (!invitation) {
    throw new AppError("Invalid or expired invitation token", 400);
  }

  if (invitation.expiresAt < new Date()) {
    throw new AppError("Invitation token has expired", 400);
  }

  const user = await User.findOne({ email: invitation.email });
  if (!user) {
    throw new AppError("User account not found", 404);
  }

  const trip = await TripModel.findById(invitation.tripId);
  if (!trip) {
    throw new AppError("Trip not found", 404);
  }

  const alreadyCollaborator = trip.collaborators.some(
    (c) => c.toString() === user._id.toString()
  );

  if (alreadyCollaborator) {
    throw new AppError("User already a collaborator", 400);
  }

  trip.collaborators.push(user._id);

  await trip.save();

  invitation.status = "ACCEPTED";
  invitation.acceptedAt = new Date();
  await invitation.save();
} 


const getTripStory = async(req, res, next) => {
  try {
    const {userId} = req.user;
    const {tripId} = req.params;

    if(!tripId){
      return res.status(400).json({
        message: "TripId and storyId required!"
      })
    }

    const trip = await TripModel.findOne({
      _id: tripId,
      $or: [
        { owner: userId },
        { collaborators:userId },
      ],
    });
    if(!trip){
      return res.status(400).json({
        message: "Trip not found or access denied"
      })
    }
    console.log(trip.story);
    res.status(200).json({
      status: "success",
      data: trip.story.visitedLocations
    })

  } catch (error) {
    console.error("Get Story error:", error);
    return res.status(500).json({
      message: "Something went wrong.",
      error: error.message,
    });
  }
}



const tripController = {
  getAllUserTrips,
  createTrip,
  getTrip,
  deleteTrip,
  getTripCollaborators,
  addCollaborators,
  deleteCollaborators,
  getTripItinerary,
  addItinerary,
  editItinerary,
  deleteItinerary,
  getItineraryActivity,
  addItineraryActivity,
  editItineraryActivity,
  deleteItineraryActivity,
  getTripTasks,
  addTask,
  editTask,
  deleteTask,
  getTripExpenses,
  addExpenses,
  editExpenses,
  inviteCollaborator,
  getTripStory,
  acceptInvitation
};

export default tripController;
