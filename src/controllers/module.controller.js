import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";
import { Content, Course, Bootcamp } from "../models/content.model.js";
import {
  UserAnswersModel,
  CourseQuizAnswers,
} from "../models/userAnswers.model.js";
import Learning from "../models/learning.model.js";
import { updateLearningProgress } from "../utils/updateLearningProgress.js";

//------------------------ ALL ------------------------//

const getMyModuleForInstructor = async (req, res, next) => {
  try {
    const instructor = req.user._id;
    const { moduleId } = req.params;
    const { contentId } = req.params;

    const content = await Content.findOne({ _id: contentId, instructor });

    if (!content) {
      return next(new ApiError("No content found with this id.", 404));
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

const getOneModule = async (req, res, next) => {
  try {
    const { moduleId } = req.params;
    const { contentId } = req.params;

    const content = await Content.findById(contentId);

    if (!content) {
      return next(new ApiError("No content found with this id.", 404));
    }

    const module = content.modules.id(moduleId);

    if (!module) {
      return next(new ApiError("No module found with this id.", 404));
    }

    // Check if the user is enrolled in this content (course or bootcamp)
    const learning = await Learning.findOne({
      user: req.user._id,
      content: contentId,
    });

    if (!learning) {
      return next(new ApiError("You are not enrolled in this content.", 400));
    }

    // update learning progress
    await updateLearningProgress(learning, content, moduleId);

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

    const content = await Course.findById(contentId);

    if (!content) {
      return next(new ApiError(`No content found with id: ${contentId}`, 404));
    }

    let dataObj = {};

    switch (moduleType) {
      case "video":
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
        dataObj = {
          quiz: quizData.map(({ question, options, answer }) => ({
            question,
            options,
            answer,
          })),
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
            date: linkData.date,
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

    const savedModule = content.modules[content.modules.length - 1];

    res.status(201).json({
      status: "success",
      message: "Module Added Successfully!",
      data: {
        _id: savedModule._id,
        title: savedModule.title,
        description: savedModule.description,
        moduleType: savedModule.moduleType,
        order: savedModule.order,
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

    if (title) module.title = title;
    if (description) module.description = description;

    if (moduleType === "video") {
      module.video = { ...videoData, uploadedAt: new Date() };
    } else if (moduleType === "quiz") {
      module.quiz = quizData.map(({ question, options, answer }) => ({
        question,
        options,
        answer,
      }));
    } else if (moduleType === "task") {
      module.task = { ...taskData, uploadedAt: new Date() };
    } else if (moduleType === "link") {
      module.link = { ...linkData };
    }

    await content.save();

    res.status(200).json({
      status: "success",
      message: "Module Updated Successfully!",
      data: module,
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

const answerCourseModule = async (req, res, next) => {
  try {
    const { contentId } = req.params;
    const { moduleId } = req.params;

    const { answers } = req.body || {};

    const content = await Course.findById(contentId);

    if (!content) {
      return next(new ApiError("No course found with this id.", 404));
    }

    const module = content.modules.id(moduleId);

    if (!module) {
      return next(new ApiError("No module found with this id.", 404));
    }

    // check if the content is in learning model
    const learning = await Learning.findOne({
      user: req.user._id,
      content: contentId,
      type: "course",
    });

    if (!learning) {
      return next(new ApiError("You are not enrolled in this course.", 400));
    }

    // check the module type
    if (module.moduleType === "quiz") {
      // check the questions in the module and compare with the questions in the answers
      const quizArray = module.quiz;

      for (const quiz of quizArray) {
        if (
          !answers.some(
            (answer) => answer._id.toString() === quiz._id.toString(),
          )
        ) {
          return next(
            new ApiError(
              "All sent questions must match with the module's questions.",
              400,
            ),
          );
        }
      }

      // check if the user has already answered the quiz
      let quizAnswers = await CourseQuizAnswers.findOne({
        user: req.user._id,
        content: contentId,
        moduleId,
      });

      if (quizAnswers) {
        quizAnswers.answers = answers;
      } else {
        quizAnswers = new CourseQuizAnswers({
          moduleType: "quiz",
          user: req.user._id,
          content: contentId,
          moduleId,
          answers,
        });
      }

      // calculate the score
      let score = 0;
      for (const quiz of quizArray) {
        const answer = answers.find(
          (answer) => answer._id.toString() === quiz._id.toString(),
        );
        if (
          answer &&
          answer.answer.toLowerCase().trim() ===
            quiz.answer.toLowerCase().trim()
        ) {
          score += 1;
        }
      }

      quizAnswers.score = Math.round((score / quizArray.length) * 100);
      quizAnswers.status = score >= quizArray.length / 2 ? "pass" : "fail";
      const updatedAnswers = await quizAnswers.save();

      res.status(201).json({
        status: "success",
        message: "Answers saved successfully!",
        data: updatedAnswers,
      });
    } else {
      return next(new ApiError("Module type is not valid.", 400));
    }
  } catch (error) {
    console.error(error);
    next(new ApiError("Error saving answers.", 400));
  }
};

const getCourseModuleAnswers = async (req, res, next) => {
  try {
    const { contentId } = req.params;
    const { moduleId } = req.params;

    const userAnswers = await UserAnswersModel.findOne({
      user: req.user._id,
      content: contentId,
      moduleId,
    });

    if (!userAnswers) {
      return next(new ApiError("No quiz answers found with this id.", 404));
    }

    res.status(200).json({
      status: "success",
      message: "Quiz answers fetched successfully!",
      data: userAnswers,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Error fetching quiz answers.", 400));
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

    const content = await Bootcamp.findById(contentId);

    if (!content) {
      return next(new ApiError(`No content found with id: ${contentId}`, 404));
    }

    let data = {
      title,
      description,
      liveSession,
      video: video ? { ...video, uploadedAt: new Date() } : undefined,
      timeStart,
      timeEnd,
      timezone,
      projects,
    };

    content.modules.push(data);
    await content.save();

    res.status(201).json({
      status: "success",
      message: "Module Added Successfully!",
      data: {
        _id: content.modules[content.modules.length - 1]._id,
        ...data,
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

    if (title) module.title = title;
    if (description) module.description = description;
    if (timeStart) module.timeStart = timeStart;
    if (timeEnd) module.timeEnd = timeEnd;
    if (timezone) module.timezone = timezone;
    if (liveSession) module.liveSession = liveSession;
    if (video) module.video = { ...video, uploadedAt: new Date() };
    if (projects) module.projects = projects;

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
  getMyModuleForInstructor,
  getOneModule,
  addCourseModule,
  updateOneCourseModule,
  removeOneCourseModule,
  addBootcampModule,
  updateOneBootcampModule,
  removeOneBootcampModule,
  answerCourseModule,
  getCourseModuleAnswers,
};
