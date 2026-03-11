import { z } from 'zod';

/** POST /auth/forgot-password body. OWASP: generic response for existent/non-existent. */
export const forgotPasswordBodySchema = z.object({
  email: z.string().email('Enter a valid email address').max(255),
});

export type ForgotPasswordBody = z.infer<typeof forgotPasswordBodySchema>;
