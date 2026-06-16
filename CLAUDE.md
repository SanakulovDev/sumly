# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Sumly is a daily income/expense tracker for the Uzbek market: Go + Gin REST API, PostgreSQL via GORM, and a React + TypeScript SPA. Multi-language (uz/ru/en), multi-currency, mobile-first. The whole stack runs with `docker compose up --build` (app on :3000, API on :8080, db on :5432).

## Commands

### Full stack (Docker)
- `docker compose up --build` — build and run db + backend + frontend.
- `docker compose down` (`-v` to also wipe the Postgres volume).

### Backend (Go 1.24, in `backend/`)
- Run: `go run ./cmd/server` (needs a reachable Postgres; `docker compose up db` is easiest). Copy `.env.example` to `.env` first.
- Build: `go build ./cmd/server`
- Vet/format: `go vet ./...`, `gofmt -w .`
- Tests: `go test ./...` — run one package with `go test ./internal/services/...`, one test with `go test ./internal/services -run TestName`.

### Frontend (Node 20+, in `frontend/`)
- Dev: `npm run dev` — Vite on :5173, proxies `/api` to the backend (override target with `VITE_DEV_API_TARGET`).
- Lint / typecheck: `npm run lint` (`tsc --noEmit`).
- Build: `npm run build` — runs `tsc -b`, the SPA Vite build, an **SSR** build of `src/entry-landing.tsx`, then `node scripts/prerender.mjs`.

## Architecture

### Backend — strict layered, one composition root
Request flow is `handlers → services → repositories → GORM`. The rules that matter:
- **Only repositories touch GORM.** Services hold business logic and never see an HTTP request; handlers only parse/validate/respond.
- `internal/routes/routes.go` is the **single composition root** — every repository, service, and handler is constructed and dependency-injected here. Adding a feature means adding a method down the chain and wiring it in this one file.
- **Route ordering matters:** static sub-paths (e.g. `/transactions/export`, `/transactions/scan-receipt`) are registered *before* the `/:id` param route, or Gin will swallow them.
- Auth: JWT middleware (`internal/middleware/auth.go`) guards the `protected` route group; bcrypt for passwords (`internal/utils`). **Every query is scoped by user ID** — preserve ownership scoping on any new data access.
- Standard JSON envelopes: `{ "data": … }` / `{ "error": … }`, lists carry pagination `meta`. Helpers live in `internal/utils/response.go`.

### Database / migrations — important gotcha
Despite the SQL files in `backend/migrations/`, the app schema is applied at startup by **GORM `AutoMigrate`** in `internal/database/database.go` (called from `main.go`), plus idempotent backfill `UPDATE`s for currency fields. The `migrations/*.sql` files are the *canonical reference schema*, not what runs. To change the live schema, update the GORM **model structs** in `internal/models/` (and keep the SQL files in sync for documentation).

### Frontend — SPA + prerendered landing
- `src/api/client.ts` is a shared axios instance; per-resource modules (`transactions.ts`, etc.) build on it. **API paths are always same-origin `/api/*`** — never hard-code a host. nginx proxies `/api` in production, Vite proxies it in dev.
- State is Zustand stores in `src/store/` (auth, language, theme, toasts). i18n is plain dictionaries in `src/i18n/` (`translations.ts`, `landing.ts`) consumed via the `useT` hook — no i18n library.
- Routing (`src/App.tsx`): `/` is the app (or landing when logged out); `/ru` and `/uz` are localized landing routes; app screens live behind `ProtectedRoute`.
- **Landing SEO pipeline:** `src/entry-landing.tsx` is server-rendered per language by `scripts/prerender.mjs` during `npm run build`, emitting static `dist/index.html`, `dist/ru/index.html`, `dist/uz/index.html`, plus `sitemap.xml`. SEO head tags come from `src/seo/`. If you change landing markup or meta, the prerender step (not just the SPA build) must run.

## Config & external services
- Backend config is env-only via `internal/config/config.go` (DB, `JWT_SECRET`, SMTP for password-reset email, `GEMINI_API_KEY`/`GEMINI_MODEL`). See `backend/.env.example` and root `.env.example`.
- **Receipt scanning** (`services/receipt_scanner.go`) calls the Gemini API and is optional — disabled unless `GEMINI_API_KEY` is set; default model is a free-tier Flash model.
- **Currency** (`services/currency_service.go`): transactions store both `amount` (entered currency) and `amount_base` (UZS) so historical totals stay correct.
