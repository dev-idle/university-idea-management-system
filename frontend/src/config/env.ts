/**
 * Client-safe environment configuration.
 * Only NEXT_PUBLIC_* and build-time vars are exposed; never secrets.
 */

const getEnv = (key: string): string | undefined =>
  typeof process.env[key] !== "undefined" ? process.env[key] : undefined;

/** API base for server-side calls (e.g. Server Actions). In Docker, use http://backend:8001. */
export const API_SERVER_BASE =
  getEnv("API_SERVER_BASE") ?? getEnv("NEXT_PUBLIC_API_BASE") ?? "http://localhost:8001";

export const env = {
  /** Backend API base URL for client (browser). */
  NEXT_PUBLIC_API_BASE:
    getEnv("NEXT_PUBLIC_API_BASE") ?? "http://localhost:8001",
  /** App origin for CSP and redirects. */
  NEXT_PUBLIC_APP_ORIGIN:
    getEnv("NEXT_PUBLIC_APP_ORIGIN") ?? "http://localhost:8000",
  /** API version (must match backend API_VERSION). Default "1" → /api/v1/ */
  NEXT_PUBLIC_API_VERSION: getEnv("NEXT_PUBLIC_API_VERSION") ?? "1",
  NODE_ENV: getEnv("NODE_ENV") ?? "development",
} as const;

export const isProd = env.NODE_ENV === "production";
