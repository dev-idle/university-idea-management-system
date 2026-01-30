import { envSchema, type Env } from './env.schema';

/**
 * Validates merged env (process.env + loaded .env) with Zod.
 * Used by ConfigModule.forRoot({ validate }).
 */
export function validateEnv(config: Record<string, unknown>): Env {
  const merged = { ...process.env, ...config } as Record<string, unknown>;
  return envSchema.parse(merged);
}
