import { z } from 'zod';
import { ROLES } from '../../auth/constants/roles';

export const createUserBodySchema = z.object({
  email: z.string().email().max(255),
  fullName: z.string().max(255).optional().nullable(),
  password: z.string().min(8).max(128),
  role: z.enum(ROLES as unknown as [string, ...string[]]),
  departmentId: z.string().uuid(),
});

export type CreateUserBody = z.infer<typeof createUserBodySchema>;
