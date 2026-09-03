import { z } from "zod";

export const signupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { message: "Full Name must be at least 2 characters" })
      .max(100, { message: "Full Name cannot exceed 100 characters" }),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email({ message: "Please provide a valid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .max(128, { message: "Password cannot exceed 128 characters" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" }),
    confirmPassword: z.string(),
    role: z.enum(["STUDENT", "INSTRUCTOR"]).optional().default("STUDENT"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const otpVerifySchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: "Invalid email address" }),
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, { message: "Verification code must be exactly 6 digits" }),
});

export const otpResendSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: "Invalid email address" }),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;
export type OtpResendInput = z.infer<typeof otpResendSchema>;
