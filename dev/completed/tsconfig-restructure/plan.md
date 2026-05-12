# tsconfig Restructure — Plan

## Problem

`tsconfig.json` excluded `test/**/*` and `**/*.spec.ts` so NestJS build output stayed clean. Side effect: VS Code's TS language server couldn't resolve the `@/` path alias in test files, producing a spurious `Cannot find module '@/main'` diagnostic.

Adding `tsconfig.test.json` with `include: ["src/**/*", "test/**/*"]` fixed the ts-jest side but not the IDE — VS Code uses the root `tsconfig.json` as its primary project file and ignores secondary tsconfigs unless they are explicitly referenced.

## Solution

Split into two configs with distinct roles:

- **`tsconfig.json`** — IDE-facing. Includes `src/` and `test/`, `noEmit: true`. VS Code's language server uses this; it can now resolve `@/` in test files.
- **`tsconfig.build.json`** — Build-facing. Excludes test files, emits to `dist/`. Used by NestJS CLI (`nest build` checks for this filename first) and ts-jest.
- **`tsconfig.test.json`** — Extends `tsconfig.build.json`, includes test files. Used by ts-jest for the integration project.

NestJS CLI auto-detects `tsconfig.build.json` — no `nest-cli.json` change needed. Dockerfile is unaffected.
