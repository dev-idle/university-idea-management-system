import { z } from "zod";

/**
 * Department schemas (Zod). Aligned with backend DTOs; client-side validation only.
 * Backend enforces DEPARTMENTS permission and DB constraints.
 */

export const createDepartmentBodySchema = z.object({
  name: z
    .string()
    .min(1, "Department name is required.")
    .max(255, "Department name must not exceed 255 characters."),
});

export type CreateDepartmentBody = z.infer<typeof createDepartmentBodySchema>;

export const updateDepartmentBodySchema = z.object({
  name: z
    .string()
    .min(1, "Department name is required.")
    .max(255, "Department name must not exceed 255 characters.")
    .optional(),
});

export type UpdateDepartmentBody = z.infer<typeof updateDepartmentBodySchema>;

/** Single department (API response). List may include _count for UI (e.g. delete disabled when has users). */
export const departmentSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  _count: z
    .object({
      users: z.number().int().min(0),
    })
    .optional(),
});

export type Department = z.infer<typeof departmentSchema>;

export const departmentsListResponseSchema = z.array(departmentSchema);

export type DepartmentsListResponse = z.infer<typeof departmentsListResponseSchema>;
