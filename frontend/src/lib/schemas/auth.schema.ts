import { z } from "zod";

/**
 * Auth schemas (Zod). Shared semantics with backend; keep in sync.
 */

export const loginBodySchema = z.object({
  email: z
    .string()
    .min(1, { error: "Email is required" })
    .max(255)
    .pipe(z.email({ error: "Enter a valid email address" })),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(512),
});

export type LoginBody = z.infer<typeof loginBodySchema>;

export const authUserSchema = z.object({
  id: z.string().min(1),
  email: z.email(),
  roles: z.array(z.string()),
});

export type AuthUser = z.infer<typeof authUserSchema>;

export const loginResponseSchema = z.object({
  accessToken: z.string(),
  user: authUserSchema,
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;

export const forgotPasswordBodySchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .max(255)
    .pipe(z.email("Enter a valid email address")),
});

export type ForgotPasswordBody = z.infer<typeof forgotPasswordBodySchema>;

export const resetPasswordBodySchema = z
  .object({
    token: z.string().min(1, "Reset link is invalid or expired"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(512),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordBody = z.infer<typeof resetPasswordBodySchema>;
