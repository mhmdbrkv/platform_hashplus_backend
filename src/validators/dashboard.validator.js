import { z } from "zod";
import mongoose from "mongoose";
import { createContentSchema } from "./content.validator.js";

const trimString = (schema) =>
  schema
    .transform((value) => value.trim())
    .refine((value) => value.length > 0, "Required");

const isObjectId = (schema, fieldName = "ID") =>
  schema.refine(
    (value) => mongoose.isValidObjectId(value),
    `${fieldName} must be a valid MongoDB ID`,
  );

const createUserSchema = z.object({
  body: z
    .object({
      name: trimString(z.string().min(3).max(100)),
      email: trimString(z.email().transform((v) => v.toLowerCase())),
      password: trimString(z.string().min(6).max(100)),
      role: trimString(z.enum(["student", "instructor", "admin"])),
      phone: trimString(z.string().min(11).max(11)).optional(),
      bio: trimString(z.string().min(3).max(100)).optional(),
      languages: z
        .array(
          z.object({
            language: trimString(
              z
                .string()
                .min(3)
                .max(100)
                .transform((v) => v.toLowerCase()),
            ),
            proficiency: trimString(
              z
                .string()
                .min(3)
                .max(100)
                .transform((v) => v.toLowerCase()),
            ),
          }),
        )
        .optional(),
      skills: z
        .array(
          trimString(
            z
              .string()
              .min(3)
              .max(100)
              .transform((v) => v.toLowerCase()),
          ),
        )
        .optional(),
      links: z
        .array(
          z.object({
            name: trimString(z.string().min(3).max(100)),
            url: trimString(z.url()),
          }),
        )
        .optional(),
      experience: z
        .array(
          z.object({
            company: trimString(z.string().min(3).max(100)),
            country: trimString(z.string().min(3).max(100)),
            city: trimString(z.string().min(3).max(100)),
            jobTitle: trimString(z.string().min(3).max(100)),
            jobType: trimString(z.string().min(3).max(100)),
            jobStyle: trimString(z.string().min(3).max(100)),
            startDate: z.coerce.date(),
            endDate: z.coerce.date(),
            skills: z
              .array(
                trimString(
                  z
                    .string()
                    .min(3)
                    .max(100)
                    .transform((v) => v.toLowerCase()),
                ),
              )
              .optional(),
            description: trimString(z.string().min(3).max(100)),
            isCurrent: z.boolean(),
          }),
        )
        .optional(),
      education: z
        .array(
          z.object({
            institution: trimString(z.string().min(3).max(100)),
            degree: trimString(z.string().min(3).max(100)),
            major: trimString(z.string().min(3).max(100)),
            startDate: z.coerce.date(),
            endDate: z.coerce.date(),
            description: trimString(z.string().min(3).max(100)),
            isCurrent: z.boolean(),
          }),
        )
        .optional(),
      instructorDetails: z
        .object({
          teachingStyle: trimString(z.string().min(3).max(100)),
          videoProfessionality: trimString(z.string().min(3).max(100)),
          targetAudience: trimString(z.string().min(3).max(100)),
          isVerified: z.boolean(),
          verifiedAt: z.coerce.date(),
        })
        .optional(),
      studentDetails: z
        .object({
          projects: z
            .array(
              z.object({
                title: trimString(z.string().min(3).max(100)),
                description: trimString(z.string().min(3).max(100)),
                roleInProject: trimString(z.string().min(3).max(100)),
                skillsUsed: z
                  .array(
                    trimString(
                      z
                        .string()
                        .min(3)
                        .max(100)
                        .transform((v) => v.toLowerCase()),
                    ),
                  )
                  .optional(),
                startDate: z.coerce.date(),
                endDate: z.coerce.date(),
                projectImageUrls: z.array(trimString(z.url())).optional(),
              }),
            )
            .optional(),
          certificates: z
            .array(
              z.object({
                name: trimString(z.string().min(3).max(100)),
                description: trimString(z.string().min(3).max(100)),
                contentId: isObjectId(z.string(), "contentId"),
                certificateUrl: trimString(z.url()),
                issuedAt: z.coerce.date(),
              }),
            )
            .optional(),
        })
        .optional(),
    })
    .superRefine((data, ctx) => {
      if (data.role === "instructor" && !data.instructorDetails) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Instructor details are required for instructors",
          path: ["instructorDetails"],
        });
      }
      if (data.role === "student" && !data.studentDetails) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Student details are required for students",
          path: ["studentDetails"],
        });
      }
    }),
});

export { createUserSchema, createContentSchema };
