import { z } from 'zod';

export const likeCommentBodySchema = z.object({
  value: z.enum(['up', 'down']),
});
export type LikeCommentBody = z.infer<typeof likeCommentBodySchema>;
