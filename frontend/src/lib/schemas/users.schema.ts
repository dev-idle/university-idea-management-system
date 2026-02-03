import { z } from "zod";
import { ROLES } from "@/lib/rbac";

/**
 * User schemas (Zod). Aligned with backend DTOs; client-side validation only.
 * Backend remains authority for authorization and persistence.
 */

export const createUserBodySchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Please enter a valid email address.")
    .max(255, "Email must not exceed 255 characters."),
  fullName: z.string().max(255, "Full name must not exceed 255 characters.").optional().nullable(),
  password: z
    .string()
    .min(1, "Password is required.")
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password must not exceed 128 characters."),
  role: z.enum(ROLES as unknown as [string, ...string[]]),
  departmentId: z
    .string()
    .min(1, "Please select a department.")
    .uuid("Please select a valid department."),
});

export type CreateUserBody = z.infer<typeof createUserBodySchema>;

export const updateUserBodySchema = z.object({
  isActive: z.boolean().optional(),
  fullName: z.string().max(255, "Full name must not exceed 255 characters.").optional().nullable(),
  newPassword: z
    .string()
    .optional()
    .refine((v) => !v || v.length >= 8, "Password must be at least 8 characters.")
    .refine((v) => !v || v.length <= 128, "Password must not exceed 128 characters."),
});

export type UpdateUserBody = z.infer<typeof updateUserBodySchema>;

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().max(100).optional(),
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

/** Single user in list/detail (API response shape). */
export const userListItemSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  fullName: z.string().nullable(),
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
