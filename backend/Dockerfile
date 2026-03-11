# syntax=docker/dockerfile:1
# Backend (NestJS 11 + Prisma 7) - Production Dockerfile
# Node 24 LTS (Krypton) | Multi-stage | Non-root user | 2026

# =============================================================================
# Stage 1: Dependencies
# =============================================================================
FROM node:24-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies (skip postinstall; prisma generate runs in builder)
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# =============================================================================
# Stage 2: Builder
# =============================================================================
FROM node:24-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client (schema only; dummy URL needed for prisma.config.ts)
ENV PRISMA_GENERATE_SKIP_AUTOINSTALL=1
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
RUN npx prisma generate

# Build NestJS
RUN npm run build

# =============================================================================
# Stage 3: Runner
# =============================================================================
FROM node:24-alpine AS runner
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nestjs

WORKDIR /app

# Copy built output
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/src/generated ./src/generated

USER nestjs

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/v1/', (r) => process.exit(r.statusCode === 200 ? 0 : 1))" || exit 1

# Migrate DB on startup, optionally seed, then run app
ENTRYPOINT ["dumb-init", "--", "sh", "-c", "npx prisma migrate deploy && ([ \"$RUN_SEED\" = \"1\" ] || [ \"$RUN_SEED\" = \"true\" ]) && npm run seed:run || true; exec node dist/main.js"]
