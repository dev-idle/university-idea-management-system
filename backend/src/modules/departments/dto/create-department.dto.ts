import { z } from 'zod';

export const createDepartmentBodySchema = z.object({
  name: z.string().min(1).max(255),
});

export type CreateDepartmentBody = z.infer<typeof createDepartmentBodySchema>;
