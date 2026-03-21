// controllers/authController.js
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import dotenv from "dotenv";
import userSchema from "../models/User.js";
import tripController from "./tripController.js";

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
    let errors = {}

    const isUser = await userSchema.findOne({ email });
    if (isUser) {
      errors.email = "Email is already registered";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: true, errors });
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
      { expiresIn: "72h" },
    );

    res.cookie("token", accessToken, getAuthCookieOptions());

    if (inviteToken) {
      await tripController.acceptInvitation(inviteToken);
    }

    return res.status(201).json({
      error: false,
      user: { fullName: user.fullName, email: user.email },
      message: "Registration Successful",
    });
  } catch (error) {
    console.error("createAccount error:", error);
    return res.status(500).json({
      message: "Failed to create account",
    });
  }
};

const login = async (req, res) => {
  try {
    const { invite: inviteToken } = req.query;
    const {email, password} = req.validatedData;
    
    const user = await userSchema.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: true,
        errors: { user: "User not found" },
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: true,
        errors: { credentials: "Invalid credentials" },
      });
    }

    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "72h" },
    );

    res.cookie("token", accessToken, getAuthCookieOptions());

    if (inviteToken) {
      await tripController.acceptInvitation(inviteToken);
    }

    return res.status(200).json({
      error: false,
      user: { fullName: user.fullName, email: user.email },
      message: "Login Successful",
    });
  } catch (error) {
    console.error("login error:", error);
    return res.status(500).json({
      message: "Failed to login",
    });
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
  res.json({ message: "Logged out successfully" });
};

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Not logged in" });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); // or your secret key
    const user = await userSchema.findById(decoded.userId); // or decoded._id, etc.
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    req.user = decoded; // ✅ now req.user is available to next middleware
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

const authController = {
  createAccount,
  login,
  logout,
  protect,
};
export default authController;
