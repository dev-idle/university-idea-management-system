"use server";

import { cookies } from "next/headers";
import {
  loginBodySchema,
  loginResponseSchema,
  forgotPasswordBodySchema,
  resetPasswordBodySchema,
} from "@/lib/schemas/auth.schema";
import { API_SERVER_BASE } from "@/config/env";
import { AUTH } from "@/config/constants";

/** Server Actions run on Next.js server; use API_SERVER_BASE (e.g. http://backend:3001 in Docker). */
const API_BASE = API_SERVER_BASE;
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
      return { ok: false, error: "Invalid credentials" };
    }
    const data = loginResponseSchema.safeParse(body);
    if (!data.success) {
      return { ok: false, error: "Invalid credentials" };
    }
    await setCookieFromBackendResponse(res);
    return { ok: true, data: data.data };
  } catch {
    return { ok: false, error: "Invalid credentials" };
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
 * Forgot password: request reset email. OWASP: generic success message.
 */
export async function forgotPasswordAction(raw: unknown): Promise<ActionResult<{ message: string }>> {
  const parsed = forgotPasswordBodySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.flatten().formErrors.join(", ") || "Invalid input",
    };
  }
  try {
    const res = await fetch(`${AUTH_BASE}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: parsed.data.email }),
    });
    const body = await res.json();
    if (!res.ok) {
      if (res.status === 429) {
        return { ok: false, error: "Too many requests. Please wait a few minutes and try again." };
      }
      const raw = (body as { message?: string | string[] }).message;
      const msg = Array.isArray(raw) ? raw[0] : raw ?? "Request failed";
      const msgStr = typeof msg === "string" ? msg : String(msg);
      if (/throttl|too many request/i.test(msgStr)) {
        return { ok: false, error: "Too many requests. Please wait a few minutes and try again." };
      }
      return { ok: false, error: msgStr };
    }
    const msg = (body as { message?: string }).message ?? "Check your email for instructions.";
    return { ok: true, data: { message: msg } };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}

/**
 * Reset password: validate token and set new password. OWASP: no auto-login.
 */
export async function resetPasswordAction(raw: unknown): Promise<ActionResult<{ message: string }>> {
  const parsed = resetPasswordBodySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.flatten().formErrors.join(", ") || "Invalid input",
    };
  }
  try {
    const res = await fetch(`${AUTH_BASE}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: parsed.data.token,
        newPassword: parsed.data.newPassword,
      }),
    });
    const body = await res.json();
    if (!res.ok) {
      const msg = (body as { message?: string }).message ?? "Invalid or expired reset link";
      return { ok: false, error: msg };
    }
    const msg = (body as { message?: string }).message ?? "Password reset successfully.";
    return { ok: true, data: { message: msg } };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
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
