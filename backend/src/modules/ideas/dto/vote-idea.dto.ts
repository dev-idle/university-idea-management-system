import { z } from 'zod';

export const voteIdeaBodySchema = z.object({
  value: z.enum(['up', 'down']),
});
export type VoteIdeaBody = z.infer<typeof voteIdeaBodySchema>;
