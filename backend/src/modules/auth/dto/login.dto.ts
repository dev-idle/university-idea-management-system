import { z } from 'zod';

/** Login body schema (Zod). Bounded lengths for security and performance. */
export const loginBodySchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).min(8, 'Password must be at least 8 characters').max(512),
});

export type LoginBody = z.infer<typeof loginBodySchema>;
