import Review from "../models/review.model.js";
import { Content } from "../models/content.model.js";
import { ApiError } from "../utils/apiError.js";
import ApiFeatures from "../utils/apiFeatures.js";
import { aggregateRatings } from "../utils/aggregateRatings.js";

const getReviews = async (req, res, next) => {
  try {
    // Nested Route
    let filter = {};
    if (req.params.contentId) {
      filter = { content: req.params.contentId };
    }

    // Build the query
    const numOfDocument = await Review.countDocuments(filter);
    const apiFeatures = new ApiFeatures(Review.find(filter), req.query)
      .paginate(numOfDocument)
      .filter()
      .limitFields()
      .search("Review")
      .sort();

    const { mongooseQuery, pagination } = apiFeatures;

    // Excute the query
    const docs = await mongooseQuery;

    res.status(200).json({
      status: "success",
      message: "Reviews fetched successfully",
      result: docs.length,
      pagination,
      data: docs,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError(error.message || "Error fetching reviews", 500));
  }
};

const getReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId).lean();

    if (!review) {
      return next(new ApiError("Review not found", 404));
    }
    res.status(200).json({
      status: "success",
      message: "Review fetched successfully",
      data: review,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError(error.message || "Error fetching review", 500));
  }
};

const createReview = async (req, res, next) => {
  try {
    const { rating, review, content } = req.body;

    const reviewExists = await Review.findOne({
      user: req.user._id,
      content,
    });

    if (reviewExists) {
      return next(new ApiError("You have already reviewed this content", 400));
    }

    const newReview = await Review.create({
      rating,
      review,
      user: req.user._id,
      content,
    });

    //Applying aggregation after creating a review
    aggregateRatings(content, Review, Content);

    res.status(201).json({
      status: "success",
      message: "Review created successfully",
      data: newReview,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError(error.message || "Error creating review", 500));
  }
};

const updateReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { rating, review } = req.body;

    const reviewDoc = await Review.findById(reviewId).populate({
      path: "content",
      select: "_id instructor",
    });

    if (!reviewDoc) {
      return next(new ApiError("Review not found!", 404));
    }

    if (
      (req.user.role === "student" &&
        reviewDoc.user.toString() !== req.user._id.toString()) ||
      (req.user.role === "instructor" &&
        reviewDoc.content.instructor.toString() !== req.user._id.toString())
    ) {
      return next(
        new ApiError("You are not authorized to update this review!", 403),
      );
    }

    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      { rating, review },
      { returnDocument: "after" },
    );

    //Applying aggregation after updating a review
    aggregateRatings(reviewDoc.content._id, Review, Content);

    res.status(200).json({
      status: "success",
      message: "Review updated successfully",
      data: updatedReview,
    });
  } catch (error) {
    console.log(error);
    next(new ApiError("Failed to update review", 500));
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId).populate({
      path: "content",
      select: "_id instructor",
    });

    if (!review) {
      return next(new ApiError("Review not found!", 404));
    }

    if (
      (req.user.role === "student" &&
        review.user.toString() !== req.user._id.toString()) ||
      (req.user.role === "instructor" &&
        review.content.instructor.toString() !== req.user._id.toString())
    ) {
      return next(
        new ApiError("You are not authorized to delete this review!", 403),
      );
    }

    await Review.findByIdAndDelete(reviewId);

    //Applying aggregation after deleting a review
    aggregateRatings(review.content._id, Review, Content);

    res.status(204).json({
      status: "success",
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error(error);
    next(new ApiError(error.message || "Error deleting review", 500));
  }
};

export { getReviews, getReview, createReview, updateReview, deleteReview };
