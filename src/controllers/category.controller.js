import slugify from "slugify";
import Category from "../models/category.model.js";
import { ApiError } from "../utils/apiError.js";
import ApiFeatures from "../utils/apiFeatures.js";

const getCategories = async (req, res, next) => {
  try {
    // Build the query
    const numOfDocument = await Category.countDocuments();
    const apiFeatures = new ApiFeatures(Category.find(), req.query)
      .paginate(numOfDocument)
      .filter()
      .limitFields()
      .search("Category")
      .sort();

    const { mongooseQuery, pagination } = apiFeatures;

    // Excute the query
    const docs = await mongooseQuery;

    res.status(200).json({
      status: "success",
      message: "Categories fetched successfully",
      result: docs.length,
      pagination,
      data: docs,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError(error.message || "Error fetching categories", 500));
  }
};

const getCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findById(categoryId).lean();

    if (!category) {
      return next(new ApiError("Category not found", 404));
    }

    res.status(200).json({
      status: "success",
      message: "Category fetched successfully",
      data: category,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError(error.message || "Error fetching category", 500));
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    const slug = slugify(name, { lower: true, trim: true });

    const category = await Category.findOne({ slug });
    if (category) {
      return next(new ApiError("Category already exists", 400));
    }

    const newCategory = await Category.create({ name, slug });
    res.status(201).json({
      status: "success",
      message: "Category created successfully",
      data: newCategory,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError(error.message || "Error creating category", 500));
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const { name } = req.body;
    const slug = slugify(name, { lower: true, trim: true });
    const category = await Category.findByIdAndUpdate(
      categoryId,
      { name, slug },
      { returnDocument: "after" },
    );

    if (!category) {
      return next(new ApiError("Category not found", 404));
    }

    res.status(200).json({
      status: "success",
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError(error.message || "Error updating category", 500));
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findByIdAndDelete(categoryId);

    if (!category) {
      return next(new ApiError("Category not found", 404));
    }

    res.status(204).end();
  } catch (error) {
    console.error(error);
    next(new ApiError("Failed to delete category", 500));
  }
};

export {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
