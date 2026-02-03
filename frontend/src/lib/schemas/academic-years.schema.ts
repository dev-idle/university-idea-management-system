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

export const updateAcademicYearBodySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional().nullable(),
  isActive: z.boolean().optional(),
});

/** Form-friendly: allows empty string for endDate (cleared field) → null. */
export const updateAcademicYearFormSchema = updateAcademicYearBodySchema.extend({
  endDate: z
    .union([z.coerce.date(), z.literal("")])
    .optional()
    .nullable()
    .transform((v) => (v === "" ? null : v)),
});

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
