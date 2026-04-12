import mongoose from "mongoose";

const courseQuizAnswersSchema = new mongoose.Schema({
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
  moduleId: { type: String, required: true },
  answers: [
    {
      question: {
        type: String,
        required: true,
        trim: true,
      },
      answer: {
        type: String,
        required: true,
        trim: true,
      },
    },
  ],
});

const CourseQuizAnswers = mongoose.model(
  "CourseQuizAnswers",
  courseQuizAnswersSchema,
);

export default CourseQuizAnswers;
