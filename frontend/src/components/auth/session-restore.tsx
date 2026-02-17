"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LoadingState } from "@/components/ui/loading-state";
import { useAuthStore } from "@/stores/auth.store";
import { refreshAction } from "@/actions/auth.actions";
import { ROUTES, getEntryRouteForRoles } from "@/config/constants";

/**
 * On app load: no /auth/me. Try POST /auth/refresh when there is no access token.
 * If refresh succeeds: store token + user in Zustand; if on / or /login, redirect by role.
 * If refresh fails: redirect to /login (login page never flashes for authenticated users).
 */
export function SessionRestore({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const [restoring, setRestoring] = useState(false);
  const triedRestore = useRef(false);

  useEffect(() => {
    if (accessToken && user) {
      if (pathname === "/" || pathname === "/login") {
        const entry = getEntryRouteForRoles(user.roles);
        if (entry !== ROUTES.LOGIN) router.replace(entry);
      }
      return;
    }

    if (triedRestore.current) return;
    triedRestore.current = true;
    queueMicrotask(() => setRestoring(true));

    refreshAction()
      .then((result) => {
        if (result.ok) {
          setAuth(result.data.accessToken, result.data.user);
          if (pathname === "/" || pathname === "/login") {
            const entry = getEntryRouteForRoles(result.data.user.roles);
            if (entry !== ROUTES.LOGIN) router.replace(entry);
          }
        } else {
          router.replace(ROUTES.LOGIN);
        }
      })
      .catch(() => {
        router.replace(ROUTES.LOGIN);
      })
      .finally(() => {
        setRestoring(false);
      });
  }, [accessToken, user, pathname, setAuth, router]);

  if (restoring) {
    return <LoadingState fullScreen />;
  }

  return <>{children}</>;
}
