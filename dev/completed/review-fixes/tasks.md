# Review Fixes Tasks

## In Progress

_(none)_

## Completed

- [x] Planning approved
- [x] Remove dead `// console.info("Inserted reading: ", reading)` comment (line 79)
- [x] Replace `console.error(...)` in catch with `throw new Error(\`insertData failed: \${err}\`)`
- [x] `src/prisma/prisma.service.ts`: validate `DATABASE_URL` at constructor time — read into `const`, throw descriptive `Error` if falsy, pass const to `PrismaPg`
- [x] `src/readings/get-history-query.dto.ts`: change both `@Matches` regexes to `/^\d+[smhdw]$/`; update JSDoc to list supported units (s, m, h, d, w)
- [x] `src/readings/readings.module.ts`: remove `ReadingsGateway` from `providers` and remove its import line
- [x] Create `dev/active/gateway-listen-notify/` dev docs (plan, context, tasks) for the remaining gateway work

## Completed (round 2 — post-review fixes)

- [x] `src/readings/readings.service.ts`: fix `HistoryRow.bucket` type `Date` → `string` (wire value confirmed string by integration test)
- [x] `src/filters/http-exception.filter.ts`: consolidate to single `error` log with stack for 500s; `warn` only for 4xx
- [x] `src/main.ts`: parse PORT as integer with `parseInt(..., 10)`
- [x] `Dockerfile`: remove `COPY prisma/` and `COPY prisma.config.ts` from production stage
- [x] `docker-compose.yml`: pin TimescaleDB image to `2.14.0-pg16`
- [x] `test/helpers/db.ts`: move `databaseUrlValidation()` + pool init out of module scope into lazy `getPool()`; `resetDatabase` → `async Promise<void>`; `Error({ cause: err })`
- [x] `helm/templates/middleware.yaml`: IP ranges now templated from `values.yaml`
- [x] `helm/values.yaml`: add `ingress.ipWhitelist` with k3s pod CIDR and home LAN ranges
- [x] `prisma/schema.prisma`: add comment explaining URL supplied via `prisma.config.ts`
- [x] `tsconfig.json`: bump target ES2021 → ES2022 (Node 22 compatible; required for `Error({ cause })`)
