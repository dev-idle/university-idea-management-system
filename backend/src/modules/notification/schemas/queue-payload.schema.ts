import { z } from 'zod';

/**
 * Zod schemas for queue job payloads. Validates before processing to prevent system overload.
 */

const attachmentLinkSchema = z.object({
  fileName: z.string().min(1).max(512),
  secureUrl: z.string().url(),
});

export const ideaCreatedPayloadSchema = z.object({
  type: z.literal('idea.created'),
  ideaId: z.string().uuid(),
  ideaTitle: z
    .string()
    .min(1)
    .max(500)
    .transform((s) => s.trim()),
  departmentId: z.string().uuid(),
  departmentName: z.string().min(1).max(255).optional(),
  submitterDisplayName: z
    .string()
    .min(1)
    .max(255)
    .transform((s) => s.trim()),
  submitterEmail: z.string().email().optional(),
  isAnonymous: z.boolean().default(true),
  attachmentLinks: z.array(attachmentLinkSchema).default([]),
});

export const commentCreatedPayloadSchema = z.object({
  type: z.literal('comment.created'),
  ideaId: z.string().uuid(),
  ideaTitle: z
    .string()
    .min(1)
    .max(500)
    .transform((s) => s.trim()),
  commentId: z.string().uuid(),
  recipientUserId: z.string().uuid(),
  commenterDisplayName: z
    .string()
    .min(1)
    .max(255)
    .transform((s) => s.trim()),
  commenterEmail: z.string().email().optional(),
  isAnonymous: z.boolean().default(false),
});

export const commentRepliedPayloadSchema = z.object({
  type: z.literal('comment.replied'),
  ideaId: z.string().uuid(),
  ideaTitle: z
    .string()
    .min(1)
    .max(500)
    .transform((s) => s.trim()),
  commentId: z.string().uuid(),
  parentCommentId: z.string().uuid(),
  recipientUserId: z.string().uuid(),
  replierDisplayName: z
    .string()
    .min(1)
    .max(255)
    .transform((s) => s.trim()),
  replierEmail: z.string().email().optional(),
  isAnonymous: z.boolean().default(false),
});

export const ideaDeletedPayloadSchema = z.object({
  type: z.literal('idea.deleted'),
  ideaId: z.string().uuid(),
  ideaTitle: z
    .string()
    .min(1)
    .max(500)
    .transform((s) => s.trim()),
  recipientUserId: z.string().uuid(),
  recipientEmail: z.string().email(),
  recipientDisplayName: z
    .string()
    .min(1)
    .max(255)
    .transform((s) => s.trim()),
});

export const notificationJobPayloadSchema = z.discriminatedUnion('type', [
  ideaCreatedPayloadSchema,
  ideaDeletedPayloadSchema,
  commentCreatedPayloadSchema,
  commentRepliedPayloadSchema,
]);

export type IdeaCreatedPayload = z.infer<typeof ideaCreatedPayloadSchema>;
export type IdeaDeletedPayload = z.infer<typeof ideaDeletedPayloadSchema>;
export type CommentCreatedPayload = z.infer<typeof commentCreatedPayloadSchema>;
export type CommentRepliedPayload = z.infer<typeof commentRepliedPayloadSchema>;
export type NotificationJobPayload = z.infer<
  typeof notificationJobPayloadSchema
>;
