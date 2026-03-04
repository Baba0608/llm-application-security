# Project Guide

General conventions, tooling, architecture, and best practices for this repo.

## Package Manager

This project uses **pnpm**.

- **Install dependencies**: `pnpm install`
- **Add a dependency**: `pnpm add <pkg>` (runtime) or `pnpm add -D <pkg>` (dev)
- **Run scripts**: `pnpm run <script>` or `pnpm <script>` (e.g. `pnpm dev`, `pnpm build`)
- **Remove a package**: `pnpm remove <pkg>`

Do not use `npm` or `yarn` in this repo; stick to pnpm so lockfile and node_modules stay consistent.

## Architecture

- **Framework**: Next.js (App Router).
- **Language**: TypeScript.
- **UI**: React, Tailwind CSS.

Placed as follows:

- **`src/app/`** — Routes, layouts, pages (App Router).
- **`src/app/api/`** — API route handlers (backend endpoints).
- **`src/lib/`** — Shared utilities, helpers, and config (e.g. DB, LLM client, auth).
- **`src/agents/`** — Agent logic, tools, and orchestration (when present).
- **`public/`** — Static assets.

Keep API routes thin; put business and agent logic in `src/lib/` or `src/agents/` and call from routes.

## Best Practices

- **TypeScript**: Use strict types; avoid `any`. Prefer interfaces/types for API and agent boundaries.
- **Environment**: Use `.env` for secrets (API keys, DB URLs). Never commit secrets; keep `.env` in `.gitignore`. Document required env vars in README or a `.env.example`.
- **Imports**: Prefer absolute paths (e.g. `@/lib/...`) if configured in `tsconfig.json`.
- **Errors**: Handle errors in API routes and agents; return clear status codes and messages. Log server-side; don’t leak internals to the client.
- **Security**: Validate and sanitize input; treat LLM and user output as untrusted. Use parameterized queries for DB access; avoid string concatenation for SQL.

## Scripts

From `package.json`:

- `pnpm dev` — Start dev server.
- `pnpm build` — Production build.
- `pnpm start` — Run production server.
- `pnpm lint` — Run ESLint.

Add new scripts via `package.json` and document one-line usage here or in README if they’re shared.
