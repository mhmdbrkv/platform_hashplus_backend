import { z } from "zod";

export const signupSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50),
    email: z.string().email(),
    password: z.string().min(8).max(64),
    role: z.enum(["student", "instructor"]).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export const otpSchema = z.object({
  body: z.object({
    otp: z.string().length(6).regex(/^\d+$/, "OTP must be 6 digits"),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
    newPassword: z.string().min(8).max(64),
    resetCode: z.string().length(6).regex(/^\d+$/),
  }),
});
