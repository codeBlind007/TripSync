import mongoose from "mongoose";
const Schema = mongoose.Schema;

const tripSchema = new Schema({
  title: {
    type: String,
    required: [true, "A trip must have title!"],
  },

  description: {
    type: String,
    default: "",
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "A trip must have owner!"],
  },

  collaborators: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    default: [],
  },
  
  inviteCode: {
    type: String,
    default: null,
  },

  inviteLinkEnabled: {
    type: Boolean,
    default: false,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },

  endDate: {
    type: Date,
    default: Date.now,
    validate: {
      validator: function (value) {
        return value >= this.startDate;
      },
      message: "End date must be after start date",
    },
  },

  destination: {
    type: [String],
    default: [],
  },

  createdOn: {
    type: Date,
    default: Date.now,
  },

  itinerary: [
    {
      date: {
        type: String, // Format: 'YYYY-MM-DD'
        required: true,
      },
      is_deleted: {
        type: Boolean, 
        default: false
      },
      activities: [
        {
          activityId: {
            type: String,
            default: () => new mongoose.Types.ObjectId().toString(),
          },
          time: String, // e.g., '09:00 AM'
          title: String,
          location: String,
          notes: String,
        },
      ],
    },
  ],

  tasks: [
    {
      taskId: {
        type: String,
        default: () => new mongoose.Types.ObjectId().toString(),
      },
      text: {
        type: String,
        required: true,
      },
      assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      completed: {
        type: Boolean,
        default: false,
      },
    },
  ],

  expenses: [
    {
      amount: {
        type: Number,
        required: true,
      },
      category: String, // e.g., Food, Transport, Stay
      spentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      sharedWith: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      note: String,
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  story: {
    content: {
      type: Object, // Quill Delta or HTML
      default: {},
    },
    visitedLocations: [
      {
        name: String, // e.g., "Solang Valley"
        coordinates: {
          lat: Number,
          lng: Number,
        },
        description: String, // Optional notes about the place
      },
    ],
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    contributors: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        editedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isEditing: {
      type: Boolean,
      default: false,
    },
    activeUsers: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },

  pendingInvites: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      invitedAt: { type: Date, default: Date.now },
      status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending",
      },
    },
  ],
});

tripSchema.index({ owner: 1, startDate: 1 });
tripSchema.index({ collaborators: 1, startDate: 1 });

tripSchema.index({ owner: 1, endDate: 1 });
tripSchema.index({ collaborators: 1, endDate: 1 });

const TripModel = mongoose.model("TripModel", tripSchema);
export default TripModel;
