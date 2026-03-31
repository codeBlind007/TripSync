// controllers/authController.js
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import dotenv from "dotenv";
import userSchema from "../models/User.js";
import tripController from "./tripController.js";
import AppError from "../utils/AppError.js";
dotenv.config();

const getAuthCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 72 * 60 * 60 * 1000,
    path: "/",
  };

  if (process.env.COOKIE_DOMAIN && isProduction) {
    cookieOptions.domain = process.env.COOKIE_DOMAIN;
  }

  return cookieOptions;
};


const createAccount = async (req, res, next) => {
  try {
    const { name, email, password } = req.validatedData;
    const { invite: inviteToken } = req.query;

    const isUser = await userSchema.findOne({ email });
    if (isUser) {
      throw new AppError("User already exists", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new userSchema({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();


    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "72h" }
    );

    res.cookie("token", accessToken, getAuthCookieOptions());


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

    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "72h" }
    );

    res.cookie("token", accessToken, getAuthCookieOptions());

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

const logout = (req, res) => {
  const cookieOptions = getAuthCookieOptions();
  res.clearCookie("token", {
    httpOnly: cookieOptions.httpOnly,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    path: cookieOptions.path,
    ...(cookieOptions.domain ? { domain: cookieOptions.domain } : {}),
  });
  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      throw new AppError("Authentication token is missing", 401);
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); // or your secret key
    const user = await userSchema.findById(decoded.userId); // or decoded._id, etc.
    if (!user) {
      throw new AppError("User not found", 401);
    }

    req.user = decoded; // ✅ now req.user is available to next middleware
    next();
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const authController = {
  createAccount,
  login,
  logout,
  protect,
};
export default authController;
