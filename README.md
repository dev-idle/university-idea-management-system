<p align="center">
  <strong>University Idea Management System</strong>
</p>
<p align="center">
  Full-stack platform for managing university ideas — submissions, votes, comments, and submission cycles
</p>

<p align="center">
  <a href="https://nestjs.com"><img src="https://img.shields.io/badge/NestJS-11-E0234E?style=flat-square&logo=nestjs" alt="NestJS"></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js" alt="Next.js"></a>
  <a href="https://www.postgresql.org"><img src="https://img.shields.io/badge/PostgreSQL-18-336791?style=flat-square&logo=postgresql" alt="PostgreSQL"></a>
  <a href="https://redis.io"><img src="https://img.shields.io/badge/Redis-8-DC382D?style=flat-square&logo=redis" alt="Redis"></a>
  <a href="https://www.docker.com"><img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker" alt="Docker"></a>
</p>

---

## Features

| Module                | Description                                           |
| --------------------- | ----------------------------------------------------- |
| **Ideas**             | Submit, view, vote, comment on ideas with attachments |
| **Departments**       | Organize users by department                          |
| **Academic Years**    | Manage academic year boundaries                       |
| **Categories**        | Categorize ideas (e.g. Innovation, Research)          |
| **Submission Cycles** | Time-bound idea submission periods                    |
| **Notifications**     | In-app + email (BullMQ, SMTP)                         |
| **Export**            | CSV export of ideas and analytics                     |
| **Auth**              | JWT, refresh tokens, role-based access                |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Docker Compose                           │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│   Frontend   │   Backend    │    Redis     │  PostgreSQL (opt)  │
│   Next.js 16 │   NestJS 11  │    BullMQ    │  Neon / local      │
│   :3000      │   :3001      │    :6379     │  :5432             │
└──────────────┴──────────────┴──────────────┴────────────────────┘
```

---

## Prerequisites

- **Docker Desktop** — [Download](https://www.docker.com/products/docker-desktop/)
- **Neon** (optional) — [neon.tech](https://neon.tech) for hosted PostgreSQL

---

## Quick Start

### 1. Clone & setup

```bash
git clone <repo-url>
cd university-idea-management-system
```

### 2. Environment

```bash
cp .env.docker.example .env
```

Edit `.env` and set:

| Variable              | Required  | Description                                                  |
| --------------------- | --------- | ------------------------------------------------------------ |
| `JWT_SECRET`          | **Yes**   | Secret key, min 32 characters                                |
| `DATABASE_URL`        | **Yes\*** | PostgreSQL connection string (Neon or local)                 |
| `DIRECT_URL`          | No        | Direct connection for migrations (Neon: use non-pooler host) |
| `RUN_SEED`            | No        | `1` = create initial admin on first run                      |
| `ADMIN_SEED_EMAIL`    | With seed | Admin email                                                  |
| `ADMIN_SEED_PASSWORD` | With seed | Admin password                                               |

\* Omit when using local Postgres container (see [Local PostgreSQL](#local-postgresql)).

### 3. Run

```bash
docker compose up -d --build
```

First run: **5–10 minutes** (images + build).

### 4. Access

| Service | URL                   |
| ------- | --------------------- |
| **App** | http://localhost:3000 |
| **API** | http://localhost:3001 |

---

## Local PostgreSQL (no Neon)

Use the bundled Postgres container instead of Neon:

```bash
# .env: set POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB
# Remove or comment DATABASE_URL
docker compose --profile local-db up -d --build
```

---

## Optional Services

Configure in `.env` for full functionality:

| Service          | Variables      | Purpose                          |
| ---------------- | -------------- | -------------------------------- |
| **Cloudinary**   | `CLOUDINARY_*` | Idea attachments, export storage |
| **SMTP (Brevo)** | `SMTP_*`       | Notification emails              |
| **Sentry**       | `SENTRY_DSN`   | Error monitoring                 |

---

## Project Structure

```
university-idea-management-system/
├── backend/                 # NestJS API
│   ├── prisma/              # Schema, migrations, seed
│   └── src/modules/         # Auth, Ideas, Users, Export, etc.
├── frontend/                # Next.js 16 (App Router)
├── docker-compose.yml
├── .env.docker.example
├── README.md
└── DOCKER.md                # Detailed Docker guide
```

---

## Commands

| Command                          | Description                      |
| -------------------------------- | -------------------------------- |
| `docker compose up -d --build`   | Start all services               |
| `docker compose logs -f`         | Follow logs                      |
| `docker compose logs -f backend` | Backend logs only                |
| `docker compose down`            | Stop                             |
| `docker compose down -v`         | Stop + remove volumes (fresh DB) |

---

## Troubleshooting

| Issue                            | Solution                                                 |
| -------------------------------- | -------------------------------------------------------- |
| `docker is not recognized`       | Install Docker Desktop, wait for "Running"               |
| Port 3000/3001 in use            | Set `FRONTEND_PORT` / `BACKEND_PORT` in `.env`           |
| Build fails, missing JWT_SECRET  | Add `JWT_SECRET=...` (min 32 chars) to `.env`            |
| Backend can't connect to DB      | Verify `DATABASE_URL` (Neon: check connection string)    |
| P1002 advisory lock (migrations) | Use `DIRECT_URL` with non-pooler host for Prisma migrate |

---

## Documentation

- **[DOCKER.md](./DOCKER.md)** — Step-by-step Docker setup (Windows), troubleshooting, production notes
