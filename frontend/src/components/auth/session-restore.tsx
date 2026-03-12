"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LoadingState } from "@/components/ui/loading-state";
import { useAuthStore } from "@/stores/auth.store";
import { refreshAction } from "@/actions/auth.actions";
import { ROUTES, getEntryRouteForRoles } from "@/config/constants";

/** Pages that allow unauthenticated access — never redirect to /login. */
const PUBLIC_AUTH_PAGES = [ROUTES.FORGOT_PASSWORD, ROUTES.RESET_PASSWORD];

const AUTH_ENTRY_PAGES = ["/", ROUTES.LOGIN] as const;

function isPublicAuthPage(pathname: string): boolean {
  return PUBLIC_AUTH_PAGES.some((p) => pathname === p);
}

/** True when we should redirect authenticated user from auth entry page to role dashboard. */
function shouldRedirectFromAuthEntry(pathname: string, entry: string): boolean {
  return AUTH_ENTRY_PAGES.includes(pathname as (typeof AUTH_ENTRY_PAGES)[number]) && entry !== ROUTES.LOGIN;
}

/**
 * On app load: no /auth/me. Try POST /auth/refresh when there is no access token.
 * If refresh succeeds: store token + user in Zustand; if on / or /login, redirect by role.
 * If refresh fails: redirect to /login — except on forgot/reset-password (user may have clicked email link).
 * Starts with restoring=true to avoid flash of content before we know auth state.
 *
 * Sign-out cycle fix: triedRestore persists across re-renders. When user signs out
 * (accessToken/user → null), effect re-runs. If we returned early without setRestoring(false),
 * restoring would stay true forever → infinite loading. We must call setRestoring(false)
 * when no auth and already tried restore (either refresh failed or user signed out).
 */
export function SessionRestore({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const [restoring, setRestoring] = useState(true);
  const triedRestore = useRef(false);

  useEffect(() => {
    const publicPage = isPublicAuthPage(pathname);

    // Already authenticated: stop loading, optionally redirect
    if (accessToken && user) {
      const entry = getEntryRouteForRoles(user.roles);
      if (shouldRedirectFromAuthEntry(pathname, entry)) {
        router.replace(entry);
        return;
      }
      queueMicrotask(() => setRestoring(false));
      return;
    }

    // No auth: either first load (try refresh) or post sign-out (already tried once)
    if (triedRestore.current) {
      queueMicrotask(() => setRestoring(false));
      return;
    }
    triedRestore.current = true;

    let cancelled = false;

    refreshAction()
      .then((result) => {
        if (cancelled) return;
        if (result.ok) {
          setAuth(result.data.accessToken, result.data.user);
          const entry = getEntryRouteForRoles(result.data.user.roles);
          if (shouldRedirectFromAuthEntry(pathname, entry)) {
            router.replace(entry);
            return;
          }
          setRestoring(false);
        } else {
          if (!publicPage) router.replace(ROUTES.LOGIN);
          setRestoring(false);
        }
      })
      .catch(() => {
        if (cancelled) return;
        if (!publicPage) router.replace(ROUTES.LOGIN);
        setRestoring(false);
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken, user, pathname, setAuth, router]);

  // Show loading when restoring OR when we have auth and are about to redirect.
  // The latter avoids a render where we'd show LoginGate "Redirecting…" before effect runs
  // (effect runs after render, so we'd briefly show LoginGate → then SessionRestore loading = double).
  const isRedirectingAuth =
    !!(accessToken && user && shouldRedirectFromAuthEntry(pathname, getEntryRouteForRoles(user.roles)));
  if (restoring || isRedirectingAuth) {
    return <LoadingState fullScreen instant={isRedirectingAuth} />;
  }

  return <>{children}</>;
}
