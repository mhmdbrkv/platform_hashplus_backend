import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User required"],
    },

    content: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Content",
      required: [true, "Content required"],
    },

    type: {
      type: String,
      enum: ["course", "bootcamp"],
      required: [true, "Type required"],
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    paymentData: {
      paymentId: {
        type: String,
        required: [true, "Payment ID required"],
      },

      amount: {
        type: Number,
        required: [true, "Amount required"],
      },

      currency: {
        type: String,
        required: [true, "Currency required"],
      },

      paymentDate: {
        type: Date,
        default: Date.now,
      },

      _id: false,
    },
  },
  { timestamps: true },
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
