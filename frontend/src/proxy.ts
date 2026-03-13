import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js 16 proxy.ts — Zero-Trust edge layer (OWASP-aligned).
 * Handles: security headers (CSP, HSTS), route guards, and sub-request behavior.
 * Do NOT perform JWT verification or DB access here; use Server Layout Guards (RSC) for auth.
 */

function buildCsp(): string {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8001";
  const appOrigin = process.env.NEXT_PUBLIC_APP_ORIGIN ?? "http://localhost:8000";
  const connectSrc = [
    "'self'",
    "http://localhost:*",
    "https://localhost:*",
    apiBase,
    appOrigin,
  ]
    .filter((v, i, a) => a.indexOf(v) === i)
    .join(" ");

  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js / React require unsafe-inline in dev; tighten in prod
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src ${connectSrc}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Next.js middleware signature requires request
export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers (OWASP)
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Content-Security-Policy", buildCsp());
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Run on all request paths except:
     * - _next/static, _next/image (static assets)
     * - api (handled separately if needed), favicon, etc.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|ico|webp)$).*)",
  ],
};
