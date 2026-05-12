# tsconfig Restructure Tasks

## Completed

- [x] Identify root cause: VS Code LSP uses root `tsconfig.json` which excluded `test/`
- [x] Create `tsconfig.build.json` (copy of original `tsconfig.json` — excludes test, emits to dist)
- [x] Rewrite `tsconfig.json` as IDE-facing config (includes `src/` + `test/`, `noEmit: true`)
- [x] Update `tsconfig.test.json` to extend `tsconfig.build.json`
- [x] Update `jest.config.ts` integration project to use `tsconfig.test.json`
- [x] Verify: `npm run build && npm run lint && npm run test` all pass
- [x] Confirm Dockerfile requires no changes (NestJS auto-detects `tsconfig.build.json`)
