import mongoose from "mongoose";

const finalProjectAnswerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Content",
      required: true,
    },
    links: { type: [String], default: [] },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

finalProjectAnswerSchema.pre("save", function (next) {
  this.links = this.links.map((link) => link.trim());
  this.notes = this.notes.trim();
  next();
});
// Prevent duplicate answers + fast lookup
finalProjectAnswerSchema.index({ user: 1, content: 1 }, { unique: true });

const FinalProjectAnswer = mongoose.model(
  "FinalProjectAnswer",
  finalProjectAnswerSchema,
);

export default FinalProjectAnswer;
