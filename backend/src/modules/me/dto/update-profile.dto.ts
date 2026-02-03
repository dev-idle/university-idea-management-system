import { z } from 'zod';

/** PATCH /me body. Only fullName, phone, address, gender, dateOfBirth are editable; email, role, department are server-only. */
export const updateProfileBodySchema = z.object({
  fullName: z
    .string()
    .max(255)
    .transform((s) => s.trim() || null)
    .optional(),
  phone: z
    .string()
    .max(30)
    .transform((s) => s.trim() || null)
    .optional(),
  address: z
    .string()
    .max(1000)
    .transform((s) => s.trim() || null)
    .optional(),
  gender: z
    .string()
    .max(50)
    .transform((s) => s.trim() || null)
    .optional(),
  dateOfBirth: z
    .union([
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
      z.literal(''),
    ])
    .optional()
    .transform((s) => (s && s.trim() ? s : null)),
});

export type UpdateProfileBody = z.infer<typeof updateProfileBodySchema>;
