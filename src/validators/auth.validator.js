import { z } from "zod";

export const signupSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2).max(50),
      email: z.email().trim().toLowerCase(),
      password: z.string().trim().min(8).max(64),
      role: z.enum(["student", "instructor"]).default("student"),
    })
    .strict(),
});

export const loginSchema = z.object({
  body: z
    .object({
      email: z.email().trim().toLowerCase(),
      password: z.string().trim().min(8).max(64),
    })
    .strict(),
});

export const otpSchema = z.object({
  body: z
    .object({
      otp: z
        .string()
        .trim()
        .length(6)
        .regex(/^\d+$/, "رمز التحقق يجب ان يكون 6 ارقام"),
    })
    .strict(),
});

export const forgotPasswordSchema = z.object({
  body: z
    .object({
      email: z.email().trim().toLowerCase(),
    })
    .strict(),
});

export const verifyResetCodeSchema = z.object({
  body: z
    .object({
      resetCode: z
        .string()
        .trim()
        .length(6)
        .regex(/^\d+$/, "رمز التحقق يجب ان يكون 6 ارقام"),
    })
    .strict(),
});

export const resetPasswordSchema = z.object({
  body: z
    .object({
      email: z.email().trim().toLowerCase(),
      newPassword: z.string().trim().min(8).max(64),
    })
    .strict(),
});
