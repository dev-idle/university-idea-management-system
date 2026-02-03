"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import { profileSchema, type Profile } from "@/lib/schemas/profile.schema";
import { useAuthStore } from "@/stores/auth.store";

function parseProfile(data: unknown): Profile {
  const parsed = profileSchema.safeParse(data);
  if (!parsed.success) throw new Error("Invalid profile response");
  return parsed.data;
}

/**
 * TanStack Query: fetch GET /me with Bearer token and silent refresh on 401.
 * Do NOT store profile in Zustand; auth store holds token + minimal user only.
 */
export function useProfileQuery(options?: { enabled?: boolean }) {
  const isAuthenticated = useAuthStore((s) => !!s.accessToken);

  return useQuery({
    queryKey: queryKeys.profile.me(),
    queryFn: async () => {
      const data = await fetchWithAuth<unknown>("me");
      return parseProfile(data);
    },
    enabled: options?.enabled !== false && isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}
