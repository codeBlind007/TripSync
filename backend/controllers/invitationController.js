import dotenv from "dotenv";
dotenv.config();
import { mailer } from "../utils/mailer.js";
import InvitationModel from "../models/Invitation.js";
import User from "../models/User.js";
import TripModel from "../models/Trips.js";
import { inviteEmailTemplate } from "../utils/inviteEmailTemplate.js";
import AppError from "../utils/AppError.js";

export const sendInvitationEmail = async ({
  email,
  token,
  tripName,
  inviterName,
  expiresAt,
}) => {
  const isProduction = process.env.NODE_ENV === "production";
  const appUrl = isProduction
    ? process.env.DEPLOYED_FRONTEND_URL
    : process.env.FRONTEND_URL;
  const inviteLink = `${appUrl}/invite/accept?token=${token}`;

  const html = inviteEmailTemplate({
    appLink: process.env.appUrl,
    inviterName,
    tripName,
    inviteLink,
    expiryTime: expiresAt.toLocaleString(),
  });

  await mailer.sendMail({
    from: `"TripSync" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `You're invited to join "${tripName}" on TripSync`,
    html,
  });
};

export const validateInvitationRequest = async (req, res, next) => {
  try {
    const { token } = req.query;

    if (!token) {
      throw new AppError("Invitation token is required", 400);
    }

    const invitation = await InvitationModel.findOne({
      token,
      status: "PENDING",
    });

    if (!invitation) {
      throw new AppError("Invalid or already used invitation token", 400);
    }

    if (invitation.expiresAt < new Date()) {
      throw new AppError("Invitation token has expired", 400);
    }

    const user = await User.findOne({ email: invitation.email });
    console.log(!!req.user);
    return res.status(200).json({
      success: true,
      valid: true,
      email: invitation.email,
      accountExists: !!user,
      isAuthenticated: !!req.user,
      tripId: invitation.tripId,
    });
  } catch (error) {
    console.error("validateInvitationRequest error:", error);
    next(error);
  }
};

export const getRecievedInvitation = async (req, res, next) => {
  try {
    const { userId } = req.user;

    if (!userId) {
      throw new AppError("User is not authenticated", 401);
    }

    const user = await User.findOne({ _id: userId });

    const invitation = await InvitationModel.find({
      email: user.email,
      status: "PENDING",
    }).populate({
      path: "invitedBy",
      select: "name email",
    });

    return res.status(200).json({
      success: true,
      invitation,
    });
  } catch (error) {
    console.error("getRecievedInvitation error:", error);
    next(error);
  }
};

export const getSentInvitation = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { tripId } = req.params;
   
    if (!userId) {
      throw new AppError("User is not authenticated", 401);
    }
    if (!tripId) {
      throw new AppError("tripId is required", 400);
    }

    const invitation = await InvitationModel.find({
      tripId: tripId,
      status: "PENDING",
    }).populate({
      path: "invitedBy",
      select: "name email",
    });

    if (invitation.length === 0) {
      return res.status(200).json({
        message: "No sent invitations found",
      });
    }

    return res.status(200).json({
      success: true,
      invitation,
    });
  } catch (error) {
    console.error("getSentInvitation error:", error);
    next(error);
  }
};

export const acceptReceivedInvitation = async (req, res, next) => {
  try {
    const { tripId, invitationId } = req.params;
    const { userId } = req.user;

    if (!userId) {
      throw new AppError("User is not authenticated", 401);
    }

    if (!tripId || !invitationId) {
      throw new AppError("tripId and invitationId are required", 400);
    }

    const invitation = await InvitationModel.findById(invitationId);
    if (!invitation) {
      throw new AppError("No invitation found with given invitationId", 404);
    }

    if (invitation.tripId.toString() !== tripId) {
      throw new AppError("Invitation does not belong to this trip", 400);
    }

    if (invitation.status !== "PENDING") {
      throw new AppError(`Invitation already ${invitation.status.toLowerCase()}`, 400);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (invitation.email !== user.email) {
      throw new AppError("This invitation is not meant for you", 403);
    }

    const trip = await TripModel.findById(tripId);
    if (!trip) {
      throw new AppError("Trip not found", 404);
    }

    const alreadyCollaborator = trip.collaborators.some(
      (id) => id.toString() === userId,
    );

    if (!alreadyCollaborator) {
      trip.collaborators.push(userId);
      await trip.save();
    }else{
      throw new AppError("You are already a collaborator of this trip", 400);
    }

    invitation.status = "ACCEPTED";
    await invitation.save();

    return res.status(200).json({
      success: true,
      message: "Invitation accepted successfully",
      tripId,
    });
  } catch (error) {
    console.error("acceptReceivedInvitation error:", error);
    next(error);
  }
};

export const rejectReceivedInvitation = async (req, res, next) => {
  try {
    const { tripId, invitationId } = req.params;
    const { userId } = req.user;

    if (!userId) {
      throw new AppError("User is not authenticated", 401);
    }

    if (!tripId || !invitationId) {
      throw new AppError("tripId and invitationId are required", 400);
    }

    const invitation = await InvitationModel.findById(invitationId);
    if (!invitation) {
      throw new AppError("No invitation found with given invitationId", 404);
    }

    if (invitation.tripId.toString() !== tripId) {
      throw new AppError("Invitation does not belong to this trip", 400);
    }

    if (invitation.status !== "PENDING") {
      throw new AppError(`Invitation already ${invitation.status.toLowerCase()}`, 400);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (invitation.email !== user.email) {
      throw new AppError("This invitation is not meant for you", 403);
    }

    invitation.status = "REJECTED";
    await invitation.save();

    return res.status(200).json({
      success: true,
      message: "Invitation rejected successfully",
      tripId,
    });
  } catch (error) {
    console.error("rejectReceivedInvitation error:", error);
    next(error);
  }
};
