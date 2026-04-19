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
      refunded: { type: Boolean, default: false },
      refundDate: Date,
      _id: false,
    },

    isActive: { type: Boolean, default: true },
    canceled: { type: Boolean, default: false },
    canceledAt: Date,
  },
  { timestamps: true },
);

// Most common auth-guard lookup
subscriptionSchema.index({ user: 1, type: 1, isActive: 1 });
// Cron job: find all expired active general subscriptions
subscriptionSchema.index({
  "subscriptionDetails.subscriptionEndDate": 1,
  isActive: 1,
  type: 1,
});
// Webhook idempotency lookup
subscriptionSchema.index({ "paymentDetails.paymentId": 1 }, { sparse: true });

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
