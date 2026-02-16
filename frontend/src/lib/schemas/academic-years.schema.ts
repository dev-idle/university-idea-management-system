import { z } from "zod";

/**
 * Academic year schemas (Zod). Aligned with backend DTOs; client-side validation only.
 * Backend enforces ACADEMIC_YEARS permission and single-active constraint.
 */

export const createAcademicYearBodySchema = z.object({
  name: z.string().min(1).max(255),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
});

export type CreateAcademicYearBody = z.infer<typeof createAcademicYearBodySchema>;

/** Academic year name format: YYYY-YYYY, end = start + 1 (e.g. 2025-2026). */
const ACADEMIC_YEAR_NAME_REGEX = /^\d{4}-\d{4}$/;

/** Form schema: date fields as strings from input[type=date]. Use for react-hook-form + zodResolver; convert to Date in submit. */
export const createAcademicYearFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Required.")
      .max(255)
      .regex(ACADEMIC_YEAR_NAME_REGEX, "Use YYYY-YYYY format.")
      .refine(
        (val) => {
          const m = val.match(/^(\d{4})-(\d{4})$/);
          if (!m) return true;
          return parseInt(m[2], 10) === parseInt(m[1], 10) + 1;
        },
        { message: "End year must be start year + 1 (e.g. 2025-2026)." },
      ),
    startDate: z.string().min(1, "Required."),
    endDate: z.string().min(1, "Required."),
  })
  .superRefine((data, ctx) => {
    const m = data.name.trim().match(/^(\d{4})-(\d{4})$/);
    if (!m) return;
    const [startYear, endYear] = [parseInt(m[1], 10), parseInt(m[2], 10)];
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (start.getFullYear() !== startYear) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Start date must be in ${startYear}.`,
        path: ["startDate"],
      });
    }
    if (end.getFullYear() !== endYear) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `End date must be in ${endYear}.`,
        path: ["endDate"],
      });
    }
  });

export type CreateAcademicYearFormValues = z.infer<typeof createAcademicYearFormSchema>;

export const updateAcademicYearBodySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional().nullable(),
  isActive: z.boolean().optional(),
});

/** Form-friendly: date fields as strings from input[type=date]. Use for react-hook-form + zodResolver; convert to Date in submit. */
export const updateAcademicYearFormSchema = z
  .object({
    name: z
      .string()
      .min(1, "Required.")
      .max(255)
      .regex(ACADEMIC_YEAR_NAME_REGEX, "Use YYYY-YYYY format.")
      .refine(
        (val) => {
          const m = val.match(/^(\d{4})-(\d{4})$/);
          if (!m) return true;
          return parseInt(m[2], 10) === parseInt(m[1], 10) + 1;
        },
        { message: "End year must be start year + 1 (e.g. 2025-2026)." },
      )
      .optional(),
    startDate: z.string().optional(),
    endDate: z.string().min(1, "Required."),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      return new Date(data.endDate) >= new Date(data.startDate);
    },
    { message: "End date must be on or after start date.", path: ["endDate"] },
  )
  .superRefine((data, ctx) => {
    const name = data.name?.trim();
    if (!name) return;
    const m = name.match(/^(\d{4})-(\d{4})$/);
    if (!m) return;
    const [startYear, endYear] = [parseInt(m[1], 10), parseInt(m[2], 10)];
    if (data.startDate) {
      const y = new Date(data.startDate).getFullYear();
      if (y !== startYear) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Start date must be in ${startYear}.`,
          path: ["startDate"],
        });
      }
    }
    if (data.endDate) {
      const y = new Date(data.endDate).getFullYear();
      if (y !== endYear) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `End date must be in ${endYear}.`,
          path: ["endDate"],
        });
      }
    }
  });

export type UpdateAcademicYearFormValues = z.infer<typeof updateAcademicYearFormSchema>;

export type UpdateAcademicYearBody = z.infer<typeof updateAcademicYearBodySchema>;

/** Single academic year (API response). */
export const academicYearSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable(),
  isActive: z.boolean(),
  hasActiveSubmissionCycle: z.boolean().optional(),
});

export type AcademicYear = z.infer<typeof academicYearSchema>;

/** List response (array only, legacy). */
export const academicYearsListResponseSchema = z.array(academicYearSchema);

/** List response with global flag (when any submission cycle is ACTIVE, all academic year actions are disabled). */
export const academicYearsListWithContextSchema = z.object({
  list: z.array(academicYearSchema),
  hasActiveSubmissionCycleInSystem: z.boolean(),
});

export type AcademicYearsListResponse = z.infer<typeof academicYearsListResponseSchema>;
export type AcademicYearsListWithContext = z.infer<typeof academicYearsListWithContextSchema>;
