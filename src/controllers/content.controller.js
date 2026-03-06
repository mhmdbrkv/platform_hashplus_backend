import Content from "../models/content.model.js";
import { ApiError } from "../utils/apiError.js";
import ApiFeatures from "../utils/apiFeatures.js";

const getContents = async (req, res, next) => {
  try {
    // Build the query
    const numOfDocument = await Content.countDocuments();
    const apiFeatures = new ApiFeatures(Content.find(), req.query)
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
    const { id } = req.params;
    const content = await Content.findById(id)
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
    const { title } = req.body;
    const slug = title
      ? title
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]/g, "")
      : undefined;

    const content = await Content.findOne({ slug });
    if (content) {
      return next(new ApiError("Content already exists", 400));
    }

    const newContent = await Content.create({ title, slug });
    res.status(201).json({
      status: "success",
      message: "Content created successfully",
      data: newContent,
    });
  } catch (error) {
    console.log(error);
    next(new ApiError(error, 500));
  }
};

const updateContent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const slug = title
      ? title
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]/g, "")
      : undefined;

    const content = await Content.findByIdAndUpdate(
      id,
      { title, slug },
      { new: true },
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
    const { id } = req.params;
    const content = await Content.findByIdAndDelete(id);
    res.status(200).json({
      status: "success",
      message: "Content deleted successfully",
      data: content,
    });
  } catch (error) {
    console.log(error);
    next(new ApiError(error, 500));
  }
};

export { getContents, getContent, createContent, updateContent, deleteContent };
