"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { ROUTES, getEntryRouteForRoles } from "@/config/constants";
import { LoadingState } from "@/components/ui/loading-state";

/**
 * When already authenticated, redirect to role entry route and show "Redirecting…".
 * When not authenticated, render children (login form). UX-only; backend enforces.
 *
 * Portal for redirect overlay: renders at body level to cover full viewport,
 * preventing layout jump (left panel background appearing to shift) during route transition.
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

  // Only show "Redirecting…" when we have a valid redirect target.
  // If entry === ROUTES.LOGIN (no valid role), we'd never redirect → avoid infinite loading.
  const entry = user ? getEntryRouteForRoles(user.roles) : null;
  if (user && entry && entry !== ROUTES.LOGIN) {
    if (typeof document !== "undefined") {
      return createPortal(<LoadingState fullScreen instant />, document.body);
    }
    return <LoadingState fullScreen instant />;
  }

  return <>{children}</>;
}
