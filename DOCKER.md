# Docker Setup

Production-ready Docker setup for University Idea Management System (2026).

---

## Step-by-step guide (Windows)

### Step 1: Download Docker Desktop

1. Open a browser and go to: **https://www.docker.com/products/docker-desktop/**
2. Click **Download for Windows**
3. File size: `Docker Desktop Installer.exe` (about 500MB)

### Step 2: Install Docker Desktop

1. Run `Docker Desktop Installer.exe`
2. Enable **Use WSL 2 instead of Hyper-V** (if prompted)
3. Click **Ok** to install
4. When finished → click **Restart** to reboot (required)

### Step 3: Start Docker

1. After reboot, open **Docker Desktop** from the Start Menu
2. Wait 1–2 minutes until the Docker icon shows **Docker Desktop is running**
3. If you see a WSL 2 installation prompt → follow the on-screen instructions

### Step 4: Open Terminal in project folder

1. Open **Cursor** or **VS Code** in the `university-idea-management-system` folder
2. Press **Ctrl + `** (or Terminal → New Terminal) to open the Terminal
3. Ensure you are in the project root directory

### Step 5: Create .env file

Run in Terminal (PowerShell):

```powershell
# Copy env from backend to root
Copy-Item backend\.env .env
```

Or manually: copy `backend\.env` to the project root (same level as `docker-compose.yml`) and rename to `.env`

### Step 6: Verify .env

Open the `.env` file in the root and ensure it has:

- `DATABASE_URL` (Neon)
- `JWT_SECRET`
- Optional: `DIRECT_URL` (Neon → Connection string → Direct connection)

### Step 7: Run Docker

```powershell
docker compose up -d --build
```

- First run may take **5–10 minutes** (downloading images, building)
- On success, you will see `✔ Container uims-xxx  Started`

### Step 8: Open the app

- **App:** http://localhost:3000
- **API:** http://localhost:3001

### Step 9: View logs (if errors occur)

```powershell
# View all logs
docker compose logs -f

# Backend only
docker compose logs -f backend

# Exit: press Ctrl + C
```

### Step 10: Stop Docker

```powershell
docker compose down
```

---

## Stack

| Service    | Image                    | Port |
| ---------- | ------------------------ | ---- |
| PostgreSQL | postgres:18-alpine (optional) | 5432 |
| Redis      | redis:8-alpine           | 6379 |
| Backend    | NestJS 11 (Node 24 LTS)  | 3001 |
| Frontend   | Next.js 16 (Node 24 LTS) | 3000 |

## Quick Start (Neon PostgreSQL)

```bash
# 1. Copy backend/.env to root (has DATABASE_URL from Neon)
cp backend/.env .env

# 2. Neon: add DIRECT_URL for migrations (host without -pooler)
# In Neon dashboard: Connection string → Direct connection → copy to .env as DIRECT_URL

# 3. Build and start (Redis + Backend + Frontend; no postgres container)
docker compose up -d --build

# 4. (Optional) Seed on first run: add RUN_SEED=1 ADMIN_SEED_EMAIL=... ADMIN_SEED_PASSWORD=... to .env
```

App: **http://localhost:3000** | API: **http://localhost:3001**

## Local PostgreSQL (instead of Neon)

```bash
# Add to .env: POSTGRES_USER=uims POSTGRES_PASSWORD=uims_secret POSTGRES_DB=uims
# Remove or comment DATABASE_URL (compose will use postgres container)
docker compose --profile local-db up -d --build
```

## Commands

```bash
# View logs
docker compose logs -f

# Stop
docker compose down

# Stop and remove volumes (fresh DB)
docker compose down -v

# Rebuild after code changes
docker compose up -d --build
```

## Troubleshooting

| Error | Solution |
|-------|----------|
| "docker is not recognized" | Docker not installed or not running. Open Docker Desktop and wait for "Running" |
| WSL 2 installation incomplete | Open PowerShell **as Administrator** → run `wsl --install` → Restart |
| Port 3000/3001 already in use | Change `FRONTEND_PORT` or `BACKEND_PORT` in `.env` |
| Build error, missing JWT_SECRET | Ensure `.env` has `JWT_SECRET=...` (at least 32 characters) |
| Backend cannot connect to Neon | Check `DATABASE_URL` in `.env` is valid |

## Production Notes

- Set strong `POSTGRES_PASSWORD` and `JWT_SECRET`
- Configure `CORS_ORIGINS` with your domain(s)
- Set `NEXT_PUBLIC_API_BASE` and `NEXT_PUBLIC_APP_ORIGIN` to production URLs
- Add Cloudinary, SMTP, Sentry env vars as needed
