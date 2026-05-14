// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  password: {
    type: String,
    minlength: 6,
  },

  clerkUserId: {
    type: String,
    unique: true,
    sparse: true,
  },
  avatarUrl: {
    type: String,
    default: "",
  },

  tripsOwned: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TripModel",
    },
  ],

  tripsJoined: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TripModel",
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema);
export default User;
