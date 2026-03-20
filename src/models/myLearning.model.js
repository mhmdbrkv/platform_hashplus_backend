import mongoose from "mongoose";

const myLearningSchema = new mongoose.Schema(
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

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true },
);

const MyLearning = mongoose.model("MyLearning", myLearningSchema);

export default MyLearning;
