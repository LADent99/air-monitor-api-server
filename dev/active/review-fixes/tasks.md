# Review Fixes Tasks

## In Progress

### Commit 1 — test/helpers/db.ts
- [ ] Remove dead `// console.info("Inserted reading: ", reading)` comment (line 79)
- [ ] Replace `console.error(...)` in catch with `throw new Error(\`insertData failed: \${err}\`)`

### Commit 2 — Source correctness
- [ ] `src/prisma/prisma.service.ts`: validate `DATABASE_URL` at constructor time — read into `const`, throw descriptive `Error` if falsy, pass const to `PrismaPg`
- [ ] `src/readings/get-history-query.dto.ts`: change both `@Matches` regexes to `/^\d+[smhdw]$/`; update JSDoc to list supported units (s, m, h, d, w)

### Commit 3 — Gateway disable + dev doc
- [ ] `src/readings/readings.module.ts`: remove `ReadingsGateway` from `providers` and remove its import line
- [ ] Create `dev/active/gateway-listen-notify/` dev docs (plan, context, tasks) for the remaining gateway work

## Completed

- [x] Planning approved
