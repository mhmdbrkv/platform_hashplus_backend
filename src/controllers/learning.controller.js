import Learning from "../models/learning.model.js";

const getMyLearning = async (req, res) => {
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
    console.log(error);
    res.status(500).json({ success: false, message: "Error fetching data" });
  }
};

const addToMyLearning = async (req, res) => {
  try {
    const userId = req.user._id;
    const { contentId, type } = req.params;
    const learning = await Learning.create({
      user: userId,
      content: contentId,
      type,
    });
    res.status(200).json({
      success: true,
      message: "data added successfully",
      data: learning,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error adding data" });
  }
};

const removeFromMyLearning = async (req, res) => {
  try {
    const userId = req.user._id;
    const { contentId } = req.params;
    const learning = await Learning.findOneAndDelete({
      user: userId,
      content: contentId,
    });
    res.status(200).json({
      success: true,
      message: "data deleted successfully",
      data: learning,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error deleting data" });
  }
};

const updateProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { contentId } = req.params;
    const { progress } = req.body;

    const learning = await Learning.findOneAndUpdate(
      { user: userId, content: contentId },
      { $inc: { progress: progress } },
      { returnDocument: "after" },
    );
    res.status(200).json({
      success: true,
      message: "data updated successfully",
      data: learning,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error updating data" });
  }
};

export { getMyLearning, addToMyLearning, removeFromMyLearning, updateProgress };
