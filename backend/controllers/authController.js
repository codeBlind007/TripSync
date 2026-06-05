import dotenv from "dotenv";
import userSchema from "../models/User.js";
import { clerkClient } from "@clerk/express";
import tripController from "./tripController.js";
import AppError from "../utils/AppError.js";
dotenv.config();

const oauthCallback = async (req, res, next) => {
  try {
    const clerkUserId = req.auth?.userId;
    const { invite: inviteToken } = req.query;

    if (!clerkUserId) {
      throw new AppError("Unauthorized", 401);
    }

    const clerkUser = await clerkClient.users.getUser(clerkUserId);
    const email =
      clerkUser.emailAddresses
        ?.find((address) => address.id === clerkUser.primaryEmailAddressId)
        ?.emailAddress?.toLowerCase() ||
      clerkUser.emailAddresses?.[0]?.emailAddress?.toLowerCase();
    const name =
      [clerkUser.firstName, clerkUser.lastName]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      clerkUser.username ||
      "User";
    const avatarUrl = clerkUser.imageUrl || "";

    if (!email) {
      throw new AppError("Unable to determine email from Google account", 400);
    }

    let user = await userSchema.findOne({ clerkUserId });

    if (!user) {
      const existingByEmail = await userSchema.findOne({ email });
      if (existingByEmail) {
        existingByEmail.clerkUserId = clerkUserId;
        existingByEmail.avatarUrl = avatarUrl;
        if (!existingByEmail.name) {
          existingByEmail.name = name;
        }
        await existingByEmail.save();
        user = existingByEmail;
      } else {
        try {
          user = new userSchema({
            name,
            email,
            clerkUserId,
            password: null,
            avatarUrl,
          });
          await user.save();
        } catch (err) {
          if (err && err.code === 11000) {
            const found = await userSchema.findOne({ email });
            if (found) {
              found.clerkUserId = clerkUserId;
              found.avatarUrl = avatarUrl;
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

    if (inviteToken) {
      try {
        await tripController.acceptInvitation(inviteToken, user._id);
      } catch (err) {
        console.error("Invite error:", err);
      }
    }

    return res.status(200).json({
      success: true,
      message: "OAuth login successful",
      data: {
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const authController = {
  oauthCallback,
};
export default authController;
