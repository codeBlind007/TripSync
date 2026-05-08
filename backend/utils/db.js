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

  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");
};
