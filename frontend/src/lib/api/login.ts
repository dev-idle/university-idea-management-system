import { loginBodySchema, loginResponseSchema } from "@/lib/schemas/auth.schema";
import { API_SERVER_BASE } from "@/config/env";
import { AUTH } from "@/config/constants";
import { setCookieFromBackendResponse } from "./auth-cookies";

const AUTH_BASE = `${API_SERVER_BASE}/${AUTH.API_PREFIX}/auth`;
const FETCH_TIMEOUT_MS = 15_000;

export type LoginResult =
  | { ok: true; data: { accessToken: string; user: { id: string; email: string; roles: string[] } } }
  | { ok: false; error: string; status: number };

/**
 * Handle login: validate input, call backend, set refresh cookie on success.
 * Use from Route Handler (app/api/auth/login/route.ts) — cookies() requires server context.
 */
export async function handleLoginRequest(body: unknown): Promise<LoginResult> {
  const parsed = loginBodySchema.safeParse(body);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.flatten().formErrors.join(", ") || "Invalid input",
      status: 400,
    };
  }
  const { email, password } = parsed.data;
  try {
    const res = await fetch(`${AUTH_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: "Invalid credentials", status: 401 };
    }
    const parsedData = loginResponseSchema.safeParse(data);
    if (!parsedData.success) {
      return { ok: false, error: "Invalid credentials", status: 401 };
    }
    await setCookieFromBackendResponse(res);
    return { ok: true, data: parsedData.data };
  } catch {
    return { ok: false, error: "Invalid credentials", status: 401 };
  }
}
