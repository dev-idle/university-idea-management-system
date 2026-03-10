import { z } from 'zod';

const sortEnum = z.enum([
  'latest',
  'mostPopular',
  'mostViewed',
  'latestComments',
  'mostComments',
]);

export const findIdeasQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: sortEnum.optional().default('latest'),
  categoryId: z
    .union([z.string().uuid(), z.literal('')])
    .optional()
    .transform((v) => (v && v.trim() ? v : undefined)),
  cycleId: z
    .union([z.string().uuid(), z.literal('')])
    .optional()
    .transform((v) => (v && v.trim() ? v : undefined)),
  departmentId: z
    .union([z.string().uuid(), z.literal('')])
    .optional()
    .transform((v) => (v && v.trim() ? v : undefined)),
});

export type FindIdeasQuery = z.infer<typeof findIdeasQuerySchema>;
