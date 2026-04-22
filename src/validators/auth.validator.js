import { z } from "zod";

const trimString = (schema) =>
  schema
    .transform((value) => value.trim())
    .refine((value) => value.length > 0, "Required");

export const signupSchema = z.object({
  body: z.object({
    name: trimString(z.string().min(2).max(50)),
    email: trimString(z.email().toLowerCase()),
    password: trimString(z.string().min(8).max(64)),
    role: z.enum(["student", "instructor"]).optional().default("student"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: trimString(z.email().toLowerCase()),
    password: trimString(z.string().min(8).max(64)),
  }),
});

export const otpSchema = z.object({
  body: z.object({
    otp: trimString(
      z.string().length(6).regex(/^\d+$/, "رمز التحقق يجب ان يكون 6 ارقام"),
    ),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: trimString(z.email().toLowerCase()),
  }),
});

export const verifyResetCodeSchema = z.object({
  body: z.object({
    resetCode: trimString(
      z.string().length(6).regex(/^\d+$/, "رمز التحقق يجب ان يكون 6 ارقام"),
    ),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: trimString(z.email().toLowerCase()),
    newPassword: trimString(z.string().min(8).max(64)),
  }),
});
