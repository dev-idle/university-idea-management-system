import { z } from 'zod';

/**
 * DTO for updating an own idea (STAFF only).
 * All text fields are required (full replacement, not partial).
 */
export const updateIdeaBodySchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(500)
    .transform((s) => s.trim()),
  description: z
    .string()
    .min(1, 'Content is required.')
    .max(10000)
    .transform((s) => s.trim()),
  categoryId: z.string().uuid(),
  isAnonymous: z.boolean(),
});

export type UpdateIdeaBody = z.infer<typeof updateIdeaBodySchema>;

/**
 * DTO for adding an attachment to an own idea (STAFF only).
 * Matches the shape returned by the upload proxy endpoint.
 */
export const addAttachmentBodySchema = z.object({
  cloudinaryPublicId: z.string().min(1).max(255),
  secureUrl: z.string().url().max(1024),
  fileName: z.string().min(1).max(512),
  mimeType: z.string().max(128).optional(),
  sizeBytes: z.number().int().positive().optional(),
});

export type AddAttachmentBody = z.infer<typeof addAttachmentBodySchema>;
