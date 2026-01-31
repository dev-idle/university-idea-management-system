/**
 * API client: all calls attach Bearer token from in-memory store and support
 * silent refresh on 401. Auth state is in-memory only (Zustand); never localStorage/cookies.
 */

import { env } from "@/config/env";
import { AUTH } from "@/config/constants";

function getBaseUrl(): string {
  // Use NEXT_PUBLIC_API_BASE in both browser and server so API calls always hit the backend.
  return env.NEXT_PUBLIC_API_BASE;
}

export function getApiUrl(path: string): string {
  const base = getBaseUrl();
  const normalized = path.startsWith("/") ? path.slice(1) : path;
  const apiPath = normalized.startsWith("api/")
    ? `/${normalized}`
    : `/${AUTH.API_PREFIX}/${normalized}`;
  return `${base}${apiPath}`;
}

export interface RequestConfig extends RequestInit {
  accessToken?: string | null;
}

/**
 * Raw API call (no auth, no refresh). Use for Server Components / Server Actions
 * or when you pass token explicitly.
 */
export async function apiClient<T>(path: string, config: RequestConfig = {}): Promise<T> {
  const { accessToken, headers: customHeaders, ...init } = config;
  const url = getApiUrl(path);
  const headers = new Headers(customHeaders ?? {});
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, {
    ...init,
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }

  const contentType = res.headers.get("Content-Type");
  if (contentType?.includes("application/json")) {
    return res.json() as Promise<T>;
  }
  return res.text() as unknown as T;
}

/**
 * Client-only: fetch with in-memory access token and silent refresh on 401.
 * Use in TanStack Query queryFn / mutationFn. Attaches Bearer token; on 401
 * calls refresh, updates store, retries once.
 */
export async function fetchWithAuth<T>(path: string, init?: RequestInit): Promise<T> {
  if (typeof window === "undefined") {
    throw new Error("fetchWithAuth must be used in the browser");
  }

  const { useAuthStore } = await import("@/stores/auth.store");
  const { refreshAction } = await import("@/actions/auth.actions");

  const store = useAuthStore.getState();
  let token = store.accessToken;

  const doFetch = async (): Promise<Response> => {
    const url = getApiUrl(path);
    const headers = new Headers(init?.headers);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    return fetch(url, {
      ...init,
      headers,
      credentials: "include",
    });
  };

  let res = await doFetch();

  if (res.status === 401) {
    const result = await refreshAction();
    if (result.ok) {
      store.setAuth(result.data.accessToken, result.data.user);
      token = result.data.accessToken;
      res = await doFetch();
    } else {
      store.clearAuth();
      const text = await res.text();
      throw new Error(`Unauthorized: ${text || "Refresh failed"}`);
    }
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }

  const contentType = res.headers.get("Content-Type");
  if (contentType?.includes("application/json")) {
    return res.json() as Promise<T>;
  }
  return res.text() as unknown as T;
}
