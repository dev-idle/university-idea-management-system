import { z } from 'zod';

/** Academic year name format: YYYY-YYYY (e.g. 2026-2027). */
const ACADEMIC_YEAR_NAME_REGEX = /^\d{4}-\d{4}$/;

export const createAcademicYearBodySchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255)
    .transform((s) => s.trim())
    .refine((s) => ACADEMIC_YEAR_NAME_REGEX.test(s), {
      message: 'Name must use format YYYY-YYYY (e.g. 2026-2027).',
    }),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
});

export type CreateAcademicYearBody = z.infer<
  typeof createAcademicYearBodySchema
>;
