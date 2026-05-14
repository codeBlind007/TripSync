import "dotenv/config";
import mongoose from "mongoose";

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  console.log("from db.js: ", mongoUri);

  if (!mongoUri) {
    throw new Error(
      "MONGO_URI is not set. Load the backend .env before connecting to MongoDB.",
    );
  }

  try {
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 45000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      retryWrites: true,
    });
    console.log("MongoDB connected with optimized pool settings");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};
