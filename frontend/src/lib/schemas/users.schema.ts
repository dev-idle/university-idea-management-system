import { z } from "zod";
import { ROLES } from "@/lib/rbac";

/**
 * User schemas (Zod). Aligned with backend DTOs; client-side validation only.
 * Backend remains authority for authorization and persistence.
 */

export const createUserBodySchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  role: z.enum(ROLES as unknown as [string, ...string[]]),
  departmentId: z.string().uuid().optional().nullable(),
});

export type CreateUserBody = z.infer<typeof createUserBodySchema>;

export const updateUserBodySchema = z.object({
  isActive: z.boolean(),
});

export type UpdateUserBody = z.infer<typeof updateUserBodySchema>;

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

/** Single user in list/detail (API response shape). */
export const userListItemSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  roles: z.array(z.string()),
  isActive: z.boolean(),
  departmentId: z.string().uuid().nullable(),
  department: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
    })
    .nullable(),
});

export type UserListItem = z.infer<typeof userListItemSchema>;

/** GET /users response. */
export const usersListResponseSchema = z.object({
  data: z.array(userListItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});

export type UsersListResponse = z.infer<typeof usersListResponseSchema>;
