"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { hasRole } from "@/lib/rbac";
import { useAuthStore } from "@/stores/auth.store";
import { ROUTES } from "@/config/constants";

/**
 * Redirects QA Coordinator from /department-members to /qa-coordinator/department-members.
 * Keeps URL structure consistent with sidebar.
 */
export function DepartmentMembersRedirect({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isQaCoordinator = hasRole(user?.roles, "QA_COORDINATOR");

  useEffect(() => {
    if (isQaCoordinator) {
      router.replace(ROUTES.QA_COORDINATOR_DEPARTMENT);
    }
  }, [isQaCoordinator, router]);

  if (isQaCoordinator) return null;
  return <>{children}</>;
}
