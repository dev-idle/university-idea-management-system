import { z } from 'zod';

/** POST /auth/reset-password body. Token from email link; new password with policy. */
export const resetPasswordBodySchema = z.object({
  token: z.string().min(1, 'Reset token is required').max(512),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(512),
});

export type ResetPasswordBody = z.infer<typeof resetPasswordBodySchema>;
