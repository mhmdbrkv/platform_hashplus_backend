import mongoose from "mongoose";
import slugify from "slugify";
import { Content } from "../models/content.model.js";
import FinalProjectAnswer from "../models/finalProjectAnswer.model.js";
import { ApiError } from "../utils/apiError.js";
import ApiFeatures from "../utils/apiFeatures.js";

const getContents = async (req, res, next) => {
  try {
    // Nested Route
    let filter = {};
    if (req.params.categoryId) {
      if (!mongoose.isValidObjectId(req.params.categoryId)) {
        return next(
          new ApiError(
            "categoryId param is not a valid mongoose ObjectId!",
            400,
          ),
        );
      }
      filter = { category: req.params.categoryId };
    }

    // Build the query
    const numOfDocument = await Content.countDocuments();
    const apiFeatures = new ApiFeatures(Content.find(filter), req.query)
      .paginate(numOfDocument)
      .filter()
      .limitFields()
      .search("Content")
      .sort();

    const { mongooseQuery, pagination } = apiFeatures;

    // Excute the query
    const docs = await mongooseQuery;

    res.status(200).json({
      status: "success",
      message: "Contents fetched successfully",
      result: docs.length,
      pagination,
      data: docs,
    });
  } catch (error) {
    console.log(error);
    next(new ApiError(error, 500));
  }
};

const getContent = async (req, res, next) => {
  try {
    const { contentId } = req.params;
    const content = await Content.findById(contentId)
      .populate({
        path: "reviews",
        select: "review rating user",
      })
      .populate({
        path: "instructor",
        select: "name profileImage",
      })
      .populate({
        path: "category",
        select: "name",
      })
      .lean();

    if (!content) {
      return next(new ApiError("Content not found", 404));
    }

    res.status(200).json({
      status: "success",
      message: "Content fetched successfully",
      data: content,
    });
  } catch (error) {
    console.log(error);
    next(new ApiError(error, 500));
  }
};

const createContent = async (req, res, next) => {
  try {
    const {
      contentType,
      title,
      category,
      instructor,
      description,
      learningOutcomes,
      prerequisites,
      welcomeMessage,
      congratulationsMessage,
      level,
      language,
      materials,
      price,
      thumbnail,
      welcomeVideo,
      finalProject,
      startDate,
      endDate,
      totalProjects,
    } = req.body;

    if (!title || typeof title !== "string") {
      return next(new ApiError("Content title required", 400));
    }

    const slug = `${title}`.trim();

    const content = await Content.findOne({ slug });
    if (content) {
      return next(new ApiError("Content already exists", 400));
    }

    const finalInstructor = instructor || req.user?._id;
    const finalPrice =
      typeof price === "object" && price !== null
        ? price
        : { amount: Number(price) };

    if (
      finalProject &&
      (!finalProject.title ||
        !finalProject.description ||
        !Array.isArray(finalProject.tasks) ||
        !Array.isArray(finalProject.materials))
    ) {
      return next(
        new ApiError(
          "Final Project title, description, tasks and materials are required in finalProject",
          400,
        ),
      );
    }

    if (welcomeVideo) {
      if (
        !welcomeVideo.url ||
        !welcomeVideo.key ||
        !welcomeVideo.size ||
        !welcomeVideo.duration
      ) {
        return next(
          new ApiError(
            "Welcome Video url and key and size and duration are required in welcomeVideo",
            400,
          ),
        );
      }
    }

    if (thumbnail) {
      if (!thumbnail.url || !thumbnail.key) {
        return next(
          new ApiError("Thumbnail url and key are required in thumbnail", 400),
        );
      }
    }

    const newContent = await Content.create({
      title: `${title}`.trim(),
      slug,
      contentType,
      category,
      instructor: finalInstructor,
      description,
      learningOutcomes,
      prerequisites,
      welcomeMessage,
      congratulationsMessage,
      level,
      language,
      materials,
      price: finalPrice,
      thumbnail: thumbnail || null,
      welcomeVideo: welcomeVideo
        ? { ...welcomeVideo, uploadedAt: new Date() }
        : null,
      finalProject,
      startDate:
        contentType === "bootcamp" && startDate ? new Date(startDate) : null,
      endDate: contentType === "bootcamp" && endDate ? new Date(endDate) : null,
      totalProjects: contentType === "bootcamp" ? totalProjects : null,
    });

    res.status(201).json({
      status: "success",
      message: "Content created successfully",
      data: newContent,
    });
  } catch (error) {
    console.log(error);
    if (error.name === "ValidationError" || error.name === "CastError") {
      return next(new ApiError(error.message, 400));
    }
    next(new ApiError(error, 500));
  }
};

const updateContent = async (req, res, next) => {
  try {
    const { contentId } = req.params;
    const { title } = req.body;
    const slug = title ? slugify(title) : undefined;

    const content = await Content.findByIdAndUpdate(
      contentId,
      { title, slug },
      { returnDocument: "after" },
    );

    if (!content) {
      return next(new ApiError("Content not found", 404));
    }

    res.status(200).json({
      status: "success",
      message: "Content updated successfully",
      data: content,
    });
  } catch (error) {
    console.log(error);
    next(new ApiError(error, 500));
  }
};

const deleteContent = async (req, res, next) => {
  try {
    const { contentId } = req.params;

    const content = await Content.findById(contentId);
    if (!content) {
      return next(new ApiError("Content not found", 404));
    }

    // add delete cascade (Use Mongoose post-delete hooks or a transaction to clean up related documents)

    await Content.findByIdAndDelete(contentId);
    res.status(204).json({
      status: "success",
      message: "Content deleted successfully",
    });
  } catch (error) {
    console.log(error);
    next(new ApiError(error, 500));
  }
};

const completeFinalProject = async (req, res, next) => {
  try {
    const { contentId } = req.params;

    if (!mongoose.isValidObjectId(contentId)) {
      return next(
        new ApiError("contentId param is not a valid mongoose ObjectId!", 400),
      );
    }

    const { links, notes } = req.body || {};

    if (!links || !Array.isArray(links) || links.length === 0) {
      return next(new ApiError("Links are required.", 400));
    }

    const content = await Content.findById(contentId);

    if (!content) {
      return next(new ApiError("No course found with this id.", 404));
    }

    const existingAnswer = await FinalProjectAnswer.findOne({
      user: req.user._id,
      content: contentId,
    });

    if (existingAnswer) {
      return next(
        new ApiError("You have already submitted your final project.", 400),
      );
    }

    const completeProject = await FinalProjectAnswer.create({
      user: req.user._id,
      content: contentId,
      links,
      notes,
    });

    res.status(201).json({
      status: "success",
      message: "Final Project Completed!",
      data: completeProject,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Error completing final project", 500));
  }
};

export {
  getContents,
  getContent,
  createContent,
  updateContent,
  deleteContent,
  completeFinalProject,
};
