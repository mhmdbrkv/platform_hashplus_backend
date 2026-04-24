import { Content } from "../models/content.model.js";
import Learning from "../models/learning.model.js";
import { ApiError } from "../utils/apiError.js";

const getMyLearning = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const learning = await Learning.find({ user: userId });

    res.status(200).json({
      success: true,
      message: "data fetched successfully",
      length: learning.length,
      data: learning,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Error fetching data", 500));
  }
};

const addToMyLearning = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { contentId } = req.params;
    const content = await Content.findById(contentId);
    if (!content) return next(new ApiError("Content not found", 404));

    const learning = await Learning.findOne({
      user: userId,
      content: contentId,
    });
    if (learning) return next(new ApiError("Content already added", 400));

    const newLearning = await Learning.create({
      user: userId,
      content: contentId,
      type: content.contentType,
    });

    res.status(200).json({
      success: true,
      message: "data added successfully",
      data: newLearning,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Error adding data", 500));
  }
};

const removeFromMyLearning = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { contentId } = req.params;

    const learning = await Learning.findOneAndDelete({
      user: userId,
      content: contentId,
    });

    if (!learning) return next(new ApiError("No learning found", 404));

    res.status(200).json({
      success: true,
      message: "data deleted successfully",
      data: learning,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Error deleting data", 500));
  }
};

const updateProgress = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { contentId } = req.params;
    const { progress } = req.body;

    const learning = await Learning.findOneAndUpdate(
      { user: userId, content: contentId },
      [
        {
          $set: {
            progress: {
              $min: [100, { $max: [0, { $add: ["$progress", progress] }] }],
            },
          },
        },
      ],
      { returnDocument: "after" },
    );

    if (!learning) return next(new ApiError("Learning record not found", 404));

    if (learning.progress === 100 && learning.status !== "completed") {
      await Learning.findByIdAndUpdate(learning._id, {
        status: "completed",
        completedAt: new Date(),
      });
    }

    res.status(200).json({
      success: true,
      message: "data updated successfully",
      data: learning,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Error updating data", 500));
  }
};

export { getMyLearning, addToMyLearning, removeFromMyLearning, updateProgress };
