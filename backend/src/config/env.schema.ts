import { z } from 'zod';

/**
 * Environment variables schema (Zod). Validated at bootstrap.
 * Add required vars here; optional with .optional() or .default().
 */
export const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    PORT: z.coerce.number().int().positive().default(3001),
    DATABASE_URL: z.string().url(),
    API_PREFIX: z.string().min(1).default('api'),
    /** API version segment (e.g. "1" → /api/v1/). Used for versioning and cookie path. */
    API_VERSION: z.string().min(1).default('1'),
    JWT_SECRET: z.string().min(1),
    JWT_ACCESS_EXPIRES: z.string().default('15m'),
    JWT_REFRESH_EXPIRES: z.string().default('7d'),
    COOKIE_REFRESH_NAME: z.string().min(1).default('refreshToken'),
    COOKIE_REFRESH_MAX_AGE_DAYS: z.coerce.number().int().positive().default(7),
    THROTTLE_TTL: z.coerce.number().int().positive().default(60),
    THROTTLE_LIMIT: z.coerce.number().int().positive().default(100),
    CORS_ORIGINS: z.string().optional(),
    /** Cloudinary: required for idea supporting-document uploads. */
    CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
    CLOUDINARY_API_KEY: z.string().min(1).optional(),
    CLOUDINARY_API_SECRET: z.string().min(1).optional(),
    /** Redis: BullMQ notification queue (email). e.g. redis://localhost:6379 or Upstash URL */
    REDIS_URL: z.string().min(1).optional(),
    /**
     * Set to "true" or "1" to enable Redis (BullMQ notification/email).
     * Export uses DB-based queue; Redis only for notification.
     */
    REDIS_ENABLED: z
      .string()
      .optional()
      .transform((v) => v === 'true' || v === '1'),
    /** SMTP: for sending notification emails. When unset, email sending is skipped. */
    SMTP_HOST: z.string().min(1).optional(),
    SMTP_PORT: z.coerce.number().int().positive().optional(),
    SMTP_SECURE: z
      .string()
      .optional()
      .transform((v) => v === 'true' || v === '1'),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_FROM: z.string().email().optional(),
    /** Mail (MailerModule): alternative env keys for Brevo and other providers. */
    MAIL_HOST: z.string().min(1).optional(),
    MAIL_PORT: z.coerce.number().int().positive().optional(),
    MAIL_USER: z.string().optional(),
    MAIL_PASS: z.string().optional(),
    /** Optional: inbox URL for viewing sent emails in dev (e.g. Mailtrap). Not used by Brevo. */
    MAILTRAP_INBOX_URL: z.string().url().optional(),
    /** Frontend base URL for notification links. */
    FRONTEND_URL: z.string().url().optional(),
    /** Sentry DSN for error monitoring. When unset or empty, Sentry is disabled. */
    SENTRY_DSN: z
      .string()
      .optional()
      .transform((v) => (v && v.trim() ? v : undefined))
      .pipe(z.string().url().optional()),
    /** Sentry traces sample rate (0–1). Optional. */
    SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).optional(),
    /** Sentry environment name. When unset, uses NODE_ENV. */
    SENTRY_ENVIRONMENT: z.string().min(1).optional(),
    /** Upload: comma-separated allowed MIME types. When unset, uses built-in safe defaults. */
    UPLOAD_ALLOWED_MIME_TYPES: z.string().optional(),
  })
  .refine(
    (data) =>
      data.NODE_ENV !== 'production' ||
      (data.CORS_ORIGINS != null && data.CORS_ORIGINS.trim().length > 0),
    {
      message:
        'CORS_ORIGINS is required in production (comma-separated allowed origins)',
      path: ['CORS_ORIGINS'],
    },
  );

export type Env = z.infer<typeof envSchema>;
