import { z } from 'zod';

export const listResourcesQuerySchema = z.object({
  prefix: z.string().max(256).optional().default('idea-attachments'),
  resource_type: z
    .enum(['image', 'video', 'raw', 'auto'])
    .optional()
    .default('raw'),
  max_results: z.coerce
    .number()
    .int()
    .min(1)
    .max(500)
    .optional()
    .default(100),
  next_cursor: z.string().max(500).optional(),
});

export type ListResourcesQuery = z.infer<typeof listResourcesQuerySchema>;
