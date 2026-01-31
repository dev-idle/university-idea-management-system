import { z } from "zod";

/**
 * Department schemas (Zod). Aligned with backend DTOs; client-side validation only.
 * Backend enforces DEPARTMENTS permission and DB constraints.
 */

export const createDepartmentBodySchema = z.object({
  name: z.string().min(1).max(255),
});

export type CreateDepartmentBody = z.infer<typeof createDepartmentBodySchema>;

export const updateDepartmentBodySchema = z.object({
  name: z.string().min(1).max(255).optional(),
});

export type UpdateDepartmentBody = z.infer<typeof updateDepartmentBodySchema>;

/** Single department (API response). */
export const departmentSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
});

export type Department = z.infer<typeof departmentSchema>;

export const departmentsListResponseSchema = z.array(departmentSchema);

export type DepartmentsListResponse = z.infer<typeof departmentsListResponseSchema>;
