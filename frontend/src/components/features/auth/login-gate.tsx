"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { ROUTES, getEntryRouteForRoles } from "@/config/constants";

/**
 * When already authenticated, redirect to role entry route and show "Redirecting…".
 * When not authenticated, render children (login form). UX-only; backend enforces.
 */
export function LoginGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) return;
    const entry = getEntryRouteForRoles(user.roles);
    if (entry === ROUTES.LOGIN) return;
    router.replace(entry);
  }, [user, router]);

  if (user) {
    return null;
  }

  return <>{children}</>;
}
