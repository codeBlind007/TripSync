import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import tripRouter from "./routes/tripRouter.js";
import userRouter from "./routes/userRouter.js";
import authRouter from "./routes/authRouter.js";
import { socketController } from "./controllers/socketController.js";
import { connectDB } from "./utils/db.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import { clerkMiddleware } from "@clerk/express";

await connectDB();

const app = express();
const server = createServer(app);
const isProduction = process.env.NODE_ENV === "production";
const appUrl = isProduction
  ? process.env.DEPLOYED_FRONTEND_URL
  : process.env.FRONTEND_URL;

app.use(cookieParser());
app.use(express.json());

app.use(
  cors({
    origin: appUrl,
    credentials: true,
  }),
);

app.use(express.urlencoded({ extended: true }));
app.use(clerkMiddleware());

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});

socketController(io);

app.use("/api", tripRouter);
app.use("/api", userRouter);
app.use("/api", authRouter);

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
