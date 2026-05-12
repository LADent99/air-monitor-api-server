# Review Fixes — Implementation Plan

## Context

Code-review and code-quality agents identified critical and high issues in the `task/init` scaffold. This plan addresses all of them in three logical commits.

## Scope

### Commit 1 — Test helper (`test/helpers/db.ts`)
- `insertData` catches errors and logs with `console.error` instead of rethrowing — causes false-green tests when inserts fail silently
- Dead `// console.info(...)` comment on line 79

### Commit 2 — Source correctness
- `PrismaService` constructor casts `process.env.DATABASE_URL as string` — undefined passes through silently, error surfaces cryptically at `$connect()`
- `GetHistoryQueryDto` interval regex `/^\d+[smh]$/` rejects valid `1d`, `7d`, `1w` requests with 400

### Commit 3 — Gateway disable + dev doc
- `ReadingsGateway` has two unguarded error paths: `connectPromise` has no `.catch()` (unhandled rejection on startup failure), and `JSON.parse(msg.payload)` is unguarded in the notification handler
- Decision: remove gateway from `ReadingsModule` providers, keep file on disk, track remaining work in `dev/active/gateway-listen-notify/`

## Implementation Steps

### Commit 1 — test/helpers/db.ts
1. Delete the `// console.info("Inserted reading: ", reading);` comment (line 79)
2. Replace `console.error("Failed to insert reading: ", err)` with `throw new Error(\`insertData failed: \${err}\`)`

### Commit 2 — PrismaService + DTO
3. `src/prisma/prisma.service.ts`: read `process.env.DATABASE_URL` into a const before `new PrismaPg(...)`, throw a descriptive `Error` if falsy, pass the const to the adapter
4. `src/readings/get-history-query.dto.ts`: change both `@Matches` regexes from `/^\d+[smh]$/` to `/^\d+[smhdw]$/`; update JSDoc to list supported units (s, m, h, d, w)

### Commit 3 — Gateway disable
5. `src/readings/readings.module.ts`: remove `ReadingsGateway` from `providers` array and remove its import line
6. Create `dev/active/gateway-listen-notify/` dev docs tracking what remains before re-enabling

## Verification

```bash
npm run build    # compiles cleanly — gateway file present but unused
npm run lint     # passes
npm run test     # unit tests pass
```
