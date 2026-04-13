import mongoose from "mongoose";

const finalProjectAnswerSchema = new mongoose.Schema({
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
});

const FinalProjectAnswer = mongoose.model(
  "FinalProjectAnswer",
  finalProjectAnswerSchema,
);

export default FinalProjectAnswer;
