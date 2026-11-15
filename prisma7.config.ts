import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // generate/migrate não abrem conexão, mas o config exige uma URL definida
    url: process.env["DATABASE_URL"] || "postgres://postgres:postgres@localhost:5432/encaixe",
  },
});
