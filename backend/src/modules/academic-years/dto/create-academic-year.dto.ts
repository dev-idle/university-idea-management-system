import { z } from 'zod';

/** Academic year name format: YYYY-YYYY (e.g. 2026-2027). */
const ACADEMIC_YEAR_NAME_REGEX = /^\d{4}-\d{4}$/;

export const createAcademicYearBodySchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .max(255)
      .transform((s) => s.trim())
      .refine((s) => ACADEMIC_YEAR_NAME_REGEX.test(s), {
        message: 'Name must use format YYYY-YYYY (e.g. 2025-2026).',
      })
      .refine(
        (s) => {
          const m = s.match(/^(\d{4})-(\d{4})$/);
          if (!m) return true;
          return parseInt(m[2], 10) === parseInt(m[1], 10) + 1;
        },
        {
          message: 'End year must be start year + 1 (e.g. 2025-2026).',
        },
      ),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
  })
  .refine((data) => !data.endDate || data.endDate >= data.startDate, {
    message: 'End date must be on or after start date.',
    path: ['endDate'],
  })
  .superRefine((data, ctx) => {
    const m = data.name.match(/^(\d{4})-(\d{4})$/);
    if (!m) return;
    const [startYear, endYear] = [parseInt(m[1], 10), parseInt(m[2], 10)];
    if (data.startDate.getFullYear() !== startYear) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Start date must be in ${startYear}.`,
        path: ['startDate'],
      });
    }
    if (data.endDate && data.endDate.getFullYear() !== endYear) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `End date must be in ${endYear}.`,
        path: ['endDate'],
      });
    }
  });

export type CreateAcademicYearBody = z.infer<
  typeof createAcademicYearBodySchema
>;
