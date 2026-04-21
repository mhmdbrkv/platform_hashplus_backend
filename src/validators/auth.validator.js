import { z } from "zod";

export const signupSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2)
      .max(50)
      .refine((value) => value.trim()),
    email: z.email().refine((value) => value.trim().toLowerCase()),
    password: z
      .string()
      .min(8)
      .max(64)
      .refine((value) => value.trim()),
    role: z
      .enum(["student", "instructor"])
      .optional()
      .default("student")
      .refine((value) => value.trim().toLowerCase()),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.email().refine((value) => value.trim().toLowerCase()),
    password: z
      .string()
      .min(8)
      .max(64)
      .refine((value) => value.trim()),
  }),
});

export const otpSchema = z.object({
  body: z.object({
    otp: z
      .string()
      .length(6)
      .regex(/^\d+$/, "رمز التحقق يجب ان يكون 6 ارقام")
      .refine((value) => value.trim()),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.email().refine((value) => value.trim().toLowerCase()),
  }),
});

export const verifyResetCodeSchema = z.object({
  body: z.object({
    resetCode: z
      .string()
      .length(6)
      .regex(/^\d+$/, "رمز التحقق يجب ان يكون 6 ارقام")
      .refine((value) => value.trim()),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.email().refine((value) => value.trim().toLowerCase()),
    newPassword: z
      .string()
      .min(8)
      .max(64)
      .refine((value) => value.trim()),
  }),
});
