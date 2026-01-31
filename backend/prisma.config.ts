// Prisma config. Load .env so migrate/seed get DATABASE_URL.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npm run build && npm run seed:run",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
