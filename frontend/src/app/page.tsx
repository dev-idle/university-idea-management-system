"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { ROUTES, getEntryRouteForRoles } from "@/config/constants";

/**
 * Root route: UX-only redirects. No public page; backend enforces RBAC.
 * Not authenticated → /login. Authenticated → role entry route (one per role).
 */
export default function RootPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) {
      router.replace(ROUTES.LOGIN);
      return;
    }
    const entry = getEntryRouteForRoles(user.roles);
    router.replace(entry);
  }, [user, router]);

  return null;
}
