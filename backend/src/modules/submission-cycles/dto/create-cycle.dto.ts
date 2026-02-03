import { z } from 'zod';

/** Default: 14 days after idea submission close. */
export const DEFAULT_INTERACTION_DAYS = 14;

export const createCycleBodySchema = z
  .object({
    academicYearId: z.string().uuid(),
    name: z.string().min(1, 'Name is required').max(255).transform((s) => s.trim()),
    categoryIds: z.array(z.string().uuid()).min(1, 'At least one category is required'),
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
      message: 'Comments & votes close must be after idea submission closure',
      path: ['interactionClosesAt'],
    },
  );

export type CreateCycleBody = z.infer<typeof createCycleBodySchema>;
