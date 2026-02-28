"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { hasRole } from "@/lib/rbac";
import { useAuthStore } from "@/stores/auth.store";
import { ROUTES } from "@/config/constants";

/**
 * Redirects QA Coordinator / QA Manager from /ideas to their respective Ideas Hub.
 * Keeps URL structure consistent with sidebar.
 */
export function IdeasHubRedirect({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isQaCoordinator = hasRole(user?.roles, "QA_COORDINATOR");
  const isQaManager = hasRole(user?.roles, "QA_MANAGER");

  useEffect(() => {
    if (isQaCoordinator) {
      router.replace(ROUTES.QA_COORDINATOR_IDEAS);
    } else if (isQaManager) {
      router.replace(ROUTES.QA_MANAGER_IDEAS);
    }
  }, [isQaCoordinator, isQaManager, router]);

  if (isQaCoordinator || isQaManager) return null;
  return <>{children}</>;
}
