# Sumly

A simple, production-ready personal & small-business finance tracker. Record
daily **income** and **expenses**, see your **balance**, filter transactions,
manage **categories** and **payment methods**, and view **daily / monthly
reports** — built for the Uzbek market (amounts in so'm).

- **Backend:** Go + Gin + GORM + PostgreSQL, JWT auth, bcrypt, clean architecture
- **Frontend:** React + TypeScript + Vite + Tailwind CSS + Zustand
- **Infra:** Everything runs in Docker — one command brings up the whole stack

---

## Quick start (Docker — recommended)

The entire stack (PostgreSQL + backend + frontend) runs in Docker with a single
command. You only need Docker installed.

```bash
# from the repository root
docker compose up --build
```

Then open:

| Service           | URL                          |
| ----------------- | ---------------------------- |
| **Frontend (app)**| http://localhost:3000        |
| Backend API       | http://localhost:8080/api    |
| API health check  | http://localhost:8080/health |

That's it. Register an account in the UI and start tracking. New accounts are
automatically seeded with default categories and payment methods.

To stop:

```bash
docker compose down          # stop containers
docker compose down -v       # stop and also delete the database volume
```

### Configuration (optional)

Defaults work out of the box. To override (ports, DB credentials, JWT secret),
copy the example env file and edit it:

```bash
cp .env.example .env
```

> **Production note:** always set a long, random `JWT_SECRET` before deploying.

---

## How it fits together

```
Browser ──▶ frontend (nginx :3000)
                │  serves the React SPA
                │  proxies /api/* ──▶ backend (Go :8080) ──▶ db (PostgreSQL :5432)
```

The frontend talks to the API using **same-origin** `/api` paths. In Docker,
nginx proxies them to the backend; in local dev, Vite proxies them. No API URL
is hard-coded.

---

## Project structure

```
sumly/
├── docker-compose.yml        # orchestrates db + backend + frontend
├── .env.example              # root config (optional overrides)
│
├── backend/                  # Go REST API (clean architecture)
│   ├── cmd/server/           # entrypoint (main.go)
│   ├── internal/
│   │   ├── config/           # env-based configuration
│   │   ├── database/         # GORM connection + AutoMigrate
│   │   ├── models/           # domain entities
│   │   ├── repositories/     # data-access layer (the only place using GORM)
│   │   ├── services/         # business logic (HTTP-agnostic)
│   │   ├── handlers/         # HTTP handlers (parse, validate, respond)
│   │   ├── middleware/       # JWT auth middleware
│   │   ├── routes/           # composition root: wires everything + routing
│   │   └── utils/            # jwt, bcrypt, JSON responses
│   ├── migrations/           # canonical SQL schema (reference)
│   ├── Dockerfile
│   └── .env.example
│
└── frontend/                 # React + TS SPA
    ├── src/
    │   ├── api/              # axios client + per-resource API modules
    │   ├── components/       # reusable UI (Layout, cards, rows, toasts)
    │   ├── pages/            # one file per screen
    │   ├── routes/           # ProtectedRoute guard
    │   ├── store/            # Zustand stores (auth, toasts)
    │   ├── types/            # shared TypeScript types
    │   └── utils/            # formatting helpers
    ├── Dockerfile            # builds the bundle, serves via nginx
    ├── nginx.conf            # SPA + /api proxy
    └── .env.example
```

The architecture layers strictly: **handlers → services → repositories →
database**. Business logic never touches HTTP, and only repositories touch the
ORM — which keeps the code easy to test and extend.

---

## API reference

All responses are JSON. Success: `{ "data": ... }`. Error: `{ "error": "..." }`.
Lists add `{ "meta": { page, page_size, total, total_pages } }`.

Protected endpoints require an `Authorization: Bearer <token>` header.

### Auth
| Method | Path                 | Description                             |
| ------ | -------------------- | --------------------------------------- |
| POST   | `/api/auth/register` | Register; seeds defaults; returns token |
| POST   | `/api/auth/login`    | Login; returns token                    |
| GET    | `/api/auth/me`       | Current user (protected)                |

### Transactions (protected)
| Method | Path                    | Description                 |
| ------ | ----------------------- | --------------------------- |
| GET    | `/api/transactions`     | List (filters + pagination) |
| POST   | `/api/transactions`     | Create                      |
| GET    | `/api/transactions/:id` | Get one                     |
| PUT    | `/api/transactions/:id` | Update                      |
| DELETE | `/api/transactions/:id` | Delete                      |

**Query filters** for the list endpoint:
`type=income|expense`, `category_id`, `payment_method_id`,
`date_from=YYYY-MM-DD`, `date_to=YYYY-MM-DD`, `page`, `page_size`.

### Categories (protected)
`GET / POST /api/categories`, `PUT / DELETE /api/categories/:id`

### Payment methods (protected)
`GET / POST /api/payment-methods`, `PUT / DELETE /api/payment-methods/:id`

### Reports (protected)
| Method | Path                                  | Description                          |
| ------ | ------------------------------------- | ------------------------------------ |
| GET    | `/api/reports/dashboard`              | Total balance + today + this month   |
| GET    | `/api/reports/daily?date=YYYY-MM-DD`  | One day's summary + transactions     |
| GET    | `/api/reports/monthly?month=YYYY-MM`  | Month summary + per-day breakdown    |

### Example

```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ali","email":"ali@example.com","password":"secret123"}'

# Use the returned token
TOKEN=...

# Create an expense
curl -X POST http://localhost:8080/api/transactions \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"type":"expense","amount":50000,"category_id":6,"payment_method_id":1,"description":"Lunch","transaction_date":"2026-06-08"}'
```

---

## Default seed data

Every new account is seeded with:

- **Income categories:** Sales, Service, Debt Returned, Bonus, Other
- **Expense categories:** Food, Transport, Rent, Salary, Product Purchase, Utilities, Marketing, Other
- **Payment methods:** Cash, Card, Bank, Click, Payme, Debt

---

## Local development (without Docker)

You can also run the pieces directly.

### Prerequisites
- Go 1.22+
- Node.js 20+
- A running PostgreSQL (or just the DB container: `docker compose up db`)

### Backend
```bash
cd backend
cp .env.example .env        # adjust DB_* if needed (DB_HOST=localhost)
go mod download
go run ./cmd/server         # listens on :8080, auto-migrates on boot
```

### Frontend
```bash
cd frontend
cp .env.example .env        # defaults are fine
npm install
npm run dev                 # http://localhost:5173 (proxies /api -> :8080)
```

---

## Database migrations

The backend runs **GORM AutoMigrate** on startup, so the schema is always in
sync — no manual step needed. For teams that prefer explicit migrations, the
canonical SQL (with all indexes) lives in [`backend/migrations/`](backend/migrations)
and can be applied with a tool like [golang-migrate](https://github.com/golang-migrate/migrate).

---

## Design notes & future-readiness

The MVP is intentionally small but structured so these can be added without a
rewrite:

- **Multiple cash accounts** — add an `accounts` table + `account_id` on
  transactions; the repository/service split means handlers barely change.
- **Debt tracking, Excel/PDF export, Telegram bot** — new services/handlers,
  reusing the existing repositories.
- **Multi-branch & team roles** — add `organization_id` scoping alongside the
  existing per-user scoping in repositories.

Security & correctness baked in today:
- JWT auth middleware on every protected route
- Every query is scoped by `user_id` — users can only see their own data
- bcrypt password hashing; passwords never serialized
- Request validation (binding tags + service-level business rules)
- PostgreSQL indexes on the hot query paths
- Consistent JSON envelopes and centralized error handling
