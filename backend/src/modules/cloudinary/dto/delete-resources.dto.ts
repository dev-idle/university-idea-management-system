import { z } from 'zod';

export const deleteResourcesBodySchema = z.object({
  publicIds: z.array(z.string().min(1).max(255)).min(1).max(100),
  resource_type: z.enum(['image', 'video', 'raw']).optional().default('raw'),
});

export type DeleteResourcesBody = z.infer<typeof deleteResourcesBodySchema>;
