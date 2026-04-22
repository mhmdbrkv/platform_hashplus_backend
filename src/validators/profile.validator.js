import { z } from "zod";
import mongoose from "mongoose";

export const updateMyProfileSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(100).optional(),
    bio: z.string().min(3).max(100).optional(),
    languages: z
      .array(
        z.object({
          language: z.string().min(3).max(100),
          proficiency: z.string().min(3).max(100),
        }),
      )
      .optional(),
    skills: z.array(z.string()).optional(),
    links: z
      .array(
        z.object({
          name: z.string().min(3).max(100),
          url: z.url(),
        }),
      )
      .optional(),
    experience: z
      .array(
        z.object({
          company: z.string().min(3).max(100),
          country: z.string().min(3).max(100),
          city: z.string().min(3).max(100),
          jobTitle: z.string().min(3).max(100),
          jobType: z.string().min(3).max(100),
          jobStyle: z.string().min(3).max(100),
          startDate: z.coerce.date(),
          endDate: z.coerce.date(),
          skills: z.array(z.string()).optional(),
          description: z.string().min(3).max(100),
          isCurrent: z.boolean(),
        }),
      )
      .optional(),
    education: z
      .array(
        z.object({
          institution: z.string().min(3).max(100),
          degree: z.string().min(3).max(100),
          major: z.string().min(3).max(100),
          startDate: z.coerce.date(),
          endDate: z.coerce.date(),
          description: z.string().min(3).max(100),
          isCurrent: z.boolean(),
        }),
      )
      .optional(),
    instructorDetails: z
      .object({
        teachingStyle: z.string().min(3).max(100),
        videoProfessionality: z.string().min(3).max(100),
        targetAudience: z.string().min(3).max(100),
      })
      .optional(),
    studentDetails: z
      .object({
        projects: z
          .array(
            z.object({
              title: z.string().min(3).max(100),
              description: z.string().min(3).max(100),
              roleInProject: z.string().min(3).max(100),
              skillsUsed: z.array(z.string()).optional(),
              startDate: z.coerce.date(),
              endDate: z.coerce.date(),
              projectImageUrls: z.array(z.url()).optional(),
            }),
          )
          .optional(),
        certificates: z
          .array(
            z.object({
              name: z.string().min(3).max(100),
              description: z.string().min(3).max(100),
              contentId: z.custom((value) => {
                if (!mongoose.Types.ObjectId.isValid(value)) {
                  throw new Error("Invalid content ID");
                }
                return value;
              }),
              certificateUrl: z.url(),
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
      currentPassword: z.string().min(6).max(100),
      newPassword: z.string().min(6).max(100),
      confirmNewPassword: z.string().min(6).max(100),
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
