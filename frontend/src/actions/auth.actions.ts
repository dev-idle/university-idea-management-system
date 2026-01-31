"use server";

import { cookies } from "next/headers";
import { loginBodySchema, loginResponseSchema } from "@/lib/schemas/auth.schema";
import { env } from "@/config/env";
import { AUTH } from "@/config/constants";

const API_BASE = env.NEXT_PUBLIC_API_BASE;
const AUTH_BASE = `${API_BASE}/${AUTH.API_PREFIX}/auth`;

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function setCookieFromBackendResponse(res: Response): Promise<void> {
  const setCookie = res.headers.get("set-cookie");
  if (!setCookie) return;
  const cookieStore = await cookies();
  const [first] = setCookie.split(",").map((s) => s.trim());
  const nameValue = first.split(";")[0] ?? "";
  const eq = nameValue.indexOf("=");
  const name = nameValue.slice(0, eq).trim();
  const value = nameValue.slice(eq + 1).trim();
  const options: { path: string; httpOnly: boolean; secure?: boolean; sameSite: "strict"; maxAge?: number } = {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
  };
  const rest = first.split(";").slice(1);
  rest.forEach((part) => {
    const [k, v] = part.split("=").map((s) => s?.trim());
    const key = k?.toLowerCase();
    if (key === "max-age" && v) options.maxAge = parseInt(v, 10);
    else if (key === "secure") options.secure = true;
  });
  cookieStore.set(name, value, options);
}

/**
 * Login: validate with Zod, call backend, set refresh cookie, return accessToken + user.
 */
export async function loginAction(
  raw: unknown
): Promise<ActionResult<{ accessToken: string; user: { id: string; email: string; roles: string[] } }>> {
  const parsed = loginBodySchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten().formErrors.join(", ") || "Invalid input" };
  }
  const { email, password } = parsed.data;
  try {
    const res = await fetch(`${AUTH_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const body = await res.json();
    if (!res.ok) {
      return { ok: false, error: (body as { message?: string }).message ?? "Login failed" };
    }
    const data = loginResponseSchema.safeParse(body);
    if (!data.success) {
      return { ok: false, error: "Invalid response from server" };
    }
    await setCookieFromBackendResponse(res);
    return { ok: true, data: data.data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error" };
  }
}

/**
 * Refresh: read refresh cookie, call backend, set new cookie if returned, return new accessToken + user.
 */
export async function refreshAction(): Promise<
  ActionResult<{ accessToken: string; user: { id: string; email: string; roles: string[] } }>
> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH.REFRESH_COOKIE_NAME)?.value;
  if (!token) {
    return { ok: false, error: "No refresh token" };
  }
  try {
    const res = await fetch(`${AUTH_BASE}/refresh`, {
      method: "POST",
      headers: { Cookie: `${AUTH.REFRESH_COOKIE_NAME}=${token}` },
    });
    const body = await res.json();
    if (!res.ok) {
      return { ok: false, error: (body as { message?: string }).message ?? "Refresh failed" };
    }
    const data = loginResponseSchema.safeParse(body);
    if (!data.success) {
      return { ok: false, error: "Invalid response from server" };
    }
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) {
      await setCookieFromBackendResponse(res);
    }
    return { ok: true, data: data.data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error" };
  }
}

/**
 * Logout: call backend to invalidate refresh token, clear cookie.
 */
export async function logoutAction(): Promise<ActionResult<void>> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH.REFRESH_COOKIE_NAME)?.value;
  try {
    if (token) {
      await fetch(`${AUTH_BASE}/logout`, {
        method: "POST",
        headers: { Cookie: `${AUTH.REFRESH_COOKIE_NAME}=${token}` },
      });
    }
    cookieStore.delete(AUTH.REFRESH_COOKIE_NAME);
    return { ok: true, data: undefined };
  } catch {
    cookieStore.delete(AUTH.REFRESH_COOKIE_NAME);
    return { ok: true, data: undefined };
  }
}
