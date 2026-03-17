import dotenv from "dotenv";
dotenv.config();
import { mailer } from "../utils/mailer.js";
import InvitationModel from "../models/Invitation.js";
import User from "../models/User.js";
import TripModel from "../models/Trips.js";
import { inviteEmailTemplate } from "../utils/inviteEmailTemplate.js";
import path from "path";

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

export const validateInvitationRequest = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        valid: false,
        reason: "Token is required",
      });
    }

    const invitation = await InvitationModel.findOne({
      token,
      status: "PENDING",
    });

    if (!invitation) {
      return res.status(404).json({
        valid: false,
        reason: "Invalid or already used invitation",
      });
    }

    if (invitation.expiresAt < new Date()) {
      return res.status(410).json({
        valid: false,
        reason: "Invitation expired",
      });
    }

    const user = await User.findOne({ email: invitation.email });
    console.log(!!req.user);
    return res.status(200).json({
      valid: true,
      email: invitation.email,
      accountExists: !!user,
      isAuthenticated: !!req.user,
      tripId: invitation.tripId,
    });
  } catch (error) {
    console.error("validateInvitationRequest error:", error);
    return res.status(500).json({
      valid: false,
      message: "Error validating invitation",
    });
  }
};

export const getRecievedInvitation = async (req, res) => {
  try {
    const { userId } = req.user;
    console.log(userId);
    if (!userId) {
      return res.status("404").json({
        message: "user is not logged in!",
      });
    }

    const user = await User.findOne({ _id: userId });

    const invitation = await InvitationModel.find({
      email: user.email,
      status: "PENDING",
    }).populate({
      path: "invitedBy",
      select: "name email",
    });

    if (invitation.length === 0) {
      return res.status(200).json({
        message: "No pending invitations found",
      });
    }

    return res.status(200).json({
      invitation,
    });
  } catch (error) {
    console.error("getRecievedInvitation error:", error);
    return res.status(500).json({
      valid: false,
      message: "Error validating invitation",
    });
  }
};

export const getSentInvitation = async (req, res) => {
  try {
    const { userId } = req.user;
    const { tripId } = req.params;
    console.log(userId);
    if (!userId) {
      return res.status(401).json({
        message: "user is not logged in!",
      });
    }
    if (!tripId) {
      return res.status(400).json({
        message: "TripId is required",
      });
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
      invitation,
    });
  } catch (error) {
    console.error("getSentInvitation error:", error);
    return res.status(500).json({
      valid: false,
      message: "Error validating invitation",
    });
  }
};

export const acceptReceivedInvitation = async (req, res) => {
  try {
    const { tripId, invitationId } = req.params;
    const { userId } = req.user;

    if (!userId) {
      return res.status(401).json({
        message: "User is not authenticated",
      });
    }

    if (!tripId || !invitationId) {
      return res.status(400).json({
        message: "tripId and invitationId are required",
      });
    }

    const invitation = await InvitationModel.findById(invitationId);
    if (!invitation) {
      return res.status(404).json({
        message: "No invitation found with given invitationId",
      });
    }

    if (invitation.tripId.toString() !== tripId) {
      return res.status(400).json({
        message: "Invitation does not belong to this trip",
      });
    }

    if (invitation.status !== "PENDING") {
      return res.status(400).json({
        message: `Invitation already ${invitation.status.toLowerCase()}`,
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (invitation.email !== user.email) {
      return res.status(403).json({
        message: "This invitation is not meant for you",
      });
    }

    const trip = await TripModel.findById(tripId);
    if (!trip) {
      return res.status(404).json({
        message: "Trip not found",
      });
    }

    const alreadyCollaborator = trip.collaborators.some(
      (id) => id.toString() === userId,
    );

    if (!alreadyCollaborator) {
      trip.collaborators.push(userId);
      await trip.save();
    }

    invitation.status = "ACCEPTED";
    await invitation.save();

    return res.status(200).json({
      message: "Invitation accepted successfully",
      tripId,
    });
  } catch (error) {
    console.error("acceptReceivedInvitation error:", error);
    return res.status(500).json({
      message: "Failed to accept invitation",
    });
  }
};

export const rejectReceivedInvitation = async (req, res) => {
  try {
    const { tripId, invitationId } = req.params;
    const { userId } = req.user;

    if (!userId) {
      return res.status(401).json({
        message: "User is not authenticated",
      });
    }

    if (!tripId || !invitationId) {
      return res.status(400).json({
        message: "tripId and invitationId are required",
      });
    }

    const invitation = await InvitationModel.findById(invitationId);
    if (!invitation) {
      return res.status(404).json({
        message: "No invitation found with given invitationId",
      });
    }

    if (invitation.tripId.toString() !== tripId) {
      return res.status(400).json({
        message: "Invitation does not belong to this trip",
      });
    }

    if (invitation.status !== "PENDING") {
      return res.status(400).json({
        message: `Invitation already ${invitation.status.toLowerCase()}`,
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (invitation.email !== user.email) {
      return res.status(403).json({
        message: "This invitation is not meant for you",
      });
    }

    invitation.status = "REJECTED";
    await invitation.save();

    return res.status(200).json({
      message: "Invitation rejected successfully",
      tripId,
    });
  } catch (error) {
    console.error("rejectReceivedInvitation error:", error);
    return res.status(500).json({
      message: "Failed to reject invitation",
    });
  }
};
