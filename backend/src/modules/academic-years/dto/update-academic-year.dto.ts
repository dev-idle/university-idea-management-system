import { z } from 'zod';

export const updateAcademicYearBodySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const academicYearIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type UpdateAcademicYearBody = z.infer<
  typeof updateAcademicYearBodySchema
>;
export type AcademicYearIdParam = z.infer<typeof academicYearIdParamSchema>;
