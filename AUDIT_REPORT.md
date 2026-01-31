# Codebase Audit Report — Correctness, Clean Code, Security, Performance (2026)

Strict audit for **correctness**, **clean code**, **security**, and **performance**. No new features or architecture changes — only findings and concrete fixes.

---

## 1. Business logic & correctness

### 1.1 Backend

| Finding | Severity | Location | Recommendation |
|--------|----------|----------|----------------|
| **Refresh token rotation race** | Low | `auth.service.ts` refresh() | After `delete` + `create`, if `create` fails the user loses refresh until re-login. Acceptable; consider wrapping in `$transaction` so both succeed or both fail (optional). |
| **PermissionsGuard with empty decorator** | Medium | `permissions.guard.ts` | `@RequirePermission()` with no args yields `requiredPermissions = []`, so `!requiredPermissions?.length` is true and guard **allows** access. A route with empty `@RequirePermission()` would allow any authenticated user. **Fix:** In guard, if `requiredPermissions.length === 0` and metadata was explicitly set (e.g. decorator applied with empty array), treat as misconfiguration and throw (e.g. `ForbiddenException`) or require at least one permission when decorator is present. Alternatively document that empty `@RequirePermission()` must never be used. |
| **JWT strategy roles** | OK | `jwt-access.strategy.ts` | `validate()` filters `payload.roles` with `isRole(r)` — only table-defined roles are passed; no role injection. |
| **Pagination** | OK | `users.service.ts` findAll | `skip = (page - 1) * limit`; `total` from `count()`; no off-by-one. |
| **Academic year “single active”** | OK | `academic-years.service.ts` | When setting `isActive: true`, other years are deactivated in same transaction; logic is correct. |

### 1.2 Frontend

| Finding | Severity | Location | Recommendation |
|--------|----------|----------|----------------|
| **Backend error message shape** | Medium | `actions/auth.actions.ts` | Backend sends `message: string[]` (see HttpExceptionFilter). Code uses `(body as { message?: string }).message` and assigns to `error`. So `error` can be a **string[]**, and UI may display it incorrectly. **Fix:** Normalize to string: `const msg = (body as { message?: string \| string[] }).message; return { ok: false, error: Array.isArray(msg) ? msg[0] : msg ?? "Login failed" };` (and same for refresh). |
| **Create user departmentId** | OK | `create-user-form.tsx` | Empty select value `""` is normalized to `undefined` before submit; backend gets `null`/omit as intended. |
| **Optimistic rollback** | OK | `use-users.ts` | `previous` from `getQueriesData`; on error we restore all matching query caches; no stale UI. |
| **401 retry loop** | OK | `lib/api/client.ts` fetchWithAuth | Only one retry after refresh; no loop if second request also returns 401. |

---

## 2. Clean code & maintainability

### 2.1 Duplication & dead code

| Finding | Severity | Location | Recommendation |
|--------|----------|----------|----------------|
| **isPrismaNotFound duplicated** | Low | `departments.service.ts`, `academic-years.service.ts` | Same helper in two files. **Fix:** Move to `common/prisma.ts` (or similar) and import in both services. |
| **RolesGuard and @Roles unused** | Low | `auth/guards/roles.guard.ts`, `auth/decorators/roles.decorator.ts` | No controller uses `@Roles` or `RolesGuard`; all use `@RequirePermission` + `PermissionsGuard`. **Fix:** Remove `RolesGuard` and `@Roles` (and their exports/registration) to avoid confusion, or document as “reserved for future role-only checks.” |
| **authQueryFetcher** | OK | `hooks/use-auth-query.ts` | Thin wrapper over `fetchWithAuth`; used indirectly. Keep for consistent queryFn usage or remove if unused; not harmful. |

### 2.2 Structure & practices

| Finding | Severity | Location | Recommendation |
|--------|----------|----------|----------------|
| **NestJS** | OK | Backend | Feature modules, per-route guards/pipes, global filter/interceptor; aligns with Nest best practices. |
| **Next.js** | OK | Frontend | App Router, RSC by default, `"use client"` only where needed; Suspense/loading/error boundaries present. |
| **No unnecessary abstraction** | OK | — | No extra layers beyond needed (e.g. single API client, single query key factory). |

---

## 3. Security (OWASP & zero-trust)

### 3.1 Authentication & authorization

| Finding | Severity | Location | Recommendation |
|--------|----------|----------|----------------|
| **Auth flow** | OK | Backend + frontend | Login-only; JWT hybrid (access in JSON, refresh in HttpOnly cookie); frontend stores access token in memory only; no localStorage/sessionStorage for auth. |
| **RBAC** | OK | Backend | PermissionsGuard + @RequirePermission; roles from JWT only (filtered by isRole); backend is sole authority. |
| **Guard order** | OK | Controllers | JwtAuthGuard runs first (Passport), then PermissionsGuard; no bypass. |
| **Empty @RequirePermission()** | Medium | See §1.1 | Same as above: guard currently allows when permissions array is empty; fix or document. |

### 3.2 Data & headers

| Finding | Severity | Location | Recommendation |
|--------|----------|----------|----------------|
| **Sensitive data in error body** | Low | Backend | Production filter does not attach `stack`; 5xx message is generic. Ensure no other code sends sensitive data in error response body. |
| **Cookie security** | OK | Backend auth.controller | Refresh cookie: `httpOnly`, `secure` in production, `sameSite: 'strict'`, path `/api/auth`. |
| **Frontend cookie replication** | OK | auth.actions setCookieFromBackendResponse | Replicated cookie uses `httpOnly`, `sameSite: 'strict'`, parses `Secure` and `max-age`. |
| **CSP** | Medium | `frontend/src/proxy.ts` | `script-src` includes `'unsafe-inline'` and `'unsafe-eval'` (needed for Next/React in many setups). **Fix:** In production, prefer nonce- or hash-based `script-src` and remove `unsafe-eval` if possible; tighten `connect-src` to app + API origins only. |
| **Password handling** | OK | `common/crypto/password.util.ts` | scrypt + timing-safe comparison; async; no plaintext in logs. |
| **Login over-fetch** | Low | `auth.service.ts` login() | Uses `include: { role }` and thus full User row (e.g. passwordHash, createdAt). Not exposed in response. **Fix (optional):** Use `select: { id: true, email: true, passwordHash: true, isActive: true, role: { select: { name: true } } }` to limit columns and avoid accidental future leaks. |

### 3.3 OWASP Top 10 (brief)

| Risk | Status | Note |
|------|--------|------|
| A01 Broken Access Control | OK | Guards and permission checks on backend; frontend RBAC is UX-only. |
| A02 Cryptographic Failures | OK | Passwords hashed (scrypt); JWT with secret; HTTPS in prod (HSTS). |
| A03 Injection | OK | Prisma parameterized; Zod validation on input. |
| A04 Insecure Design | OK | Zero-trust; auth and authz on backend only. |
| A05 Security Misconfiguration | See CSP | HSTS and headers set; CSP can be tightened. |
| A06 Vulnerable Components | — | Not audited (dependency audit separate). |
| A07 Auth Failures | OK | Strong auth flow; refresh rotation; no auth in storage. |
| A08 Software/Data Integrity | OK | No unsafe deserialization; Zod on API responses where used. |
| A09 Logging/Monitoring | OK | 5xx logged with request ID; no sensitive data in prod body. |
| A10 SSRF | OK | No user-controlled URLs in server fetches; API_BASE from env. |

---

## 4. Performance & scalability

### 4.1 Async & non-blocking

| Finding | Severity | Location | Recommendation |
|--------|----------|----------|----------------|
| **HttpExceptionFilter.catch** | Low | `http-exception.filter.ts` | Method is synchronous. **Fix:** Change to `async catch(...): Promise<void>` and use async logging if needed for consistency with “fully async” standard. |
| **ZodValidationPipe.transform** | Low | `zod-validation.pipe.ts` | Synchronous. **Fix:** Return `Promise.resolve(result.data)` (or make method async) for consistency. |
| **Services/controllers** | OK | Backend | All service and controller methods are async; Prisma calls awaited. |
| **Frontend** | OK | — | No blocking calls; fetch and Server Actions are async. |

### 4.2 Caching & redundant calls

| Finding | Severity | Location | Recommendation |
|--------|----------|----------|----------------|
| **TanStack Query** | OK | Frontend | Single client data layer; staleTime/gcTime set; keys normalized; invalidations after mutations. |
| **Users create validation** | Low | `users.service.ts` create() | Three sequential DB calls: findUnique (email), findUnique (role), findUnique (department). **Fix:** When `body.departmentId != null`, run role and department lookups in parallel with `Promise.all([prisma.role.findUnique(...), prisma.department.findUnique(...)])` to reduce latency. |
| **No redundant network** | OK | — | No duplicate fetches; list and mutations invalidate as needed. |

### 4.3 Prisma (N+1, select, indexes)

| Finding | Severity | Location | Recommendation |
|--------|----------|----------|----------------|
| **Users findAll** | OK | `users.service.ts` | Single `findMany` with `select` including `department` and `role`; no N+1. |
| **Auth login** | OK | `auth.service.ts` | Single `findUnique` with include; one row. |
| **Auth refresh** | OK | `auth.service.ts` | Single `findUnique` on RefreshToken with include user + role. |
| **Schema indexes** | OK | `prisma/schema.prisma` | Indexes on User (roleId, departmentId, createdAt), Department (name), AcademicYear, RefreshToken (userId, expiresAt). |
| **Auth login select** | Low | §3.2 | Optional: use `select` instead of `include` to limit columns (see above). |

---

## 5. Error handling

### 5.1 Backend

| Finding | Severity | Location | Recommendation |
|--------|----------|----------|----------------|
| **Global filter** | OK | `http-exception.filter.ts` | Catches all; normalizes status/message; in production no stack in body; 5xx logged with request ID. |
| **Prisma P2025** | OK | users, departments, academic-years | Converted to NotFoundException; no raw Prisma error leaked. |
| **Auth errors** | OK | auth.service | UnauthorizedException with generic “Invalid credentials” / “Invalid or expired refresh token”; no user enumeration. |

### 5.2 Frontend

| Finding | Severity | Location | Recommendation |
|--------|----------|----------|----------------|
| **Error boundaries** | OK | `app/error.tsx`, `app/admin/users/error.tsx` | Catch errors; show message and retry/home; `console.error` in dev only for debugging. |
| **API error message** | Low | `lib/api/client.ts` | `throw new Error(\`API ${res.status}: ${text}\`)` includes response body. Backend messages are generic; if any endpoint ever returns sensitive text, it would leak. **Fix:** Ensure all backend error bodies are safe; optionally truncate or sanitize `text` in client for 5xx. |
| **Auth action errors** | Medium | §1.2 | Normalize backend `message` (array) to string before showing to user. |

---

## 6. Folder structure & long-term maintainability

| Finding | Severity | Location | Recommendation |
|--------|----------|----------|----------------|
| **Backend** | OK | `modules/`, `common/`, `config/`, `core/` | Feature-based modules; shared filter, pipe, interceptor in common. |
| **Frontend** | OK | `app/`, `components/features/`, `components/ui/`, `actions/`, `hooks/`, `lib/`, `stores/` | Clear separation; no deprecated patterns. |
| **Deprecated patterns** | OK | — | No middleware.ts (using proxy.ts); App Router only. |

---

## 7. Summary of concrete recommendations

### High priority

1. **Frontend auth.actions.ts** — Normalize backend error `message` (array) to a single string when returning `error` to the client (login and refresh).
2. **PermissionsGuard** — Treat empty `@RequirePermission()` as misconfiguration: when decorator is present but permissions array is empty, throw (e.g. `ForbiddenException`) or document that empty usage is forbidden.

### Medium priority

3. **CSP (proxy.ts)** — In production, use nonce- or hash-based `script-src` and remove `unsafe-eval`; restrict `connect-src` to app + API origins.
4. **Shared isPrismaNotFound** — Extract to `common/prisma.ts` (or similar) and use in departments and academic-years services.
5. **Dead code** — Remove or document `RolesGuard` and `@Roles` (unused).

### Low priority

6. **HttpExceptionFilter** — Make `catch` async for consistency.
7. **ZodValidationPipe** — Make `transform` return a Promise for consistency.
8. **UsersService create** — Run role and department lookups in parallel when both are needed.
9. **Auth login query** — Use `select` instead of `include` for User to limit columns (optional).
10. **apiClient error body** — Ensure backend never returns sensitive data in error body; optionally sanitize 5xx response text on client.

---

No new features or architecture changes recommended; only the fixes above.
