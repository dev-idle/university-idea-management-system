# Frontend directory structure

Standardized layout and naming for Next.js 16 App Router. All paths use the `@/` alias (maps to `src/`).

## Directory tree

```
src/
├── actions/                 Server Actions (Zod-validated mutations)
│   └── auth.actions.ts
├── app/                     App Router
│   ├── layout.tsx           Root layout, fonts, metadata
│   ├── loading.tsx           Root loading (streaming)
│   ├── page.tsx             Home route
│   ├── error.tsx            Root error boundary
│   ├── not-found.tsx        Custom 404
│   ├── providers.tsx        Client providers (Query, Theme, nuqs)
│   ├── globals.css
│   ├── favicon.ico
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── login/
│   │   ├── page.tsx
│   │   └── loading.tsx
│   └── admin/
│       ├── layout.tsx
│       ├── page.tsx
│       └── users/
│           ├── page.tsx
│           ├── loading.tsx
│           └── error.tsx
├── components/
│   ├── features/            Feature-specific components (by route/domain)
│   │   ├── auth/
│   │   │   └── login-form.tsx
│   │   ├── admin/
│   │   │   ├── users-management.tsx
│   │   │   ├── users-table.tsx
│   │   │   ├── users-table-skeleton.tsx
│   │   │   └── create-user-form.tsx
│   │   ├── dashboard/
│   │   │   ├── dashboard-content.tsx
│   │   │   ├── dashboard-admin-link.tsx
│   │   │   └── dashboard-skeleton.tsx
│   │   └── home/
│   │       ├── home-welcome.tsx
│   │       └── home-loading.tsx
│   └── ui/                  Shared UI primitives (shadcn-style)
│       ├── button.tsx
│       ├── can.tsx          Can(permission) — UX-only visibility
│       ├── input.tsx
│       └── label.tsx
├── config/                  App configuration (client-safe)
│   ├── env.ts
│   ├── constants.ts
│   └── index.ts
├── hooks/
│   ├── use-auth.ts
│   ├── use-auth-query.ts
│   ├── use-me.ts
│   ├── use-users.ts        useUsersListQuery, useCreateUserMutation, useUpdateUserIsActiveMutation
│   └── use-departments.ts  useDepartmentsQuery (for create-user dropdown)
├── lib/
│   ├── api/
│   │   └── client.ts        getApiUrl, apiClient, fetchWithAuth (401 → refresh)
│   ├── query/
│   │   ├── client.ts        TanStack Query client
│   │   └── keys.ts          Query key factory
│   ├── rbac.ts              Frontend RBAC (UX only; backend is authority)
│   ├── schemas/
│   │   ├── auth.schema.ts
│   │   ├── users.schema.ts
│   │   └── index.ts
│   ├── utils.ts
│   └── utils.test.ts
├── stores/
│   └── auth.store.ts
└── proxy.ts                 Next.js 16 proxy (security headers only)
```

## Naming conventions

| Kind | Convention | Example |
|------|------------|--------|
| Folders | lowercase | `actions`, `app`, `components`, `config`, `hooks`, `lib`, `stores` |
| Route segments | lowercase | `dashboard`, `login` |
| Component files | kebab-case | `login-form.tsx`, `home-welcome.tsx` |
| Domain + type | `domain.type.ts` | `auth.actions.ts`, `auth.schema.ts`, `auth.store.ts` |
| Hooks | kebab-case, `use-` prefix | `use-auth.ts` |
| App Router files | Next.js convention | `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx` |

## Placement rules

- **Routes:** Only under `app/`; one `page.tsx` per route; optional `layout.tsx`, `loading.tsx`, `error.tsx` per segment.
- **Server Actions:** Under `actions/`; one file per domain (e.g. `auth.actions.ts`).
- **Components:** `components/ui/` for shared primitives; `components/features/<domain>/` for route/feature-specific components.
- **Config:** `config/` for env and constants; use `@/config/env` or `@/config/constants` (or `@/config` barrel).
- **Types:** No separate `types/` folder; export types from `@/lib/schemas` or next to the module that uses them.
- **Tests:** Colocated `*.test.ts` / `*.spec.tsx` next to source; global setup in root `vitest.setup.ts`.
- **Proxy:** Single `proxy.ts` at `src/` (Next.js 16 convention).

## Imports

- Prefer `@/` alias for all app code: `@/components/ui/button`, `@/lib/utils`, `@/config/env`, `@/hooks/use-auth`, `@/stores/auth.store`, `@/actions/auth.actions`, `@/lib/schemas/auth.schema`.
- Use relative imports only for same-directory files in `app/` (e.g. `./providers`, `./globals.css`).

## Conventions

- **Server Components by default:** Pages and layouts are RSC; add `"use client"` only for interactivity (forms, hooks, theme, query client).
- **TanStack Query:** Single data-fetching/caching layer; use `fetchWithAuth` in queryFn/mutationFn so all API calls attach Bearer and silent-refresh on 401.
- **Auth in memory only:** Access token and user live in Zustand only; never localStorage or cookies for access token. Refresh token is HttpOnly cookie (backend-set); we never read it in JS.
- **Zero-trust RBAC:** Frontend RBAC (`lib/rbac.ts`, `<Can>`) is UX-only (hide/show UI); backend is the sole authority for authorization.

## Verification checklist

- **Folders:** All lowercase (`actions`, `app`, `components`, `config`, `hooks`, `lib`, `stores`); route segments lowercase (`admin`, `dashboard`, `login`, `users`).
- **Component files:** Kebab-case (`login-form.tsx`, `create-user-form.tsx`, `users-table-skeleton.tsx`, `dashboard-admin-link.tsx`).
- **Domain + type:** `auth.actions.ts`, `auth.schema.ts`, `auth.store.ts`; hooks `use-auth.ts`, `use-users.ts`.
- **App Router:** `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx` at segment level where used.
- **Proxy:** Single `proxy.ts` at `src/` (Next.js 16).
- **No stray files:** No `types/` folder; no test folder under `src/` (tests colocated or root `vitest.setup.ts`).
