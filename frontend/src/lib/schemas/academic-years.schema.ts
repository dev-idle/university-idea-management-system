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

/** Academic year name format: YYYY-YYYY (e.g. 2026-2027). */
const ACADEMIC_YEAR_NAME_REGEX = /^\d{4}-\d{4}$/;

/** Form schema: date fields as strings from input[type=date]. Use for react-hook-form + zodResolver; convert to Date in submit. */
export const createAcademicYearFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255)
    .regex(ACADEMIC_YEAR_NAME_REGEX, "Use format YYYY-YYYY (e.g. 2026-2027)"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
});

export type CreateAcademicYearFormValues = z.infer<typeof createAcademicYearFormSchema>;

export const updateAcademicYearBodySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional().nullable(),
  isActive: z.boolean().optional(),
});

/** Form-friendly: date fields as strings from input[type=date]; empty endDate → null. Use for react-hook-form + zodResolver; convert to Date in submit. */
export const updateAcademicYearFormSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().optional(),
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
