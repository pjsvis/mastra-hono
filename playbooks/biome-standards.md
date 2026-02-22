# Biome Standards Playbook

This playbook defines our standards for using Biome as our core linting, formatting, and code quality engine.

## 1. Proactive Fixing

We prefer tools that fix code rather than just complaining about it.

- **Primary Command**: Use `bun run lint` (which runs `biome check --write`).
- **Hook Strategy**: Our pre-commit hooks use `--write`. The goal is to ensure the code in the repository is clean, not to block the developer for minor styling differences.

## 2. Handling "any" (noExplicitAny)

While we strive for type safety, we recognize that in tests and generic helpers (like Mastra tools), `any` or `unknown` casts are sometimes necessary.

- **Prefer `unknown`**: When possible, use `unknown` and perform type guards.
- **Selective Suppression**: If `any` is truly required, use:
  ```typescript
  // biome-ignore lint/suspicious/noExplicitAny: <your reason here>
  const x: any = ...;
  ```
- **Reasoning Required**: Never use an empty ignore comment. Always explain why the check is being bypassed.

## 3. Formatting Standards

- **Indent**: 2 spaces.
- **Quotes**: Single quotes for JavaScript/TypeScript.
- **Semicolons**: Always required.
- **Trailing Commas**: ES5 style for JS/TS, none for JSON.

## 4. The "Scripts Lab" Exception

Experimental code that doesn't need to meet production quality standards should live in `scripts/lab/`. This directory is explicitly excluded from Biome and TypeScript checks in `biome.json` and `tsconfig.json`.

## 5. Pre-commit vs. CI

- **Pre-commit**: Light and fast. Includes formatting, linting (auto-fixing), and basic type-checking.
- **CI / Verify**: Comprehensive. Includes the full suite of `check` (lint check without write) and `test`.

When in doubt, run `bun run verify` before pushing to ensure the full pipeline will pass.
