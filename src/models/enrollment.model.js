import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
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
    isCompleted: { type: Boolean, default: false },
    completedAt: Date,
    progress: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true },
);

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

export default Enrollment;
