import { z } from "zod";

/**
 * Auth schemas (Zod). Shared semantics with backend; keep in sync.
 */

export const loginBodySchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address").max(255),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(512),
});

export type LoginBody = z.infer<typeof loginBodySchema>;

export const authUserSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  roles: z.array(z.string()),
});

export type AuthUser = z.infer<typeof authUserSchema>;

export const loginResponseSchema = z.object({
  accessToken: z.string(),
  user: authUserSchema,
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;
