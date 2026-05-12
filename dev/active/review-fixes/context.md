# Review Fixes — Context

## Key Files

| File | Role |
|------|------|
| `test/helpers/db.ts` | Test DB utilities — `insertData` error swallowing fixed here |
| `src/prisma/prisma.service.ts` | PrismaClient wrapper — `DATABASE_URL` validation added at constructor |
| `src/readings/get-history-query.dto.ts` | DTO for GET /readings query params — interval regex expanded |
| `src/readings/readings.module.ts` | ReadingsGateway removed from providers here |
| `src/readings/readings.gateway.ts` | Left on disk untouched — re-enabled after gateway dev doc tasks complete |
| `dev/active/gateway-listen-notify/` | Tracks remaining gateway work |

## Decisions Made

- **Interval units**: expand regex to `[smhdw]` only (days + weeks). Month support deferred — no UI need yet.
- **Gateway disable strategy**: remove from `ReadingsModule` providers, keep file on disk for easy re-enable. Do not delete.
- **`insertData` error**: rethrow as `Error` (not just rethrow `err`) so the message is always a string in test output.
- **`DATABASE_URL` validation**: throw at constructor time, not at `$connect()` — fail fast before NestJS module graph is fully initialized.

## Gotchas

- `PrismaService` extends `PrismaClient` — `super()` must be called before any `this` access. The validation must use a local `const` before calling `super()`, not `this.something`.
- Removing `ReadingsGateway` from `ReadingsModule` providers also requires removing the import statement — ESLint will catch an unused import but the build hook will surface it first.
- `readings.gateway.ts` remaining on disk with `@WebSocketGateway` decorator is fine — NestJS only instantiates providers registered in a module's `providers` array.
