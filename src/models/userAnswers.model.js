import mongoose from "mongoose";

const userAnswersSchema = new mongoose.Schema(
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
    moduleId: { type: String, required: true },
  },
  {
    discriminatorKey: "moduleType",
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const courseQuizAnswersSchema = new mongoose.Schema({
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
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  status: {
    type: String,
    enum: ["pass", "fail"],
  },
});

const UserAnswersModel = mongoose.model("UserAnswers", userAnswersSchema);

const CourseQuizAnswers = UserAnswersModel.discriminator(
  "quiz",
  courseQuizAnswersSchema,
);

export { UserAnswersModel, CourseQuizAnswers };
