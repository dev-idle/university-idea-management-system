import { z } from 'zod';

export const createCommentBodySchema = z.object({
  content: z
    .string()
    .min(1, 'Content is required.')
    .max(2000)
    .transform((s) => s.trim()),
  isAnonymous: z.boolean().default(false),
  parentCommentId: z.string().uuid().optional(),
});
export type CreateCommentBody = z.infer<typeof createCommentBodySchema>;
