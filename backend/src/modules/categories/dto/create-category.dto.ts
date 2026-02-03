import { z } from 'zod';

export const createCategoryBodySchema = z.object({
  name: z.string().min(1).max(255),
});

export type CreateCategoryBody = z.infer<typeof createCategoryBodySchema>;
