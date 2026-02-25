/**
 * Frontend RBAC: UX only. Backend is the sole authority; never trust frontend for authz.
 * Use to hide/show UI; all enforcement is on the backend.
 */

/** Mirror backend ROLES; used only for UI visibility. */
export const ROLES = ["ADMIN", "QA_MANAGER", "QA_COORDINATOR", "STAFF"] as const;

export type Role = (typeof ROLES)[number];

export function isRole(value: string): value is Role {
  return ROLES.includes(value as Role);
}

/** Mirror backend PERMISSIONS; UX only. */
export const PERMISSIONS = [
  "SYSTEM_CONFIG",
  "USERS",
  "DEPARTMENTS",
  "ACADEMIC_YEARS",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

/** Role → Permission (mirror backend ROLE_PERMISSION_TABLE). UX only. */
export const ROLE_PERMISSION_TABLE: Readonly<Record<Role, readonly Permission[]>> = {
  ADMIN: ["SYSTEM_CONFIG", "USERS", "DEPARTMENTS", "ACADEMIC_YEARS"],
  QA_MANAGER: [],
  QA_COORDINATOR: [],
  STAFF: [],
};

export function hasPermission(roles: string[] | undefined, permission: Permission): boolean {
  if (!roles?.length) return false;
  return roles.some((role) => isRole(role) && ROLE_PERMISSION_TABLE[role].includes(permission));
}

export function hasRole(roles: string[] | undefined, role: Role): boolean {
  return roles?.includes(role) ?? false;
}

/** True when user has only STAFF (no Admin/QA Manager/QA Coordinator). Used for Staff-specific UI (e.g. Profile layout). */
export function isStaffOnly(roles: string[] | undefined): boolean {
  if (!roles?.length) return false;
  const upper = roles.map((r) => String(r).trim().toUpperCase());
  const hasStaff = upper.includes("STAFF");
  const hasManagement =
    upper.includes("ADMIN") || upper.includes("QA_MANAGER") || upper.includes("QA_COORDINATOR");
  return hasStaff && !hasManagement;
}

/** Human-readable role labels for header/sidebar (UX only). */
export const ROLE_LABELS: Readonly<Record<Role, string>> = {
  ADMIN: "Admin",
  QA_MANAGER: "QA Manager",
  QA_COORDINATOR: "QA Coordinator",
  STAFF: "Staff",
};

export function getRoleLabel(role: Role): string {
  return ROLE_LABELS[role];
}
