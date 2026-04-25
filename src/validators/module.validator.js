import { z } from "zod";
import mongoose from "mongoose";

const isObjectId = (schema, fieldName = "ID") =>
  schema.refine(
    (value) => mongoose.isValidObjectId(value),
    `${fieldName} must be a valid MongoDB ID`,
  );

export const nestedModuleParamsSchema = z.object({
  params: z
    .object({
      contentId: isObjectId(z.string(), "contentId"),
      moduleId: isObjectId(z.string(), "moduleId"),
    })
    .strict(),
});

export const addCourseModuleSchema = z.object({
  body: z
    .object({
      moduleType: z.enum(["video", "quiz", "task", "link"]),
      title: z.string().trim().min(3).max(100),
      description: z.string().trim().min(3).max(100),

      videoData: z
        .object({
          url: z.url().trim(),
          size: z.coerce.number(),
          duration: z.coerce.number(),
          key: z.string().trim(),
          uploadId: z.string().trim(),
        })
        .optional(),

      quizData: z
        .array(
          z
            .object({
              question: z.string().trim().min(3).max(100),
              options: z.array(z.string().trim().min(3).max(100)),
              answer: z.string().trim().min(3).max(100),
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
          url: z.url().trim(),
          imageUrl: z.url().trim(),
          description: z.string().trim().min(3).max(100),
        })
        .optional(),

      linkData: z
        .object({
          url: z.url().trim(),
          date: z.coerce.date(),
        })
        .optional(),
    })
    .strict()
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
  params: z
    .object({
      contentId: isObjectId(z.string(), "contentId"),
    })
    .strict(),
});

export const updateOneCourseModuleSchema = z.object({
  body: z
    .object({
      moduleType: z.enum(["video", "quiz", "task", "link"]),
      title: z.string().trim().min(3).max(100),
      description: z.string().trim().min(3).max(100),

      videoData: z.object({
        url: z.url().trim(),
        size: z.coerce.number(),
        duration: z.coerce.number(),
        key: z.string().trim(),
        uploadId: z.string().trim(),
      }),
      quizData: z.array(
        z
          .object({
            question: z.string().trim().min(3).max(100),
            options: z.array(z.string().trim().min(3).max(100)),
            answer: z.string().trim().min(3).max(100),
          })
          .refine((data) => data.options.length >= 2, {
            message: "Options must be at least two",
            path: ["options"],
          })
          .refine((data) => data.options.includes(data.answer), {
            message: "Answer must be in options",
            path: ["answer"],
          }),
      ),
      taskData: z.object({
        url: z.url().trim(),
        imageUrl: z.url().trim(),
        description: z.string().trim().min(3).max(100),
      }),
      linkData: z.object({
        url: z.url().trim(),
        date: z.coerce.date(),
      }),
    })
    .strict()
    .partial()
    .refine(
      (data) => Object.keys(data).length > 0,
      "At least one field is required",
    )
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
  params: z
    .object({
      contentId: isObjectId(z.string(), "contentId"),
      moduleId: isObjectId(z.string(), "moduleId"),
    })
    .strict(),
});

export const addBootcampModuleSchema = z.object({
  body: z
    .object({
      title: z.string().trim().min(3).max(100),
      description: z.string().trim().min(3).max(100),
      liveSession: z.url().trim(),

      video: z
        .object({
          url: z.url().trim(),
          key: z.string().trim(),
          uploadId: z.string().trim(),
          size: z.coerce.number(),
          duration: z.coerce.number(),
        })
        .optional(),

      timeStart: z.string().trim(),
      timeEnd: z.string().trim(),
      timezone: z.string().trim(),

      projects: z
        .array(
          z.object({
            title: z.string().trim().min(3).max(100),
            description: z.string().trim().min(3).max(100),
            githubUrl: z.url().trim(),
            liveDemoUrl: z.url().trim(),
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
    )
    .strict(),
  params: z
    .object({
      contentId: isObjectId(z.string(), "contentId"),
    })
    .strict(),
});

export const updateOneBootcampModuleSchema = z.object({
  body: z
    .object({
      title: z.string().trim().min(3).max(100),
      description: z.string().trim().min(3).max(100),
      liveSession: z.url().trim(),

      video: z.object({
        url: z.url().trim(),
        key: z.string().trim(),
        uploadId: z.string().trim(),
        size: z.coerce.number(),
        duration: z.coerce.number(),
      }),

      timeStart: z.string().trim(),
      timeEnd: z.string().trim(),
      timezone: z.string().trim(),

      projects: z.array(
        z.object({
          title: z.string().trim().min(3).max(100),
          description: z.string().trim().min(3).max(100),
          githubUrl: z.url().trim(),
          liveDemoUrl: z.url().trim(),
        }),
      ),
    })
    .strict()
    .partial()
    .refine(
      (data) => Object.keys(data).length > 0,
      "At least one field is required",
    )
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
  params: z
    .object({
      contentId: isObjectId(z.string(), "contentId"),
      moduleId: isObjectId(z.string(), "moduleId"),
    })
    .strict(),
});

export const answerCourseModuleSchema = z.object({
  body: z.object({
    answers: z.array(
      z
        .object({
          question: z.string().trim().min(3).max(100),
          answer: z.string().trim().min(3).max(100),
        })
        .strict(),
    ),
  }),

  params: z
    .object({
      contentId: isObjectId(z.string(), "contentId"),
      moduleId: isObjectId(z.string(), "moduleId"),
    })
    .strict(),
});
