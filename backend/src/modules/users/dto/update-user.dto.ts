import { z } from 'zod';

export const updateUserBodySchema = z.object({
  isActive: z.boolean().optional(),
  fullName: z.string().max(255).optional().nullable(),
  newPassword: z.string().min(8).max(128).optional(),
});

export const userIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().max(100).optional(),
});

export type UpdateUserBody = z.infer<typeof updateUserBodySchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
