// Prisma config. Load .env so migrate/seed get DATABASE_URL.
// Use DIRECT_URL for migrations when using Neon (or any pooler) to avoid
// P1002 advisory lock timeout; use the non-pooled connection (e.g. host without -pooler).
import "dotenv/config";
import { defineConfig } from "prisma/config";

const databaseUrl =
  process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"];
if (!databaseUrl) {
  throw new Error("DATABASE_URL or DIRECT_URL is required");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npm run build && npm run seed:run",
  },
  datasource: {
    url: databaseUrl,
  },
});
