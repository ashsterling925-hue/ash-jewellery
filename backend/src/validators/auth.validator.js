import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email("Please provide a valid email address")
    .transform((val) => val.toLowerCase()),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password cannot be empty"),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email("Please provide a valid email address")
    .transform((val) => val.toLowerCase()),
});

export const resetPasswordSchema = z.object({
  token: z
    .string({ required_error: "Reset token is required" })
    .trim()
    .min(1, "Reset token is required"),
  newPassword: z
    .string({ required_error: "New password is required" })
    .min(8, "Password must be at least 8 characters long")
    .max(100, "Password cannot exceed 100 characters"),
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string({ required_error: "Current password is required" })
    .min(1, "Current password cannot be empty"),
  newPassword: z
    .string({ required_error: "New password is required" })
    .min(8, "New password must be at least 8 characters long")
    .max(100, "New password cannot exceed 100 characters"),
});

export default {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
};
