# Sumly local MCP server — design

**Date:** 2026-06-26
**Status:** Approved (design); pending implementation plan

## Goal

Expose a Sumly employee's income/expense data to MCP clients (e.g. Claude) as a
read-only **list view** that includes, for each transaction: type (income vs.
expense), amount, currency, base amount (UZS), category, payment method, comment
(description), and date. Plus supporting read tools for totals and for listing
the user's categories and payment methods.

## Non-goals

- No create / update / delete. The server is strictly read-only.
- No new business or query logic — it reuses the existing repositories.
- No changes to the REST API, frontend, or live schema.

## Architecture

A new Go binary, `backend/cmd/mcp-server`, inside the existing
`github.com/sumly/backend` module so it can import the `internal/*` packages.

- **Transport:** stdio (standard for a local MCP client integration).
- **MCP SDK:** the official Go SDK `github.com/modelcontextprotocol/go-sdk`
  (added to `go.mod`).
- **Data access:** connects directly to the same Postgres via
  `database.Connect(cfg)` and reuses `internal/models` and
  `internal/repositories`. It does **not** call `database.Migrate` — it is a
  reader and must not alter the schema.
- **Composition root:** `main.go` is the single wiring point (mirroring the
  REST app's `routes.go` convention): load config → open DB → resolve user →
  construct repositories → register tools → serve over stdio.

Request flow per tool call: `MCP tool handler → repository → GORM → Postgres`.
Tool handlers play the role handlers play in the REST app: parse/validate args,
call a repository, format the response. No GORM access outside repositories.

## User scoping

The MCP bypasses JWT, so it must enforce ownership scoping itself.

- Identity comes from the env var **`SUMLY_USER_EMAIL`**, set in the MCP server
  entry of the client config.
- On startup, resolve email → user via `UserRepository.FindByEmail`, cache the
  user ID, and scope **every** query to it.
- Missing or unknown `SUMLY_USER_EMAIL` → fail fast at startup with a clear
  error message.
- Each employee runs their own MCP server instance with their own email, so they
  only ever see their own data.

DB connection settings reuse the existing `config.Load()` env vars
(`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSLMODE`).

## Tools

### 1. `list_transactions` — the core list view
Arguments (all optional):

| Arg | Type | Notes |
|-----|------|-------|
| `type` | string | `income` or `expense`; omitted = both |
| `date_from` | string | `YYYY-MM-DD`, inclusive |
| `date_to` | string | `YYYY-MM-DD`, inclusive |
| `category` | string | category name (case-insensitive) or numeric id |
| `payment_method` | string | payment method name (case-insensitive) or numeric id |
| `page` | int | default 1 |
| `page_size` | int | default 20, max 100 |

Behaviour: resolve `category` / `payment_method` to IDs (scoped to the user),
build a `repositories.TransactionFilter`, call `TransactionRepository.List`.

Each returned row contains: **date, type, amount, currency, amount_base (UZS),
category name, payment method name, card_last4 (if any), comment
(description)**. Response also includes pagination meta: `total`, `page`,
`page_size`.

### 2. `get_summary` — totals for a period
Arguments: `date_from`, `date_to` (`YYYY-MM-DD`, both optional; default = current
calendar month). Calls `TransactionRepository.TotalsBetween`. Returns income,
expense, and net in base currency (UZS).

### 3. `list_categories`
No arguments. Returns the user's categories: `id`, `name`, `type`.

### 4. `list_payment_methods`
No arguments. Returns the user's payment methods: `id`, `name`, `is_card`.

## Output format

Every tool returns its result as **both**:
1. a human-readable text rendering (a clean list/table the model can relay), and
2. the underlying structured data,

so the client can present a natural "list view".

## Error handling

- **Startup config errors** (missing DB vars, missing/unknown
  `SUMLY_USER_EMAIL`) → exit with a clear message.
- **Per-call argument errors** (bad date format, unknown category/payment name)
  → returned as a tool error result; the server keeps running.
- **DB errors** → wrapped with context and returned as tool errors.

## Files & wiring

- `backend/cmd/mcp-server/main.go` — composition root + stdio serve.
- `backend/cmd/mcp-server/tools.go` (or per-tool files) — tool registration,
  argument parsing, name→ID resolution, row formatting.
- `go.mod` / `go.sum` — add the Go MCP SDK.
- README + `.env.example` note + a sample MCP client config snippet showing how
  an employee registers the server with `SUMLY_USER_EMAIL` and DB vars.
- **No new repository methods are required** (verified): `UserRepository.FindByEmail`,
  `TransactionRepository.List` / `TransactionRepository.TotalsBetween`,
  `CategoryRepository.ListByUser`, and `PaymentMethodRepository.ListByUser`
  all already exist. For name→ID resolution, the tool layer matches against the
  results of `ListByUser` (no DB-level name lookup needed).

## Testing

- Table-driven unit tests for argument → `TransactionFilter` mapping
  (type/date/page bounds, defaults).
- Unit tests for the row/summary text-formatting helpers.
- A focused test for category / payment-method name→ID resolution
  (name match, id match, unknown → error). DB-touching paths can use a small
  in-memory/sqlite or be kept thin enough to test the pure helpers without a DB.

## Build / run

- Build: `go build ./cmd/mcp-server`.
- Run (manual): env vars set, `go run ./cmd/mcp-server` — speaks MCP over stdio.
- Registered in the MCP client config like any local stdio MCP server.
