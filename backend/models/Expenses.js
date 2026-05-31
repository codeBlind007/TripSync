import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TripModel",
    required: true,
  },

  title: {
    type: String,
    required: true,
  },

  totalAmount: {
    type: Number,
    required: true,
  },

  category: String,

  note: String,

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  participants: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      shareAmount: Number,
      sharedAmount: {
        type: Number,
        default: function () {
          return this.shareAmount;
        },
      },
    },
  ],

  payments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      paidAmount: Number,
    },
  ],

  date: {
    type: Date,
    default: Date.now(),
  },
});

const ExpenseModel = mongoose.model("Expenses", expenseSchema);

export default ExpenseModel;
