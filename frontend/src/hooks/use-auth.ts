"use client";

import { useCallback } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { logoutAction, refreshAction } from "@/actions/auth.actions";

/**
 * Login via API route (not Server Action) to avoid Next.js route revalidation,
 * which causes full-page loading when login fails. fetch() does not trigger that.
 */
async function loginViaApi(email: string, password: string) {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "same-origin",
    });
    let body: { ok?: boolean; data?: { accessToken: string; user: { id: string; email: string; roles: string[] } }; error?: string };
    try {
      body = (await res.json()) as typeof body;
    } catch {
      return { ok: false as const, error: "Invalid credentials" };
    }
    if (res.ok && body?.data) {
      return { ok: true as const, data: body.data };
    }
    return { ok: false as const, error: body?.error ?? "Invalid credentials" };
  } catch {
    return { ok: false as const, error: "Invalid credentials" };
  }
}

export function useAuth() {
  const { accessToken, user, setAuth, clearAuth } = useAuthStore();

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await loginViaApi(email, password);
      if (result.ok) {
        setAuth(result.data.accessToken, result.data.user);
        return { ok: true as const };
      }
      return { ok: false as const, error: result.error };
    },
    [setAuth]
  );

  const logout = useCallback(async () => {
    const result = await logoutAction();
    clearAuth();
    return result;
  }, [clearAuth]);

  const refresh = useCallback(async () => {
    const result = await refreshAction();
    if (result.ok) {
      setAuth(result.data.accessToken, result.data.user);
      return { ok: true as const };
    }
    clearAuth();
    return { ok: false as const, error: result.error };
  }, [setAuth, clearAuth]);

  return {
    accessToken,
    user,
    isAuthenticated: !!accessToken && !!user,
    login,
    logout,
    refresh,
  };
}
