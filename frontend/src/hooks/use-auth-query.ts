"use client";

/**
 * TanStack Query fetcher that uses fetchWithAuth (Bearer + silent refresh on 401).
 * Use as queryFn: () => authQueryFetcher<T>(path)
 */

import { fetchWithAuth } from "@/lib/api/client";

export async function authQueryFetcher<T>(path: string): Promise<T> {
  return fetchWithAuth<T>(path);
}
