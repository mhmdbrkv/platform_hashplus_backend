import Review from "../models/review.model.js";
import { ApiError } from "../utils/apiError.js";
import ApiFeatures from "../utils/apiFeatures.js";
import { aggregateRatings } from "../utils/aggregateRatings.js";

const getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find();
    res.status(200).json({
      status: "success",
      message: "Reviews fetched successfully",
      data: reviews,
    });
  } catch (error) {
    console.log(error);
    next(new ApiError(error, 500));
  }
};
const getReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) {
      return next(new ApiError("Review not found", 404));
    }
    res.status(200).json({
      status: "success",
      message: "Review fetched successfully",
      data: review,
    });
  } catch (error) {
    console.log(error);
    next(new ApiError(error, 500));
  }
};
const createReview = async (req, res, next) => {
  try {
    const { rating, comment, review } = req.body;
    const newReview = await Review.create({ rating, comment, review });
    res.status(201).json({
      status: "success",
      message: "Review created successfully",
      data: newReview,
    });
  } catch (error) {
    console.log(error);
    next(new ApiError(error, 500));
  }
};
const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment, review } = req.body;
    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { rating, comment, review },
      { new: true },
    );
    if (!updatedReview) {
      return next(new ApiError("Review not found", 404));
    }
    res.status(200).json({
      status: "success",
      message: "Review updated successfully",
      data: updatedReview,
    });
  } catch (error) {
    console.log(error);
    next(new ApiError(error, 500));
  }
};
const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndDelete(id);
    if (!review) {
      return next(new ApiError("Review not found", 404));
    }
    res.status(200).json({
      status: "success",
      message: "Review deleted successfully",
      data: review,
    });
  } catch (error) {
    console.log(error);
    next(new ApiError(error, 500));
  }
};

export { getReviews, getReview, createReview, updateReview, deleteReview };
