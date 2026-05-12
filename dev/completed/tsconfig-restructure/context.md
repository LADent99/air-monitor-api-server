# tsconfig Restructure — Context

## Key Files

| File | Role |
|------|------|
| `tsconfig.json` | IDE config — includes `src/` + `test/`, `noEmit: true` |
| `tsconfig.build.json` | NestJS build config — excludes test files, emits to `dist/` |
| `tsconfig.test.json` | ts-jest config — extends `tsconfig.build.json`, includes test files |
| `jest.config.ts` | Integration project points `ts-jest` at `tsconfig.test.json` |

## Decisions

- **`noEmit: true` on root `tsconfig.json`** — prevents accidental compilation via `tsc` directly; all builds go through `nest build`.
- **NestJS auto-detects `tsconfig.build.json`** — no change to `nest-cli.json` or `Dockerfile` needed.
- **`tsconfig.test.json` extends `tsconfig.build.json`** not `tsconfig.json` — ensures test compilation uses the same strict settings as the build, just with test files included.

## Gotchas

- VS Code uses the root `tsconfig.json` as its language server project file. Secondary tsconfigs are not automatically picked up for IDE diagnostics — the root must include all files you want the LSP to understand.
- `nest build` looks for `tsconfig.build.json` before `tsconfig.json`. This is why splitting works cleanly without any NestJS config changes.
