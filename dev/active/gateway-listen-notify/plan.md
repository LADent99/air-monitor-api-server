# Gateway LISTEN/NOTIFY — Implementation Plan

## Context

`ReadingsGateway` was removed from `ReadingsModule` providers during the `task/init` review-fixes pass because it had two unguarded error paths and used `process.env` directly instead of `ConfigService`. The gateway file (`src/readings/readings.gateway.ts`) remains on disk. This dev doc tracks everything that must be fixed before re-enabling it.

The gateway's purpose: subscribe to PostgreSQL `LISTEN new_reading` and push incoming sensor readings to connected WebSocket clients via socket.io.

## Issues to Fix Before Re-enabling

### 1. Unhandled rejection on startup (`afterInit`)
`connectPromise` is assigned but never has `.catch()`. If `pgListener.connect()` or the LISTEN query fails, the rejection is unhandled at the point of failure — `onModuleDestroy` only catches it at teardown, which is too late and may not even run.

**Fix**: add `.catch((err) => this.logger.error(\`pg LISTEN setup failed: \${err.message}\`))` at the end of the `connectPromise` chain in `afterInit`.

### 2. Unguarded `JSON.parse` in notification handler
`this.server.emit("reading", JSON.parse(msg.payload))` — a malformed NOTIFY payload throws inside the pg notification callback, which has no error boundary. The exception is uncaught.

**Fix**: wrap in try/catch, log the error, and skip the emit if parsing fails.

### 3. `DATABASE_URL` read from `process.env` directly
The gateway constructs a `pg.Client` using `process.env.DATABASE_URL` rather than injecting `ConfigService`. This is inconsistent with the rest of the app and makes the gateway harder to test.

**Fix**: inject `ConfigService` into the gateway constructor and read `DATABASE_URL` via `configService.getOrThrow<string>("DATABASE_URL")`.

### 4. Hardcoded CORS origin
`@WebSocketGateway({ cors: { origin: "*" } })` — wildcard CORS means any origin can subscribe to live sensor pushes. Must be config-driven before production.

**Fix**: read `CORS_ORIGIN` from `ConfigService` and pass it to `@WebSocketGateway` options. Fall back to `"*"` only in development.

### 5. No unit test for `onModuleDestroy`
The teardown path (await connectPromise + call `end()`) is the highest-risk code in this file per the project CLAUDE.md gotchas. It has no test coverage.

**Fix**: write a unit test that mocks `pg.Client`, verifies `onModuleDestroy` awaits the connect promise before calling `end()`.

## Re-enable Checklist

All five items above must be done, then:
- Add `ReadingsGateway` back to `ReadingsModule` providers and imports
- Run `npm run build && npm run test` — all pass
- Manually verify WebSocket connection in a browser/wscat

## Implementation Steps

1. Fix `afterInit` — add `.catch()` to `connectPromise` chain
2. Fix notification handler — wrap `JSON.parse` in try/catch
3. Inject `ConfigService` — replace `process.env.DATABASE_URL` with injected config
4. Fix CORS — drive `origin` from `CORS_ORIGIN` env var via `ConfigService`
5. Write unit test for `onModuleDestroy` teardown sequence
6. Re-add `ReadingsGateway` to `ReadingsModule` providers
7. Verify: build, lint, test, manual WS check
