import path from "node:path";
import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Load .env.local (Next.js convention) then .env so CLI and Next use same vars
config({ path: path.resolve(process.cwd(), ".env.local") });
config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
