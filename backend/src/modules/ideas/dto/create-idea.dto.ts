import { z } from 'zod';

const attachmentRefSchema = z.object({
  cloudinaryPublicId: z.string().min(1).max(255),
  secureUrl: z.string().url().max(1024),
  fileName: z.string().min(1).max(512),
  mimeType: z.string().max(128).optional(),
  sizeBytes: z.number().int().positive().optional(),
});

export const createIdeaBodySchema = z.object({
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
  cycleId: z.string().uuid(),
  isAnonymous: z.boolean(),
  termsAccepted: z.literal(true, {
    errorMap: () => ({
      message: 'You must accept the Terms and Conditions to submit.',
    }),
  }),
  attachments: z.array(attachmentRefSchema).max(10).optional().default([]),
});

export type CreateIdeaBody = z.infer<typeof createIdeaBodySchema>;

/** Body for POST ideas/attachments/preview (view unsaved attachment by URL). */
export const previewAttachmentBodySchema = z.object({
  secureUrl: z.string().url().max(1024),
  fileName: z.string().min(1).max(512),
  mimeType: z.string().max(128).optional(),
});
export type PreviewAttachmentBody = z.infer<typeof previewAttachmentBodySchema>;
