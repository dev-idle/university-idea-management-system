/**
 * Notification module constants.
 */

export const NOTIFICATION_QUEUE = 'notifications';

export const EVENTS = {
  IDEA_CREATED: 'idea.created',
  COMMENT_CREATED: 'comment.created',
} as const;

export const NOTIFICATION_TYPES = {
  IDEA_SUBMITTED: 'idea.submitted',
  COMMENT_ADDED: 'comment.added',
} as const;

export const MAIL_SUBJECTS = {
  IDEA_SUBMITTED: 'New idea – Review required',
  COMMENT_ADDED: 'New comment on your idea',
} as const;

/**
 * BullMQ job options — self-cleaning, Redis-optimized (2026).
 * - removeOnComplete: true → delete job from Redis as soon as it completes.
 *   Keeps storage ~0 B; no retention of completed jobs.
 * - removeOnFail: 1000 → keep max 1000 failed jobs for debugging; older ones deleted.
 */
export const QUEUE_JOB_OPTIONS = {
  attempts: 3,
  backoff: { type: 'exponential' as const, delay: 1000 },
  removeOnComplete: true,
  removeOnFail: 1000,
} as const;

export const DEFAULT_FRONTEND_URL = 'http://localhost:3000';
export const DEFAULT_MAILTRAP_URL = 'https://mailtrap.io/inboxes';
