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
 * Promise singleton: only one refresh in flight; other 401s wait and retry with new token.
 * Prevents multiple concurrent 401s from each calling /auth/refresh and causing token reuse
 * (second request would send the old refresh token after the first rotated it → backend revokes family).
 */
let refreshPromise: Promise<{ accessToken: string; user: { id: string; email: string; roles: string[] } } | null> | null =
  null;

/**
 * Client-only: fetch with in-memory access token and silent refresh on 401.
 * On 401: one refresh runs; others wait for it then retry once. If refresh fails: clear auth, throw.
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
    if (!refreshPromise) {
      refreshPromise = (async () => {
        const result = await refreshAction();
        if (result.ok) {
          store.setAuth(result.data.accessToken, result.data.user);
          return { accessToken: result.data.accessToken, user: result.data.user };
        }
        store.clearAuth();
        return null;
      })().finally(() => {
        refreshPromise = null;
      });
    }
    const refreshResult = await refreshPromise;
    if (refreshResult) {
      token = refreshResult.accessToken;
      res = await doFetch();
    } else {
      throw new Error("Unauthorized: Refresh failed");
    }
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const contentType = res.headers.get("Content-Type");
  if (contentType?.includes("application/json")) {
    return res.json() as Promise<T>;
  }
  return res.text() as unknown as T;
}
