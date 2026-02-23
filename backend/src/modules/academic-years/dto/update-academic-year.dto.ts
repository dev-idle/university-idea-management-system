import { z } from 'zod';

/** Academic year name format: YYYY-YYYY (e.g. 2026-2027). */
const ACADEMIC_YEAR_NAME_REGEX = /^\d{4}-\d{4}$/;

export const updateAcademicYearBodySchema = z
  .object({
    name: z
      .string()
      .min(1)
      .max(255)
      .optional()
      .refine(
        (s) => s === undefined || ACADEMIC_YEAR_NAME_REGEX.test(s.trim()),
        { message: 'Name must use format YYYY-YYYY (e.g. 2025-2026).' },
      )
      .refine(
        (s) => {
          if (s === undefined) return true;
          const m = s.trim().match(/^(\d{4})-(\d{4})$/);
          if (!m) return true;
          return parseInt(m[2], 10) === parseInt(m[1], 10) + 1;
        },
        { message: 'End year must be start year + 1 (e.g. 2025-2026).' },
      ),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional().nullable(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => {
      const end = data.endDate;
      const start = data.startDate;
      if (end === undefined || end === null) return true;
      if (start === undefined) return true;
      return end >= start;
    },
    { message: 'End date must be on or after start date.', path: ['endDate'] },
  )
  .superRefine((data, ctx) => {
    const name = data.name?.trim();
    if (!name) return;
    const m = name.match(/^(\d{4})-(\d{4})$/);
    if (!m) return;
    const [startYear, endYear] = [parseInt(m[1], 10), parseInt(m[2], 10)];
    if (data.startDate && data.startDate.getFullYear() !== startYear) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Start date must be in ${startYear}.`,
        path: ['startDate'],
      });
    }
    if (
      data.endDate &&
      data.endDate !== null &&
      data.endDate.getFullYear() !== endYear
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `End date must be in ${endYear}.`,
        path: ['endDate'],
      });
    }
  });

export const academicYearIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type UpdateAcademicYearBody = z.infer<
  typeof updateAcademicYearBodySchema
>;
export type AcademicYearIdParam = z.infer<typeof academicYearIdParamSchema>;
