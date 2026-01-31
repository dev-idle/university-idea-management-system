import { z } from "zod";

/**
 * Auth schemas (Zod). Shared semantics with backend; keep in sync.
 */

export const loginBodySchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(512),
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
