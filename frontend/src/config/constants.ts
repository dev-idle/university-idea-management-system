import { isRole, type Role } from "@/lib/rbac";

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

/** Role entry routes: one dashboard per role, no shared dashboards. */
export const ROUTES = {
  LOGIN: "/login",
  /** Admin → /admin/dashboard (only entry for ADMIN). */
  ADMIN_DASHBOARD: "/admin/dashboard",
  /** University QA Manager → /qa-manager/dashboard. */
  QA_MANAGER_DASHBOARD: "/qa-manager/dashboard",
  /** QA Manager categories management. */
  QA_MANAGER_CATEGORIES: "/qa-manager/categories",
  /** QA Manager idea submission cycles. */
  QA_MANAGER_SUBMISSION_CYCLES: "/qa-manager/submission-cycles",
  /** QA Coordinator → /qa-coordinator/dashboard. */
  QA_COORDINATOR_DASHBOARD: "/qa-coordinator/dashboard",
  /** Ideas: Staff Ideas Hub. Staff are routed here after login (no separate /staff page). */
  IDEAS: "/ideas",
  /** Staff: Submit new idea (full-page creative mode). */
  IDEAS_NEW: "/ideas/new",
  /** Staff: My Ideas (manage own submissions). */
  MY_IDEAS: "/ideas/my",
  ADMIN_USERS: "/admin/users",
  ADMIN_DEPARTMENTS: "/admin/departments",
  ADMIN_ACADEMIC_YEARS: "/admin/academic-years",
  /** Profile: all authenticated users. */
  PROFILE: "/profile",
} as const;

/** Priority order for redirect when user has multiple roles (highest first). */
const ROLE_ENTRY_PRIORITY: Role[] = ["ADMIN", "QA_MANAGER", "QA_COORDINATOR", "STAFF"];

const ROLE_TO_ENTRY: Record<Role, string> = {
  ADMIN: ROUTES.ADMIN_DASHBOARD,
  QA_MANAGER: ROUTES.QA_MANAGER_DASHBOARD,
  QA_COORDINATOR: ROUTES.QA_COORDINATOR_DASHBOARD,
  STAFF: ROUTES.IDEAS,
};

/**
 * UX-only: redirect path for authenticated user by role.
 * Each account has exactly one role; we take the first known role.
 * Normalizes role (trim, uppercase) to match backend. Returns ROUTES.LOGIN only when no valid role (e.g. unauthenticated).
 */
export function getEntryRouteForRoles(roles: string[] | undefined): string {
  const normalized = (roles ?? [])
    .map((r) => String(r).trim().toUpperCase())
    .filter((r): r is Role => isRole(r));
  if (!normalized.length) return ROUTES.LOGIN;
  return ROLE_TO_ENTRY[normalized[0]];
}

/** Path prefixes/routes allowed per role (UX-only; backend enforces). Each user has one role. */
const ROLE_ALLOWED_PATHS: Record<Role, string[]> = {
  ADMIN: ["/admin", "/profile"],
  QA_MANAGER: ["/qa-manager", "/qa-manager/categories", "/qa-manager/submission-cycles", "/profile"],
  QA_COORDINATOR: ["/qa-coordinator", "/profile"],
  STAFF: ["/ideas", "/profile"],
};

/**
 * UX-only: primary role for user (one role per account). Returns first known role or null.
 */
export function getPrimaryRole(roles: string[] | undefined): Role | null {
  const normalized = (roles ?? [])
    .map((r) => String(r).trim().toUpperCase())
    .filter((r): r is Role => isRole(r));
  return normalized[0] ?? null;
}

/**
 * UX-only: true if pathname is allowed for the given role. Disable access to other roles' routes.
 */
export function isPathAllowedForRole(pathname: string, role: Role): boolean {
  const allowed = ROLE_ALLOWED_PATHS[role];
  return allowed.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );
}
