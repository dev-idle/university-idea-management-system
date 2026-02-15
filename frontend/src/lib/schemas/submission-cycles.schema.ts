import { z } from "zod";

/**
 * Idea Submission Cycle schemas (Zod). Aligned with backend DTOs.
 * Backend enforces QA_MANAGER role and single-active constraint.
 */

export const CYCLE_STATUS = ["DRAFT", "ACTIVE", "CLOSED"] as const;
export type CycleStatus = (typeof CYCLE_STATUS)[number];

const DEFAULT_INTERACTION_DAYS = 14;

export const createCycleBodySchema = z
  .object({
    academicYearId: z.string().uuid(),
    name: z.string().min(1, "Name is required").max(255).transform((s) => s.trim()),
    categoryIds: z.array(z.string().uuid()).min(1, "At least one category is required"),
    ideaSubmissionClosesAt: z.coerce.date(),
    interactionClosesAt: z.coerce.date().optional(),
  })
  .refine(
    (data) => {
      const interaction =
        data.interactionClosesAt ??
        new Date(data.ideaSubmissionClosesAt.getTime() + DEFAULT_INTERACTION_DAYS * 24 * 60 * 60 * 1000);
      return interaction > data.ideaSubmissionClosesAt;
    },
    {
      message: "Comments and votes must close after idea closure",
      path: ["interactionClosesAt"],
    }
  );

export type CreateCycleBody = z.infer<typeof createCycleBodySchema>;

/** Form schema: date fields as strings (datetime-local). Use for react-hook-form; convert to Date in submit. */
export const createCycleFormSchema = z
  .object({
    academicYearId: z.string().uuid(),
    name: z.string().min(1, "Name is required").max(255),
    categoryIds: z.array(z.string().uuid()).min(1, "At least one category is required"),
    ideaSubmissionClosesAt: z.string().min(1, "Idea submission closure is required"),
    interactionClosesAt: z.string().min(1, "Comments and votes closure is required"),
  })
  .refine(
    (data) => new Date(data.interactionClosesAt) > new Date(data.ideaSubmissionClosesAt),
    {
      message: "Comments and votes must close after idea closure",
      path: ["interactionClosesAt"],
    }
  );

export type CreateCycleFormValues = z.infer<typeof createCycleFormSchema>;

export const updateCycleBodySchema = z
  .object({
    name: z.string().max(255).optional().transform((s) => (s != null && s.trim() !== "" ? s.trim() : undefined)),
    categoryIds: z.array(z.string().uuid()).min(1).optional(),
    ideaSubmissionClosesAt: z.coerce.date().optional(),
    interactionClosesAt: z.coerce.date().optional(),
  })
  .refine(
    (data) => {
      if (data.ideaSubmissionClosesAt == null || data.interactionClosesAt == null) return true;
      return data.interactionClosesAt > data.ideaSubmissionClosesAt;
    },
    {
      message: "Comments and votes must close after idea closure",
      path: ["interactionClosesAt"],
    }
  );

export type UpdateCycleBody = z.infer<typeof updateCycleBodySchema>;

/** Form schema for edit cycle: datetime as strings (DateTimePicker). */
export const updateCycleFormSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(255).transform((s) => s.trim()),
    categoryIds: z.array(z.string().uuid()).min(1, "At least one category is required"),
    ideaSubmissionClosesAt: z.string().min(1),
    interactionClosesAt: z.string().min(1),
  })
  .refine(
    (data) => new Date(data.interactionClosesAt) > new Date(data.ideaSubmissionClosesAt),
    {
      message: "Comments and votes must close after idea closure",
      path: ["interactionClosesAt"],
    }
  );
export type UpdateCycleFormValues = z.infer<typeof updateCycleFormSchema>;

const academicYearRefSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable(),
  isActive: z.boolean(),
});

const categoryRefSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
});

export const submissionCycleSchema = z.object({
  id: z.string().uuid(),
  academicYearId: z.string().uuid(),
  name: z.string().nullable(),
  ideaSubmissionClosesAt: z.coerce.date(),
  interactionClosesAt: z.coerce.date(),
  status: z.enum(CYCLE_STATUS),
  isLocked: z.boolean().optional(),
  wasEverClosed: z.boolean().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  _count: z.object({ ideas: z.number().int().min(0) }).optional(),
  academicYear: academicYearRefSchema,
  categories: z.array(categoryRefSchema),
});

export type SubmissionCycle = z.infer<typeof submissionCycleSchema>;

export const submissionCyclesListResponseSchema = z.array(submissionCycleSchema);
