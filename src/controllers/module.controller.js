import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";
import { Content, Course, Bootcamp } from "../models/content.model.js";

//------------------------ ALL ------------------------//

const getOneModule = async (req, res, next) => {
  try {
    const { moduleId } = req.params;
    const { contentId } = req.params;

    if (!mongoose.isValidObjectId(moduleId)) {
      return next(
        new ApiError("moduleId param is not a valid mongoose ObjectId!", 400),
      );
    }

    if (!mongoose.isValidObjectId(contentId)) {
      return next(
        new ApiError("contentId param is not a valid mongoose ObjectId!", 400),
      );
    }

    const content = await Content.findById(contentId);

    if (!content) {
      return next(new ApiError("No module found with this id.", 404));
    }

    const module = content.modules.id(moduleId);

    if (!module) {
      return next(new ApiError("No module found with this id.", 404));
    }

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
      title,
      description,
      videoData,
      quizData,
      taskData,
      linkData,
    } = req.body || {};

    const { contentId } = req.params;

    if (!mongoose.isValidObjectId(contentId)) {
      return next(
        new ApiError("contentId is not a valid mongoose ObjectId!", 400),
      );
    }

    const content = await Course.findById(contentId);

    if (!content) {
      return next(new ApiError(`No content found with id: ${contentId}`, 404));
    }

    if (!title) {
      return next(new ApiError("title is required!", 400));
    }

    let dataObj = {};

    switch (moduleType) {
      case "video":
        if (!videoData)
          return next(
            new ApiError("videoData is required for video modules.", 400),
          );
        dataObj = {
          video: {
            url: videoData.url,
            size: videoData.size,
            duration: videoData.duration,
            key: videoData.key,
            uploadId: videoData.uploadId,
            uploadedAt: new Date(),
          },
        };
        break;
      case "quiz":
        if (!quizData)
          return next(
            new ApiError("quizData is required for quiz modules.", 400),
          );
        dataObj = {
          quiz: quizData.map(({ question, options, answer }) => ({
            question,
            options,
            answer,
          })),
        };
        break;
      case "task":
        if (!taskData)
          return next(
            new ApiError("taskData is required for task modules.", 400),
          );
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
        if (!linkData)
          return next(
            new ApiError("linkData is required for link modules.", 400),
          );
        dataObj = {
          link: {
            url: linkData.url,
            description: linkData.description,
          },
        };
        break;
      default:
        return next(new ApiError(`Unknown moduleType: ${moduleType}`, 400));
    }

    content.modules.push({
      title,
      description,
      moduleType,
      order: (content.modules.length ?? 0) + 1,
      ...dataObj,
    });

    await content.save();

    res.status(201).json({
      status: "success",
      message: "Module Added Successfully!",
      data: {
        _id: content.modules[content.modules.length - 1]._id,
        title,
        description,
        moduleType,
        order: (content.modules.length ?? 0) + 1,
        ...dataObj,
      },
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Error adding module.", 400));
  }
};

const updateOneCourseModule = async (req, res, next) => {
  try {
    const { contentId } = req.params;
    const { moduleId } = req.params;

    if (!mongoose.isValidObjectId(contentId)) {
      return next(
        new ApiError("contentId param is not a valid mongoose ObjectId!", 400),
      );
    }

    if (!mongoose.isValidObjectId(moduleId)) {
      return next(
        new ApiError("moduleId param is not a valid mongoose ObjectId!", 400),
      );
    }

    const {
      moduleType,
      title,
      description,
      videoData,
      quizData,
      taskData,
      linkData,
    } = req.body || {};

    const content = await Course.findById(contentId);

    if (!content) {
      return next(new ApiError("No module found with this id.", 404));
    }

    const module = content.modules.id(moduleId);

    if (!module) return next(new ApiError("No Module Found", 404));

    if (title !== undefined) module.title = title;
    if (description !== undefined) module.description = description;

    if (moduleType && moduleType === "video") {
      if (!videoData)
        return next(
          new ApiError("videoData is required for video module updates.", 400),
        );

      module.video = { ...videoData, uploadedAt: new Date() };
    } else if (moduleType && moduleType === "quiz") {
      if (!quizData)
        return next(
          new ApiError("quizData is required for quiz module updates.", 400),
        );

      module.quiz = quizData.map(({ question, options, answer }) => ({
        question,
        options,
        answer,
      }));
    } else if (moduleType && moduleType === "task") {
      if (!taskData)
        return next(
          new ApiError("taskData is required for task module updates.", 400),
        );

      module.task = { ...taskData, uploadedAt: new Date() };
    } else if (moduleType && moduleType === "link") {
      if (!linkData) {
        return next(
          new ApiError("linkData is required for link module updates.", 400),
        );
      }

      module.link = { ...linkData };
    }

    await content.save();

    res.status(200).json({
      status: "success",
      message: "Module Updated Successfully!",
      data: content,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Error updating module.", 400));
  }
};

const removeOneCourseModule = async (req, res, next) => {
  try {
    const { contentId } = req.params;
    const { moduleId } = req.params;

    if (!mongoose.isValidObjectId(contentId)) {
      return next(
        new ApiError("contentId param is not a valid mongoose ObjectId!", 400),
      );
    }

    if (!mongoose.isValidObjectId(moduleId)) {
      return next(
        new ApiError("moduleId param is not a valid mongoose ObjectId!", 400),
      );
    }

    const content = await Course.findById(contentId);

    if (!content) {
      return next(new ApiError("No module found with this id.", 404));
    }

    const module = content.modules.id(moduleId);

    if (!module) {
      return next(new ApiError("No module found with this id.", 404));
    }

    // TODO: If video moduleType, delete from R2 storage here

    content.modules.pull(moduleId);

    // Re-order remaining modules after removal
    content.modules.forEach((mod, idx) => (mod.order = idx + 1));

    await content.save();

    res.status(200).json({
      status: "success",
      message: "Module Removed Successfully!",
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Error removing module.", 400));
  }
};

//------------------------ BOOTCAMP ------------------------//

const addBootcampModule = async (req, res, next) => {
  try {
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

    const { contentId } = req.params;

    if (!mongoose.isValidObjectId(contentId)) {
      return next(
        new ApiError("contentId is not a valid mongoose ObjectId!", 400),
      );
    }

    const content = await Bootcamp.findById(contentId);

    if (!content) {
      return next(new ApiError(`No content found with id: ${contentId}`, 404));
    }

    if (!title) {
      return next(new ApiError("title is required!", 400));
    }

    if (video && (!video.url || !video.key || !video.duration || !video.size)) {
      return next(
        new ApiError("video url, key, duration and size are required!", 400),
      );
    }

    if (liveSession && !liveSession.url) {
      return next(new ApiError("liveSession url is required!", 400));
    }

    if (
      projects &&
      Array.isArray(projects) &&
      projects.length > 0 &&
      projects.some(
        (p) => !p.title || !p.description || !p.githubUrl || !p.liveDemoUrl,
      )
    ) {
      return next(
        new ApiError(
          "projects title, description, githubUrl and liveDemoUrl are required!",
          400,
        ),
      );
    }

    content.modules.push({
      title,
      description,
      liveSession,
      video: video ? { ...video, uploadedAt: new Date() } : undefined,
      timeStart,
      timeEnd,
      timezone,
      projects,
    });

    await content.save();

    res.status(201).json({
      status: "success",
      message: "Module Added Successfully!",
      data: {
        _id: content.modules[content.modules.length - 1]._id,
        title,
        description,
        liveSession,
        video: video ? { ...video, uploadedAt: new Date() } : undefined,
        timeStart,
        timeEnd,
        timezone,
        projects,
      },
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Error adding bootcamp module.", 400));
  }
};

const updateOneBootcampModule = async (req, res, next) => {
  try {
    const { contentId } = req.params;
    const { moduleId } = req.params;

    if (!mongoose.isValidObjectId(contentId)) {
      return next(
        new ApiError("contentId param is not a valid mongoose ObjectId!", 400),
      );
    }

    if (!mongoose.isValidObjectId(moduleId)) {
      return next(
        new ApiError("moduleId param is not a valid mongoose ObjectId!", 400),
      );
    }

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

    const content = await Bootcamp.findById(contentId);

    if (!content) {
      return next(new ApiError("No module found with this id.", 404));
    }

    const module = content.modules.id(moduleId);

    if (!module) return next(new ApiError("No Module Found", 404));

    if (title !== undefined) module.title = title;
    if (description !== undefined) module.description = description;
    if (timeStart !== undefined) module.timeStart = timeStart;
    if (timeEnd !== undefined) module.timeEnd = timeEnd;
    if (timezone !== undefined) module.timezone = timezone;

    if (liveSession !== undefined) {
      if (!liveSession.url) {
        return next(new ApiError("liveSession url is required!", 400));
      }
      module.liveSession = {
        ...(module.liveSession?.toObject?.() ?? {}),
        ...liveSession,
      };
    }

    if (video !== undefined) {
      if (!video.url || !video.key || !video.duration || !video.size) {
        return next(
          new ApiError("video url, key, duration and size are required!", 400),
        );
      }
      module.video = { ...video, uploadedAt: new Date() };
    }

    if (projects !== undefined) {
      if (
        !Array.isArray(projects) ||
        projects.some(
          (p) => !p.title || !p.description || !p.githubUrl || !p.liveDemoUrl,
        )
      ) {
        return next(
          new ApiError(
            "projects title, description, githubUrl and liveDemoUrl are required!",
            400,
          ),
        );
      }
      module.projects = projects;
    }

    await content.save();

    res.status(200).json({
      status: "success",
      message: "Module Updated Successfully!",
      data: content,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Error updating module.", 400));
  }
};

const removeOneBootcampModule = async (req, res, next) => {
  try {
    const { contentId } = req.params;
    const { moduleId } = req.params;

    if (!mongoose.isValidObjectId(contentId)) {
      return next(
        new ApiError("contentId param is not a valid mongoose ObjectId!", 400),
      );
    }

    if (!mongoose.isValidObjectId(moduleId)) {
      return next(
        new ApiError("moduleId param is not a valid mongoose ObjectId!", 400),
      );
    }

    const content = await Bootcamp.findById(contentId);

    if (!content) {
      return next(new ApiError("No module found with this id.", 404));
    }

    const module = content.modules.id(moduleId);

    if (!module) {
      return next(new ApiError("No module found with this id.", 404));
    }

    // TODO: If video moduleType, delete from R2 storage here

    content.modules.pull(moduleId);

    await content.save();

    res.status(200).json({
      status: "success",
      message: "Module Removed Successfully!",
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Error removing module.", 400));
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
