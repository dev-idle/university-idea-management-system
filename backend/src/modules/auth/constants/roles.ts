/**
 * Fixed, authoritative roles. Backend RBAC uses this table only.
 * Do not trust client-supplied roles; JWT roles are set at login from DB.
 */
export const ROLES = [
  'ADMIN',
  'QA_MANAGER',
  'QA_COORDINATOR',
  'STAFF',
] as const;

export type Role = (typeof ROLES)[number];

export function isRole(value: string): value is Role {
  return ROLES.includes(value as Role);
}

/**
 * Permissions granted by the role table. Applied exactly per table.
 */
export const PERMISSIONS = [
  'SYSTEM_CONFIG',
  'USERS',
  'DEPARTMENTS',
  'ACADEMIC_YEARS',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

/**
 * Role → Permission table. Authoritative; enforce exactly.
 * ADMIN: system configuration, users, departments, academic years.
 */
export const ROLE_PERMISSION_TABLE: Readonly<
  Record<Role, readonly Permission[]>
> = {
  ADMIN: ['SYSTEM_CONFIG', 'USERS', 'DEPARTMENTS', 'ACADEMIC_YEARS'],
  QA_MANAGER: [],
  QA_COORDINATOR: [],
  STAFF: [],
};

export function getRolesWithPermission(
  permission: Permission,
): readonly Role[] {
  return (ROLES as readonly Role[]).filter((role) =>
    ROLE_PERMISSION_TABLE[role].includes(permission),
  );
}

export function hasPermission(role: string, permission: Permission): boolean {
  if (!isRole(role)) return false;
  return ROLE_PERMISSION_TABLE[role].includes(permission);
}
