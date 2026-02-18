# Architecture: Frontend / Backend Separation

## Structure

```
university-idea-management-system/
├── frontend/          Next.js 16 App Router
├── backend/           NestJS 11 + Prisma
└── ARCHITECTURE.md
```

## Email & Notification (Backend)

| Layer | Responsibility |
|-------|----------------|
| **MailModule** | SMTP transport, Handlebars templates. No business logic. |
| **NotificationModule** | Queue (BullMQ), processor, in-app API. Uses MailModule. |

**Flow:** API (idea/comment) → EventEmitter → Listener enqueues job → Processor: (1) send email, (2) create Notification record. Both run in worker; failures are logged, job retries up to 3×.

## Separation

| Concern | Frontend | Backend |
|---------|----------|---------|
| **Runtime** | Browser / Node (SSR) | Node.js |
| **API** | `fetch()` to `NEXT_PUBLIC_API_BASE` | REST at `/api/*` |
| **Auth** | In-memory token (Zustand) + HttpOnly cookie | JWT + Refresh |
| **Validation** | Zod schemas in `lib/schemas/` | Zod in `dto/`, `schemas/` |
| **DB** | None | Prisma + PostgreSQL |

## Communication

- FE calls BE via `NEXT_PUBLIC_API_BASE` (default `http://localhost:3001`).
- No shared code: each side has its own schemas, types, and config.
- Cookie `refreshToken` is set by BE and sent automatically by browser (`credentials: "include"`).

## Running

```bash
# Backend
cd backend && npm run start:dev

# Frontend
cd frontend && npm run dev
```
