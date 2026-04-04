import mongoose from "mongoose";
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
      if (!mongoose.isValidObjectId(req.params.contentId)) {
        return next(
          new ApiError(
            "contentId param is not a valid mongoose ObjectId!",
            400,
          ),
        );
      }
      filter = { content: req.params.contentId };
    }

    // Build the query
    const numOfDocument = await Review.countDocuments();
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
    console.log(error);
    next(new ApiError(error, 500));
  }
};

const getReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return next(
        new ApiError("id param is not a valid mongoose ObjectId!", 400),
      );
    }

    const review = await Review.findById(id).lean();

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
    const { rating, review, user, content } = req.body;

    if (!mongoose.isValidObjectId(content)) {
      return next(
        new ApiError("content param is not a valid mongoose ObjectId!", 400),
      );
    }

    if (!mongoose.isValidObjectId(user)) {
      return next(
        new ApiError("user param is not a valid mongoose ObjectId!", 400),
      );
    }

    const newReview = await Review.create({
      rating,
      review,
      user,
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
    console.log(error);
    next(new ApiError(error, 500));
  }
};

const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return next(
        new ApiError("id param is not a valid mongoose ObjectId!", 400),
      );
    }

    const updatedReview = await Review.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { rating, review },
      { returnDocument: "after" },
    );
    if (!updatedReview) {
      return next(
        new ApiError("Review not found or you are not authorized!", 404),
      );
    }

    //Applying aggregation after updating a review
    aggregateRatings(updatedReview.content, Review, Content);

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

    if (!mongoose.isValidObjectId(id)) {
      return next(
        new ApiError("id param is not a valid mongoose ObjectId!", 400),
      );
    }

    const review = await Review.findOne({ _id: id, user: req.user._id });
    if (!review) {
      return next(
        new ApiError("Review not found or you are not authorized!", 404),
      );
    }

    await Review.deleteOne({ _id: id, user: req.user._id });

    //Applying aggregation after deleting a review
    aggregateRatings(review.content, Review, Content);

    res.status(204).json({
      status: "success",
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.log(error);
    next(new ApiError(error, 500));
  }
};

export { getReviews, getReview, createReview, updateReview, deleteReview };
