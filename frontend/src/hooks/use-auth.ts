"use client";

import { useCallback } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { loginAction, logoutAction, refreshAction } from "@/actions/auth.actions";

export function useAuth() {
  const { accessToken, user, setAuth, clearAuth } = useAuthStore();

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await loginAction({ email, password });
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
