import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review text is required"],
      trim: true,
    },
    rating: {
      type: Number,
      min: [1, "Rating must be between 1 and 5"],
      max: [5, "Rating must be between 1 and 5"],
      require: [true, "Review rating is required"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: [true, "Review must belong to a user"],
    },
    content: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Content",
      require: [true, "Review must belong to a content"],
    },
  },
  { timestamps: true },
);

// mongoose query middleware for populating the `user` field
// reviewSchema.pre(/^find/, function () {
//   try {
//     this.populate([
//       {
//         path: "user",
//         select: "name email isSubscribed",
//       },
//       {
//         path: "content",
//         select: "title",
//       },
//     ]);
//   } catch (error) {
//     throw error;
//   }
// });

const Review = mongoose.model("Review", reviewSchema);

export default Review;
