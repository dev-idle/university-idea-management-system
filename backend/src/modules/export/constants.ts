/**
 * Export module constants.
 * Redis: BullMQ queue only (minimal). No file storage in Redis.
 * Files stored in Cloudinary.
 */

export const EXPORT_QUEUE = 'export';

/**
 * Job options: minimal retention, Redis-optimized (2026).
 * - removeOnComplete: true → delete job from Redis as soon as it completes.
 * - removeOnFail: 50 → keep max 50 failed jobs for debugging.
 */
export const EXPORT_JOB_OPTIONS = {
  attempts: 2,
  backoff: { type: 'exponential' as const, delay: 5000 },
  removeOnComplete: true,
  removeOnFail: 50,
  jobId: undefined as string | undefined,
} as const;
