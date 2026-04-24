import { z } from "zod";
import mongoose from "mongoose";

const trimString = (schema) =>
  schema
    .transform((value) => value.trim())
    .refine((value) => value.length > 0, "Required");

const isObjectId = (schema, fieldName = "ID") =>
  schema.refine(
    (value) => mongoose.isValidObjectId(value),
    `${fieldName} must be a valid MongoDB ID`,
  );

export const nestedModuleParamsSchema = z.object({
  params: z.object({
    contentId: isObjectId(z.string(), "contentId"),
    moduleId: isObjectId(z.string(), "moduleId"),
  }),
});

export const addCourseModuleSchema = z.object({
  body: z
    .object({
      moduleType: z.enum(["video", "quiz", "task", "link"]).nonoptional(),
      title: trimString(z.string()),
      description: trimString(z.string()),

      videoData: z
        .object({
          url: trimString(z.url()),
          size: z.coerce.number(),
          duration: z.coerce.number(),
          key: trimString(z.string()),
          uploadId: trimString(z.string()),
        })
        .optional(),

      quizData: z
        .array(
          z
            .object({
              question: trimString(z.string()),
              options: z.array(trimString(z.string())),
              answer: trimString(z.string()),
            })
            .refine((data) => data.options.length >= 2, {
              message: "Options must be at least two",
              path: ["options"],
            })
            .refine((data) => data.options.includes(data.answer), {
              message: "Answer must be in options",
              path: ["answer"],
            }),
        )
        .optional(),

      taskData: z
        .object({
          url: trimString(z.url()),
          imageUrl: trimString(z.url()),
          description: trimString(z.string()),
        })
        .optional(),

      linkData: z
        .object({
          url: trimString(z.url()),
          date: z.coerce.date(),
        })
        .optional(),
    })
    .refine(
      (data) => data.moduleType === "video" || data.videoData !== undefined,
      "videoData is required for video modules",
    )
    .refine(
      (data) => data.moduleType === "quiz" || data.quizData !== undefined,
      "quizData is required for quiz modules",
    )
    .refine(
      (data) => data.moduleType === "task" || data.taskData !== undefined,
      "taskData is required for task modules",
    )
    .refine(
      (data) => data.moduleType === "link" || data.linkData !== undefined,
      "linkData is required for link modules",
    ),
  params: z.object({
    contentId: isObjectId(z.string(), "contentId"),
  }),
});

export const updateOneCourseModuleSchema = z.object({
  body: z
    .object({
      moduleType: z.enum(["video", "quiz", "task", "link"]).nonoptional(),
      title: trimString(z.string()).optional(),
      description: trimString(z.string()).optional(),

      videoData: z
        .object({
          url: trimString(z.url()).optional(),
          size: z.coerce.number().optional(),
          duration: z.coerce.number().optional(),
          key: trimString(z.string()).optional(),
          uploadId: trimString(z.string()).optional(),
        })
        .optional(),

      quizData: z
        .array(
          z
            .object({
              question: trimString(z.string()).optional(),
              options: z.array(trimString(z.string())).optional(),
              answer: trimString(z.string()).optional(),
            })
            .refine((data) => data.options.length >= 2, {
              message: "Options must be at least two",
              path: ["options"],
            })
            .refine((data) => data.options.includes(data.answer), {
              message: "Answer must be in options",
              path: ["answer"],
            }),
        )
        .optional(),

      taskData: z
        .object({
          url: trimString(z.url()).optional(),
          imageUrl: trimString(z.url()).optional(),
          description: trimString(z.string()).optional(),
        })
        .optional(),

      linkData: z
        .object({
          url: trimString(z.url()).optional(),
          date: z.coerce.date().optional(),
        })
        .optional(),
    })
    .refine(
      (data) => data.moduleType === "video" || data.videoData !== undefined,
      "videoData is required for video modules",
    )
    .refine(
      (data) => data.moduleType === "quiz" || data.quizData !== undefined,
      "quizData is required for quiz modules",
    )
    .refine(
      (data) => data.moduleType === "task" || data.taskData !== undefined,
      "taskData is required for task modules",
    )
    .refine(
      (data) => data.moduleType === "link" || data.linkData !== undefined,
      "linkData is required for link modules",
    ),
  params: z.object({
    contentId: isObjectId(z.string(), "contentId"),
    moduleId: isObjectId(z.string(), "moduleId"),
  }),
});

export const addBootcampModuleSchema = z.object({
  body: z
    .object({
      title: trimString(z.string()),
      description: trimString(z.string()),
      liveSession: trimString(z.url()),

      video: z
        .object({
          url: trimString(z.url()),
          key: trimString(z.string()),
          uploadId: trimString(z.string()),
          size: z.coerce.number(),
          duration: z.coerce.number(),
        })
        .optional(),

      timeStart: trimString(z.string()),
      timeEnd: trimString(z.string()),
      timezone: trimString(z.string()),

      projects: z
        .array(
          z.object({
            title: trimString(z.string()),
            description: trimString(z.string()),
            githubUrl: trimString(z.url()),
            liveDemoUrl: trimString(z.url()),
          }),
        )
        .optional(),
    })
    .refine(
      (data) =>
        data.video &&
        data.video.url &&
        data.video.key &&
        data.video.duration &&
        data.video.size,
      "video url, key, duration and size are required!",
    )
    .refine(
      (data) =>
        data.projects &&
        data.projects.length > 0 &&
        data.projects.every(
          (p) => p.title && p.description && p.githubUrl && p.liveDemoUrl,
        ),
      "projects title, description, githubUrl and liveDemoUrl are required!",
    ),
  params: z.object({
    contentId: isObjectId(z.string(), "contentId"),
  }),
});

export const updateOneBootcampModuleSchema = z.object({
  body: z
    .object({
      title: trimString(z.string()).optional(),
      description: trimString(z.string()).optional(),
      liveSession: trimString(z.url()).optional(),

      video: z
        .object({
          url: trimString(z.url()).optional(),
          key: trimString(z.string()).optional(),
          uploadId: trimString(z.string()).optional(),
          size: z.coerce.number().optional(),
          duration: z.coerce.number().optional(),
        })
        .optional(),

      timeStart: trimString(z.string()).optional(),
      timeEnd: trimString(z.string()).optional(),
      timezone: trimString(z.string()).optional(),

      projects: z
        .array(
          z.object({
            title: trimString(z.string()).optional(),
            description: trimString(z.string()).optional(),
            githubUrl: trimString(z.url()).optional(),
            liveDemoUrl: trimString(z.url()).optional(),
          }),
        )
        .optional(),
    })
    .refine(
      (data) =>
        data.video &&
        data.video.url &&
        data.video.key &&
        data.video.duration &&
        data.video.size,
      "video url, key, duration and size are required!",
    )
    .refine(
      (data) =>
        data.projects &&
        data.projects.length > 0 &&
        data.projects.every(
          (p) => p.title && p.description && p.githubUrl && p.liveDemoUrl,
        ),
      "projects title, description, githubUrl and liveDemoUrl are required!",
    ),
  params: z.object({
    contentId: isObjectId(z.string(), "contentId"),
    moduleId: isObjectId(z.string(), "moduleId"),
  }),
});

export const answerCourseModuleSchema = z.object({
  body: z.object({
    answers: z.array(
      z.object({
        question: trimString(z.string()),
        answer: trimString(z.string()),
      }),
    ),
  }),
  params: z.object({
    contentId: isObjectId(z.string(), "contentId"),
    moduleId: isObjectId(z.string(), "moduleId"),
  }),
});
