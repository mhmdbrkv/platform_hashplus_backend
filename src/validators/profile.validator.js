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

export const updateMyProfileSchema = z.object({
  body: z.object({
    name: trimString(z.string().min(3).max(100)).optional(),
    bio: trimString(z.string().min(3).max(100)).optional(),
    languages: z
      .array(
        z.object({
          language: trimString(z.string().min(3).max(100)),
          proficiency: trimString(z.string().min(3).max(100)),
        }),
      )
      .optional(),
    skills: z.array(trimString(z.string())).optional(),
    links: z
      .array(
        z.object({
          name: trimString(z.string().min(3).max(100)),
          url: z.url(),
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
          skills: z.array(trimString(z.string())).optional(),
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
              skillsUsed: z.array(trimString(z.string())).optional(),
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
  }),
});

export const changePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: trimString(z.string().min(6).max(100)),
      newPassword: trimString(z.string().min(6).max(100)),
      confirmNewPassword: trimString(z.string().min(6).max(100)),
    })
    .strict()
    .refine((data) => data.newPassword !== data.confirmNewPassword, {
      message: "الباسوورد الجديد غير متطابق مع الباسوورد التأكيدي",
      path: ["confirmNewPassword"],
    })
    .refine((data) => data.newPassword === data.currentPassword, {
      message:
        "الباسوورد الجديد متطابق مع الباسوورد الحالي. الرجاء استخدام باسوورد مختلف",
      path: ["newPassword"],
    }),
});
