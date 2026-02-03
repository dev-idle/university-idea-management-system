import { z } from 'zod';

/** PATCH /me/password body. No client-supplied userId; server uses JWT sub. */
export const changePasswordBodySchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required').max(512),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .max(512),
});

export type ChangePasswordBody = z.infer<typeof changePasswordBodySchema>;
