import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";
import { Content, Course, Bootcamp } from "../models/content.model.js";

//------------------------ ALL ------------------------//

const getOneModule = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return next(
        new ApiError("id param is not a valid mongoose ObjectId!", 400),
      );
    }

    const moduleId = new mongoose.Types.ObjectId(id);

    const content = await Content.findOne(
      { "modules._id": moduleId },
      { "modules.$": 1 },
    );

    const module = content?.modules[0];

    res.status(200).json({
      status: "success",
      message: "Module Fetched Successfuly!",
      module,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Error fetching module.", 400));
  }
};

//------------------------ COURSE ------------------------//

const addCourseModule = async (req, res, next) => {
  try {
    const {
      moduleType,
      contentId,
      title,
      description,
      videoData,
      quizData,
      taskData,
      linkData,
    } = req.body;

    const content = await Course.findById(contentId);

    if (!content) {
      return next(new ApiError(`No content found with id: ${contentId}`, 400));
    }

    let dataObj = {};

    switch (moduleType) {
      case "video":
        dataObj = {
          video: {
            url: videoData.videoUrl,
            size: videoData.size,
            duration: videoData.duration,
            key: videoData.key,
            uploadId: videoData.uploadId,
            uploadedAt: new Date(),
          },
        };
        break;
      case "quiz":
        dataObj = {
          quiz: quizData.map((quiz) => {
            return {
              question: quiz.question,
              options: quiz.options,
              answer: quiz.answer,
            };
          }),
        };
        break;
      case "task":
        dataObj = {
          task: {
            url: taskData.url,
            imageUrl: taskData.imageUrl,
            description: taskData.description,
            uploadedAt: new Date(),
          },
        };
        break;
      case "link":
        dataObj = {
          link: {
            url: linkData.url,
            description: linkData.description,
          },
        };
        break;
      default:
        break;
    }

    content.modules.push({
      title,
      description,
      moduleType,
      order: content?.modules?.length + 1 || 0,
      ...dataObj,
    });

    await content.save();

    res.status(200).json({
      status: "success",
      message: "Module Added To DB Successfuly!",
      content,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Error adding module.", 400));
  }
};

const updateOneCourseModule = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return next(
        new ApiError("id param is not a valid mongoose ObjectId!", 400),
      );
    }

    const moduleId = new mongoose.Types.ObjectId(id);
    const {
      moduleType,
      title,
      description,
      videoData,
      quizData,
      taskData,
      linkData,
    } = req.body || {};

    // build an update object targeting the matched module
    const update = {
      $set: {},
    };

    if (title !== undefined) update.$set["modules.$.title"] = title;
    if (description !== undefined)
      update.$set["modules.$.description"] = description;

    if (moduleType === "video") {
      if (!videoData)
        return next(
          new ApiError("videoData is required for video module updates.", 400),
        );

      update.$set["modules.$.video"] = {
        url: videoData.videoUrl,
        size: videoData.size,
        duration: videoData.duration,
        key: videoData.key,
        uploadId: videoData.uploadId,
        uploadedAt: new Date(),
      };
    } else if (moduleType === "quiz") {
      if (!quizData)
        return next(
          new ApiError("quizData is required for quiz module updates.", 400),
        );

      update.$set["modules.$.quiz"] = quizData.map((quiz) => {
        return {
          question: quiz.question,
          options: quiz.options,
          answer: quiz.answer,
        };
      });
    } else if (moduleType === "task") {
      if (!taskData)
        return next(
          new ApiError("taskData is required for task module updates.", 400),
        );

      update.$set["modules.$.task"] = {
        url: taskData.url,
        imageUrl: taskData.imageUrl,
        description: taskData.description,
        uploadedAt: new Date(),
      };
    } else if (moduleType === "link") {
      if (!linkData) {
        return next(
          new ApiError("linkData is required for link module updates.", 400),
        );
      }

      update.$set["modules.$.link"] = {
        url: linkData.url,
        description: linkData.description,
      };
    }

    if (Object.keys(update.$set).length === 0) {
      return next(new ApiError("No updatable fields provided.", 400));
    }

    const content = await Course.findOneAndUpdate(
      { "modules._id": moduleId },
      update,
      {
        returnDocument: "after",
        projection: { "modules.$": 1 },
      },
    );

    if (!content) {
      return next(new ApiError("No Module Found", 404));
    }

    const module = content?.modules?.[0];

    res.status(200).json({
      status: "success",
      message: "Module Updated Successfuly!",
      module,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Error updating module.", 400));
  }
};

const removeOneCourseModule = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return next(
        new ApiError("id param is not a valid mongoose ObjectId!", 400),
      );
    }

    const moduleId = new mongoose.Types.ObjectId(id);

    // If video, remove from r2

    const content = await Course.findOneAndUpdate(
      { "modules._id": moduleId },
      { $pull: { modules: { _id: moduleId } } },
      { returnDocument: "after", projection: { "modules.$": 1 } },
    );

    if (!content) {
      return next(new ApiError("No module found with this id.", 404));
    }

    content.modules.forEach((module, idx) => (module.order = idx + 1));
    await content.save();

    res.status(200).json({
      status: "success",
      message: "Module Removed Successfuly!",
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Error fetching module.", 400));
  }
};

//------------------------ BOOTCAMP ------------------------//

const addBootcampModule = async (req, res, next) => {
  try {
    const {
      contentId,
      title,
      description,
      liveSession,
      video,
      timeStart,
      timeEnd,
      timezone,
      projects,
    } = req.body || {};

    if (!mongoose.isValidObjectId(contentId)) {
      return next(
        new ApiError("contentId is not a valid mongoose ObjectId!", 400),
      );
    }

    const moduleId = new mongoose.Types.ObjectId(contentId);

    const content = await Bootcamp.findById(moduleId);

    if (!content) {
      return next(new ApiError(`No content found with id: ${contentId}`, 400));
    }

    if (video && (!video.url || !video.key || !video.duration || !video.size)) {
      return next(
        new ApiError(
          "video url and key and duration and size is required!",
          400,
        ),
      );
    }

    if (liveSession && !liveSession.url) {
      return next(new ApiError("liveSession url is required!", 400));
    }

    if (
      projects &&
      (!projects.title ||
        !projects.description ||
        !projects.githubUrl ||
        !projects.liveDemoUrl)
    ) {
      return next(
        new ApiError(
          "projects title and description and githubUrl and liveDemoUrl is required!",
          400,
        ),
      );
    }

    content.modules.push({
      title,
      description,
      liveSession,
      video,
      timeStart,
      timeEnd,
      timezone,
      projects,
    });

    await content.save();

    res.status(200).json({
      status: "success",
      message: "Module Added To DB Successfuly!",
      content,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Error addind bootcamp module ", 400));
  }
};

const updateOneBootcampModule = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return next(
        new ApiError("id param is not a valid mongoose ObjectId!", 400),
      );
    }

    const moduleId = new mongoose.Types.ObjectId(id);
    const {
      title,
      description,
      liveSession,
      video,
      timeStart,
      timeEnd,
      timezone,
      projects,
    } = req.body || {};

    // build an update object targeting the matched module
    const update = {
      $set: {},
    };

    if (title !== undefined) update.$set["modules.$.title"] = title;
    if (description !== undefined)
      update.$set["modules.$.description"] = description;
    if (timeStart !== undefined) update.$set["modules.$.timeStart"] = timeStart;
    if (timeEnd !== undefined) update.$set["modules.$.timeEnd"] = timeEnd;
    if (timezone !== undefined) update.$set["modules.$.timezone"] = timezone;

    if (
      liveSession !== undefined &&
      liveSession.url &&
      liveSession.url !== ""
    ) {
      update.$set["modules.$.liveSession"] = liveSession;
    }

    if (
      video !== undefined &&
      video.url &&
      video.url !== "" &&
      video.key &&
      video.key !== "" &&
      video.duration &&
      video.duration !== "" &&
      video.size &&
      video.size !== ""
    ) {
      update.$set["modules.$.video"] = video;
    }

    if (
      projects !== undefined &&
      projects.title &&
      projects.title !== "" &&
      projects.description &&
      projects.description !== "" &&
      projects.githubUrl &&
      projects.githubUrl !== "" &&
      projects.liveDemoUrl &&
      projects.liveDemoUrl !== ""
    ) {
      update.$set["modules.$.projects"] = projects;
    }

    if (Object.keys(update.$set).length === 0) {
      return next(new ApiError("No updatable fields provided.", 400));
    }

    const content = await Bootcamp.findOneAndUpdate(
      { "modules._id": moduleId },
      update,
      {
        returnDocument: "after",
        projection: { "modules.$": 1 },
      },
    );

    if (!content) {
      return next(new ApiError("No Module Found", 404));
    }

    const module = content?.modules?.[0];

    res.status(200).json({
      status: "success",
      message: "Module Updated Successfuly!",
      module,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Error updating module.", 400));
  }
};

const removeOneBootcampModule = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return next(
        new ApiError("id param is not a valid mongoose ObjectId!", 400),
      );
    }

    const moduleId = new mongoose.Types.ObjectId(id);

    // If video, remove from r2

    const content = await Bootcamp.findOneAndUpdate(
      { "modules._id": moduleId },
      { $pull: { modules: { _id: moduleId } } },
      { returnDocument: "after", projection: { "modules.$": 1 } },
    );

    if (!content) {
      return next(new ApiError("No module found with this id.", 404));
    }

    res.status(200).json({
      status: "success",
      message: "Module Removed Successfuly!",
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Error fetching module.", 400));
  }
};

export {
  getOneModule,
  addCourseModule,
  updateOneCourseModule,
  removeOneCourseModule,
  addBootcampModule,
  updateOneBootcampModule,
  removeOneBootcampModule,
};
