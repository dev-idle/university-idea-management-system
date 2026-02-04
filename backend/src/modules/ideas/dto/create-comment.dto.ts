import { z } from 'zod';

export const createCommentBodySchema = z.object({
  content: z.string().min(1, 'Content is required.').max(2000).transform((s) => s.trim()),
  isAnonymous: z.boolean().default(false),
});
export type CreateCommentBody = z.infer<typeof createCommentBodySchema>;
