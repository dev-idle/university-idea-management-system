import { z } from 'zod';

export const updateCategoryBodySchema = z.object({
  name: z.string().min(1).max(255).optional(),
});

export const categoryIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type UpdateCategoryBody = z.infer<typeof updateCategoryBodySchema>;
export type CategoryIdParam = z.infer<typeof categoryIdParamSchema>;
