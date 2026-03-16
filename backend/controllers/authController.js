// controllers/authController.js
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import userSchema from "../models/User.js";
import tripController from "./tripController.js";

const createAccount = async(req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const {invite: inviteToken} = req.query;
    if (!name || !email || !password) {
      return res.status(400).json({
        error: true,
        message: "All fields required",
      });
    }
    

    const isUser = await userSchema.findOne({ email });
    if (isUser) {
      return res.status(400).json({
        error: true,
        message: "User already exists",
      });
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
  
    // ✅ Set JWT as an HTTP-only cookie
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: false, // set to true in production (HTTPS)
      sameSite: "Lax",
      maxAge: 72 * 60 * 60 * 1000, // 72 hours
    });
    
    if(inviteToken){
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
      message: "Failed to create account"
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const {invite: inviteToken} = req.query;
  const user = await userSchema.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return res.status(400).json({ message: "Invalid credentials" });

  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "72h" }
  );

  res.cookie("token", accessToken, {
    httpOnly: true,
    secure: true, // true in production
    sameSite: "lax",
    domain: process.env.COOKIE_DOMAIN, 
    maxAge: 72 * 60 * 60 * 1000,
  });

  if(inviteToken){
    await tripController.acceptInvitation(inviteToken);
  }
  
  return res.json({ message: "Login successful" });
};

const logout = (req, res) => {
  res.clearCookie("token");
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
  protect
};
export default authController;

