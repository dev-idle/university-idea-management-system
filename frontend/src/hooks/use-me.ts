"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import { authUserSchema, type AuthUser } from "@/lib/schemas/auth.schema";
import { useAuthStore } from "@/stores/auth.store";

/** Response from GET /auth/me */
function parseMe(data: unknown): AuthUser {
  const parsed = authUserSchema.safeParse(data);
  if (!parsed.success) throw new Error("Invalid me response");
  return parsed.data;
}

/**
 * TanStack Query: fetch /auth/me with Bearer token and silent refresh on 401.
 * On success, syncs user to auth store (in-memory). Use when you need to
 * validate token or refresh user info without full re-login.
 */
export function useMeQuery(options?: { enabled?: boolean }) {
  const isAuthenticated = useAuthStore((s) => !!s.accessToken);
  const setAuth = useAuthStore((s) => s.setAuth);

  const query = useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      const user = await fetchWithAuth<AuthUser>("auth/me").then(parseMe);
      const token = useAuthStore.getState().accessToken;
      setAuth(token ?? "", user);
      return user;
    },
    enabled: options?.enabled !== false && isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  return query;
}
