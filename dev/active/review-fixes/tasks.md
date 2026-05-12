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
