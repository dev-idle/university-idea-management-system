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
    JWT_SECRET: z.string().min(1).optional(),
    JWT_ACCESS_EXPIRES: z.string().default('15m'),
    JWT_REFRESH_EXPIRES: z.string().default('7d'),
    COOKIE_REFRESH_NAME: z.string().min(1).default('refreshToken'),
    COOKIE_REFRESH_MAX_AGE_DAYS: z.coerce.number().int().positive().default(7),
    THROTTLE_TTL: z.coerce.number().int().positive().default(60),
    THROTTLE_LIMIT: z.coerce.number().int().positive().default(100),
    CORS_ORIGINS: z.string().optional(),
  })
  .refine(
    (data) =>
      data.NODE_ENV !== 'production' ||
      (data.JWT_SECRET != null && data.JWT_SECRET.length > 0),
    { message: 'JWT_SECRET is required in production', path: ['JWT_SECRET'] },
  );

export type Env = z.infer<typeof envSchema>;
