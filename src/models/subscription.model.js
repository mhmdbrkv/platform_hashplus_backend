import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["general", "bootcamp"],
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    subscriptionDetails: {
      subscriptionName: String,
      subscriptionDescription: String,
      subscriptionType: {
        type: String,
        enum: ["one_month", "three_months", "one_year"],
      },
      subscriptionStartDate: Date,
      subscriptionEndDate: Date,
      _id: false,
    },

    bootcamp: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bootcamp",
    },

    paymentDetails: {
      paymentId: String,
      paymentStatus: String,
      paymentDate: Date,
      paymentMethod: String,
      paymentAmount: Number,
      paymentCurrency: String,
      _id: false,
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
