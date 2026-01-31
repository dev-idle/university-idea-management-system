import { z } from 'zod';

export const createAcademicYearBodySchema = z.object({
  name: z.string().min(1).max(255),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
});

export type CreateAcademicYearBody = z.infer<
  typeof createAcademicYearBodySchema
>;
