import { z } from 'zod';

/**
 * Environment variables schema (Zod). Validated at bootstrap.
 * Add required vars here; optional with .optional() or .default().
 */
export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().url(),
  API_PREFIX: z.string().min(1).default('api'),
  JWT_SECRET: z.string().min(1).optional(),
  JWT_EXPIRES_IN: z.string().default('7d'),
  THROTTLE_TTL: z.coerce.number().int().positive().default(60),
  THROTTLE_LIMIT: z.coerce.number().int().positive().default(100),
});

export type Env = z.infer<typeof envSchema>;
