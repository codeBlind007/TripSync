import dotenv from "dotenv";
dotenv.config();

import express from "express";
import session from "express-session";
import cors from "cors";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import {createServer} from "http";
import http from "http";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import User from "./models/User.js";

// Fix for __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import TripModel from "./models/Trips.js";
import { authenticateToken } from "./utilities.js";
import tripRouter from "./routes/tripRouter.js";
import userRouter from "./routes/userRouter.js";
import authRouter from "./routes/authRouter.js";
import { socketController } from "./controllers/socketController.js";
import { connectDB } from "./utils/db.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import {clerkMiddleware} from '@clerk/express';

await connectDB();

const app = express();
const server = createServer(app);
const isProduction = process.env.NODE_ENV === "production";
const appUrl = isProduction ? process.env.DEPLOYED_FRONTEND_URL : process.env.FRONTEND_URL;

app.use(cookieParser());
app.use(express.json());

app.use(
  cors({
    origin: appUrl, // Your frontend URL
    credentials: true, // Allow cookies
  })
);
app.use(session({
  secret: "your-secret-key", // change to something secure
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // true if using HTTPS
}))


app.use(express.urlencoded({ extended: true }));
app.use(clerkMiddleware());

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL, // Use your frontend URL in production
    methods: ['GET', 'POST']
  }
});



// Socket.IO connection handler

socketController(io);

app.use("/api", tripRouter);
app.use("/api", userRouter);
app.use('/api', authRouter);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/assets", express.static(path.join(__dirname, "assets")));

app.get("/health-check", (req, res) => {
  res.send("Welcome to the TripSync API");
});

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(errorMiddleware);

const PORT = 8000;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});

export default server;
