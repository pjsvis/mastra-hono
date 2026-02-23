# Biome Standards Playbook

This playbook defines our standards for using **Biome (formatting)** and **OxLint (linting)** together without overlap, plus TypeScript for authoritative type checking.

## 1. Proactive Fixing (Formatting vs Linting)

We separate responsibilities to avoid overlap and conflicting rules.

- **Formatter**: Biome is the source of truth for formatting.
  - Primary command: `bun run lint` (runs `biome check --write`)
- **Linter**: OxLint is the source of truth for linting.
  - Primary command: `bun run lint:ox` (read-only)
  - Optional autofix: `bun run lint:ox:fix`

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

Experimental code that doesn't need to meet production quality standards should live in `scripts/lab/`. This directory is explicitly excluded from Biome and TypeScript checks in `biome.json` and `tsconfig.json`. If needed, add matching ignore patterns for OxLint so all tools agree.

## 5. Pre-commit vs. CI

- **Pre-commit**: Light and fast. Runs formatting (`bun run lint`) and basic type checking (`bun run typecheck`).
- **CI / Verify**: Comprehensive. Runs `bun run check` (Biome format check + OxLint + `tsc --noEmit`) and `bun run test`.

When in doubt, run `bun run verify` before pushing to ensure the full pipeline will pass.

## 6. OxLint Responsibilities (Best-Practice Baseline)

- **OxLint is the lint engine.** Enable `typescript` and `import` plugins as the default baseline.
- **Avoid stylistic overlap.** Keep OxLint style rules off and let Biome handle formatting.
- **Type checking remains `tsc --noEmit`.** tsgo-backed linting complements `tsc` but does not replace it.

Recommended baseline:
- OxLint categories: correctness (error), suspicious (warn), perf (warn), style (off)
- Biome linter: disabled
