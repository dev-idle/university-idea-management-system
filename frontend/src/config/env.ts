/**
 * Client-safe environment configuration.
 * Only NEXT_PUBLIC_* and build-time vars are exposed; never secrets.
 */

const getEnv = (key: string): string | undefined =>
  typeof process.env[key] !== "undefined" ? process.env[key] : undefined;

export const env = {
  /** Backend API base URL (same-origin proxy or absolute). */
  NEXT_PUBLIC_API_BASE:
    getEnv("NEXT_PUBLIC_API_BASE") ?? "http://localhost:3001",
  /** App origin for CSP and redirects. */
  NEXT_PUBLIC_APP_ORIGIN:
    getEnv("NEXT_PUBLIC_APP_ORIGIN") ?? "http://localhost:3000",
  /** API version (must match backend API_VERSION). Default "1" → /api/v1/ */
  NEXT_PUBLIC_API_VERSION: getEnv("NEXT_PUBLIC_API_VERSION") ?? "1",
  NODE_ENV: getEnv("NODE_ENV") ?? "development",
} as const;

export const isProd = env.NODE_ENV === "production";
