/**
 * Shared constants (auth cookie name must match backend).
 */

export const AUTH = {
  /** Cookie name for refresh token (must match backend COOKIE_REFRESH_NAME). */
  REFRESH_COOKIE_NAME: "refreshToken",
  /** Path scope for refresh cookie (backend uses /api/auth). */
  REFRESH_COOKIE_PATH: "/api/auth",
  /** API prefix for backend (must match backend API_PREFIX). */
  API_PREFIX: "api",
} as const;

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  IDEAS: "/ideas",
  ADMIN_USERS: "/admin/users",
  ADMIN_DEPARTMENTS: "/admin/departments",
  ADMIN_ACADEMIC_YEARS: "/admin/academic-years",
} as const;
