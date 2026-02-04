import { z } from "zod";

/**
 * Ideas schemas (Zod). Aligned with backend; Staff Idea Submission.
 * Backend enforces STAFF role, active cycle, submission window, terms acceptance.
 */

const categoryRefSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
});

const authorRefSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().nullable(),
  email: z.string().email(),
});

const attachmentRefSchema = z.object({
  id: z.string().uuid(),
  fileName: z.string(),
  secureUrl: z.string().url(),
  mimeType: z.string().nullable(),
  sizeBytes: z.number().int().positive().nullable(),
});

const voteCountsSchema = z.object({
  up: z.number().int().min(0),
  down: z.number().int().min(0),
});

export const ideaSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  isAnonymous: z.boolean(),
  createdAt: z.coerce.date(),
  categoryId: z.string().uuid().nullable(),
  category: categoryRefSchema.nullable(),
  cycleId: z.string().uuid().nullable(),
  author: authorRefSchema.nullable(),
  attachments: z.array(attachmentRefSchema),
  voteCounts: voteCountsSchema.optional().default({ up: 0, down: 0 }),
  myVote: z.enum(["up", "down"]).nullable().optional().default(null),
  interactionClosesAt: z.coerce.date().nullable().optional(),
  commentCount: z.number().int().min(0).optional().default(0),
  viewCount: z.number().int().min(0).optional().default(0),
});

export type Idea = z.infer<typeof ideaSchema>;

export const ideasListResponseSchema = z.array(ideaSchema);
export type IdeasListResponse = z.infer<typeof ideasListResponseSchema>;

export const ideasPaginatedResponseSchema = z.object({
  items: z.array(ideaSchema),
  total: z.number().int().min(0),
});
export type IdeasPaginatedResponse = z.infer<typeof ideasPaginatedResponseSchema>;

const activeAcademicYearRefSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
});

export const ideasContextSchema = z.object({
  canSubmit: z.boolean(),
  activeCycleId: z.string().uuid().nullable(),
  submissionClosesAt: z.coerce.date().nullable(),
  activeAcademicYear: activeAcademicYearRefSchema.nullable(),
  categories: z.array(categoryRefSchema),
});

export type IdeasContext = z.infer<typeof ideasContextSchema>;

/** Attachment ref sent when creating an idea (after Cloudinary upload). */
export const createIdeaAttachmentRefSchema = z.object({
  cloudinaryPublicId: z.string().min(1).max(255),
  secureUrl: z.string().url().max(1024),
  fileName: z.string().min(1).max(512),
  mimeType: z.string().max(128).optional(),
  sizeBytes: z.number().int().positive().optional(),
});

export const createIdeaBodySchema = z.object({
  title: z.string().min(1, "Title is required").max(500).transform((s) => s.trim()),
  description: z
    .string()
    .min(1, "Content is required.")
    .max(10000)
    .transform((s) => s.trim()),
  categoryId: z.string().uuid(),
  cycleId: z.string().uuid(),
  isAnonymous: z.boolean(),
  termsAccepted: z.literal(true, {
    message: "You must accept the Terms and Conditions prior to submission.",
  }),
  attachments: z.array(createIdeaAttachmentRefSchema).max(10).optional().default([]),
});

export type CreateIdeaBody = z.infer<typeof createIdeaBodySchema>;

/** Comment on an idea. Author hidden when isAnonymous. */
export const ideaCommentSchema = z.object({
  id: z.string().uuid(),
  content: z.string(),
  isAnonymous: z.boolean(),
  createdAt: z.coerce.date(),
  author: authorRefSchema.nullable(),
});
export type IdeaComment = z.infer<typeof ideaCommentSchema>;

export const ideaCommentsResponseSchema = z.array(ideaCommentSchema);
export type IdeaCommentsResponse = z.infer<typeof ideaCommentsResponseSchema>;

export const createCommentBodySchema = z.object({
  content: z.string().min(1, "Content is required.").max(2000).transform((s) => s.trim()),
  isAnonymous: z.boolean().default(false),
});
export type CreateCommentBody = z.infer<typeof createCommentBodySchema>;
