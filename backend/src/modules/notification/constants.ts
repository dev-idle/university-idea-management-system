/**
 * Notification module constants.
 */

export const NOTIFICATION_QUEUE = 'notifications';

export const EVENTS = {
  IDEA_CREATED: 'idea.created',
  COMMENT_CREATED: 'comment.created',
  COMMENT_REPLIED: 'comment.replied',
} as const;

export const NOTIFICATION_TYPES = {
  IDEA_SUBMITTED: 'idea.submitted',
  COMMENT_ADDED: 'comment.added',
  COMMENT_REPLIED: 'comment.replied',
} as const;

export const MAIL_SUBJECTS = {
  IDEA_SUBMITTED: 'New idea – Review required',
  COMMENT_ADDED: 'New comment on your idea',
  COMMENT_REPLIED: 'Someone replied to your comment',
} as const;

/**
 * BullMQ job options — Upstash command–optimized (2026).
 * - removeOnComplete: true → delete job from Redis as soon as it completes.
 *   Keeps storage ~0 B; no retention of completed jobs.
 * - removeOnFail: 20 → keep max 20 failed jobs for debugging; minimizes keys.
 */
export const QUEUE_JOB_OPTIONS = {
  attempts: 3,
  backoff: { type: 'exponential' as const, delay: 1000 },
  removeOnComplete: true,
  removeOnFail: 20,
} as const;

/**
 * Worker options — Upstash command minimization.
 * - stalledInterval: 300_000 (5 min) → fewer stalled checks vs default 30s.
 * - drainDelay: 10 → long poll when queue empty; fewer Redis round-trips.
 * - concurrency: 1 → default; notification jobs are fast, no need for parallel.
 */
export const WORKER_OPTIONS_UPSTASH = {
  stalledInterval: 300_000,
  drainDelay: 10,
  concurrency: 1,
} as const;

export const DEFAULT_FRONTEND_URL = 'http://localhost:3000';
