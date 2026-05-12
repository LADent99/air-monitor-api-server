# Gateway LISTEN/NOTIFY — Context

## Key Files

| File | Role |
|------|------|
| `src/readings/readings.gateway.ts` | The gateway — on disk, not registered in any module |
| `src/readings/readings.module.ts` | Re-add `ReadingsGateway` to `providers` here when ready |
| `src/app.module.ts` | No changes needed — `ReadingsModule` already imported |

## Why the Gateway Exists

PostgreSQL LISTEN/NOTIFY is the live-push mechanism. The ingestor calls `pg_notify('new_reading', payload)` after each insert. The gateway subscribes with a dedicated `pg.Client` (Prisma does not support NOTIFY) and re-emits the payload to all connected socket.io clients.

This is separate from the REST `/readings/:location/:field` endpoint — the gateway is real-time, the REST endpoint is historical queries.

## Current State (as of gateway disable)

```ts
// afterInit — problems:
this.connectPromise = this.pgListener
  .connect()
  .then(() => this.pgListener.query("LISTEN new_reading"))
  .then(() => {
    this.pgListener.on("notification", (msg) => {
      if (msg.channel === "new_reading" && msg.payload) {
        this.server.emit("reading", JSON.parse(msg.payload)); // unguarded
      }
    });
  });
// missing: .catch((err) => this.logger.error(...))

// onModuleDestroy — correct pattern, keep as-is:
async onModuleDestroy() {
  try { await this.connectPromise; } catch { /* empty */ }
  await this.pgListener?.end();
}
```

## Decisions

- **Keep `pg.Client` for LISTEN/NOTIFY** — Prisma does not support PostgreSQL notifications. This is intentional, not a gap.
- **Separate `pg.Client` from PrismaService's connection pool** — the LISTEN client must be a dedicated, long-lived connection. Do not share with PrismaService.
- **`onModuleDestroy` pattern is correct** — await promise in try/catch, then call `end()`. Do not change this sequence.

## Gotchas (from CLAUDE.md)

- Attach `.on("error", ...)` before calling `.connect()` — already done, keep it
- Chain LISTEN query inside the connect promise — already done, keep it
- `await` the full connect+LISTEN promise in `onModuleDestroy` before calling `end()` — already done, keep it
- Skipping any step causes either unhandled rejections or a Jest open handle
