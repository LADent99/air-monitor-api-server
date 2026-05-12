# Gateway LISTEN/NOTIFY Tasks

## Blocked (complete review-fixes first)

Gateway is currently removed from `ReadingsModule`. All items below are blocked until `dev/active/review-fixes` is complete and closed.

## In Progress

- [ ] Fix `afterInit` — add `.catch((err) => this.logger.error(...))` to `connectPromise` chain
- [ ] Fix notification handler — wrap `JSON.parse(msg.payload)` in try/catch, log on failure, skip emit
- [ ] Inject `ConfigService` — replace `process.env.DATABASE_URL` in `pg.Client` constructor with `configService.getOrThrow<string>("DATABASE_URL")`
- [ ] Fix CORS — read `CORS_ORIGIN` from `ConfigService`; pass to `@WebSocketGateway` options
- [ ] Write unit test for `onModuleDestroy` — mock `pg.Client`, verify it awaits connect promise before calling `end()`

## Re-enable

- [ ] Re-add `ReadingsGateway` to `ReadingsModule` providers and imports
- [ ] `npm run build && npm run lint && npm run test` — all pass
- [ ] Manual verify: connect via wscat or browser WebSocket, trigger a reading, confirm event received

## Completed

- [x] Gateway issues identified in code review
- [x] Gateway removed from ReadingsModule (gateway file kept on disk)
- [x] Dev doc created
