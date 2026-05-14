import bcrypt from "bcrypt";
import validator from "validator";
import dotenv from "dotenv";
import userSchema from "../models/User.js";
import { clerkClient } from "@clerk/express";
import tripController from "./tripController.js";
import AppError from "../utils/AppError.js";
dotenv.config();

const createAccount = async (req, res, next) => {
  try {
    const { name, email, password } = req.validatedData;
    const { invite: inviteToken } = req.query;
    const clerkUserId = req.auth?.userId;

    // Check if user already exists
    const isUser = await userSchema.findOne({ email });
    if (isUser) {
      throw new AppError("User already exists", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new userSchema({
      name,
      email,
      password: hashedPassword,
      clerkUserId, // Store Clerk user ID for OAuth users
    });

    await user.save();

    let inviteError = null;

    if (inviteToken) {
      try {
        await tripController.acceptInvitation(inviteToken, user._id);
      } catch (err) {
        console.error("Invite error:", err);
        inviteError = "Invalid or expired invite link";
      }
    }

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        user: {
          fullName: user.fullName,
          email: user.email,
        },
        ...(inviteError && { inviteError }),
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { invite: inviteToken } = req.query;
    const { email, password } = req.validatedData;

    const user = await userSchema.findOne({ email });
    if (!user) {
      throw new AppError("User not found", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    if (inviteToken) {
      try {
        await tripController.acceptInvitation(inviteToken, user._id);
      } catch (err) {
        return next(new AppError("Invalid or expired invite link", 400));
      }
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          fullName: user.fullName,
          email: user.email,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    // Revoke Clerk session if available (best-effort)
    try {
      const sessionId = req.auth?.sessionId;
      if (sessionId && clerkClient && clerkClient.sessions) {
        await clerkClient.sessions.revokeSession(sessionId);
      }
    } catch (err) {
      // non-fatal: continue to clear server session
      console.warn("Failed to revoke Clerk session:", err?.message || err);
    }

    // Destroy express-session and clear all cookies received from client
    const clearAllCookies = () => {
      try {
        const cookieNames = req.cookies ? Object.keys(req.cookies) : [];
        cookieNames.forEach((name) => {
          res.clearCookie(name);
        });
        // also ensure connect.sid cleared as fallback
        res.clearCookie("connect.sid");
      } catch (e) {
        // ignore
      }
    };

    if (req.session) {
      req.session.destroy((err) => {
        clearAllCookies();
        if (err) return next(err);
        return res
          .status(200)
          .json({ success: true, message: "Logout successful" });
      });
    } else {
      clearAllCookies();
      return res
        .status(200)
        .json({ success: true, message: "Logout successful" });
    }
  } catch (error) {
    next(error);
  }
};

const oauthCallback = async (req, res, next) => {
  try {
    const clerkUserId = req.auth?.userId;
    const { invite: inviteToken } = req.query;

    if (!clerkUserId) {
      throw new AppError("Unauthorized", 401);
    }

    // Check if user exists by Clerk ID
    let user = await userSchema.findOne({ clerkUserId });

    // If user doesn't exist, try to reconcile by email, or create a new record
    if (!user) {
      const clerkUser = req.auth;
      const email = clerkUser.email || `clerk-${clerkUserId}@example.com`;
      const name = clerkUser.name || "User";

      // If a user already exists with this email (registered earlier), attach clerkUserId
      const existingByEmail = await userSchema.findOne({ email });
      if (existingByEmail) {
        existingByEmail.clerkUserId = clerkUserId;
        await existingByEmail.save();
        user = existingByEmail;
      } else {
        try {
          user = new userSchema({
            name,
            email,
            clerkUserId,
            password: null, // No password for OAuth users
          });
          await user.save();
        } catch (err) {
          // Handle rare race where another process created the user with same email
          if (err && err.code === 11000) {
            const found = await userSchema.findOne({ email });
            if (found) {
              found.clerkUserId = clerkUserId;
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

    // Handle invitation if present
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
  createAccount,
  login,
  logout,
  oauthCallback,
};
export default authController;
