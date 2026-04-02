import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    subscriptionDetails: {
      subscriptionName: String,
      subscriptionAmount: Number,
      subscriptionType: {
        type: String,
        enum: ["one_month", "three_months", "one_year"],
      },
      subscriptionStartDate: Date,
      subscriptionEndDate: Date,
      _id: false,
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
