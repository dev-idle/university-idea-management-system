import { z } from 'zod';

export const updateCycleBodySchema = z
  .object({
    name: z.string().max(255).optional().transform((s) => (s != null && s.trim() !== '' ? s.trim() : undefined)),
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
      message: 'Comments & votes close must be after idea submission closure',
      path: ['interactionClosesAt'],
    },
  );

export const cycleIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type UpdateCycleBody = z.infer<typeof updateCycleBodySchema>;
export type CycleIdParam = z.infer<typeof cycleIdParamSchema>;
