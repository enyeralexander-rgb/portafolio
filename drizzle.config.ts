import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  try {
    process.loadEnvFile(".env.local");
  } catch {}
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/esquema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
