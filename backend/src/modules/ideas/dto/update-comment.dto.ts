import { z } from 'zod';

export const updateCommentBodySchema = z.object({
  content: z
    .string()
    .min(1, 'Content is required.')
    .max(2000)
    .transform((s) => s.trim()),
});
export type UpdateCommentBody = z.infer<typeof updateCommentBodySchema>;
