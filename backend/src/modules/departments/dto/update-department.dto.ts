import { z } from 'zod';

export const updateDepartmentBodySchema = z.object({
  name: z.string().min(1).max(255).optional(),
});

export const departmentIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type UpdateDepartmentBody = z.infer<typeof updateDepartmentBodySchema>;
export type DepartmentIdParam = z.infer<typeof departmentIdParamSchema>;
