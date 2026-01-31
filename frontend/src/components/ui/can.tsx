"use client";

/**
 * UX-only: show children when user has permission. Backend remains authority.
 * Use for hiding nav items, buttons, etc.; never for security.
 */

import { hasPermission, type Permission } from "@/lib/rbac";
import { useAuthStore } from "@/stores/auth.store";

export interface CanProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function Can({ permission, children, fallback = null }: CanProps) {
  const user = useAuthStore((s) => s.user);
  const allowed = hasPermission(user?.roles, permission);
  return allowed ? <>{children}</> : <>{fallback}</>;
}
