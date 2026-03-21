---
id: PB-005
title: "Biome Standards Playbook"
role: "Build | Review"
infrastructure: [biome]
last_updated: "2026-03-21"
tags: [playbook]
---

# Biome Standards Playbook

## Table of Contents

- [Purpose](#purpose)
- [Proactive Fixing (Formatting vs Linting)](#proactive-fixing-formatting-vs-linting)
  - [Formatter: Biome](#formatter-biome)
  - [Linter: OxLint](#linter-oxlint)
- [Handling "any" (noExplicitAny)](#handling-"any"-noexplicitany)
  - [Prefer `unknown`](#prefer-`unknown`)
  - [Selective Suppression](#selective-suppression)
  - [Reasoning Required](#reasoning-required)
- [Formatting Standards](#formatting-standards)
  - [Indentation](#indentation)
  - [Quotes](#quotes)
  - [Semicolons](#semicolons)
  - [Trailing Commas](#trailing-commas)
- [The "Scripts Lab" Exception](#the-"scripts-lab"-exception)
  - [What Goes in `scripts/lab/`](#what-goes-in-`scriptslab`)
  - [Configuration](#configuration)
  - [OxLint Configuration](#oxlint-configuration)
- [Pre-commit vs. CI](#pre-commit-vs-ci)
  - [Pre-commit: Light and Fast](#pre-commit-light-and-fast)
  - [CI / Verify: Comprehensive](#ci--verify-comprehensive)
  - [When in Doubt](#when-in-doubt)
- [OxLint Responsibilities (Best-Practice Baseline)](#oxlint-responsibilities-best-practice-baseline)
  - [OxLint is the Lint Engine](#oxlint-is-the-lint-engine)
  - [Avoid Stylistic Overlap](#avoid-stylistic-overlap)
  - [Type Checking Remains `tsc --noEmit`](#type-checking-remains-`tsc---noemit`)
  - [Recommended Baseline](#recommended-baseline)
- [Best Practices](#best-practices)
  - [1. Run Formatting Before Committing](#1-run-formatting-before-committing)
  - [2. Fix Linting Issues Before Pushing](#2-fix-linting-issues-before-pushing)
  - [3. Use Type Guards Instead of `any`](#3-use-type-guards-instead-of-`any`)
  - [4. Document Ignore Comments](#4-document-ignore-comments)
  - [5. Use Scripts Lab for Experiments](#5-use-scripts-lab-for-experiments)
  - [6. Run Verify Before Pushing](#6-run-verify-before-pushing)
- [Common Pitfalls](#common-pitfalls)
  - [Pitfall 1: Mixing Formatting and Linting](#pitfall-1-mixing-formatting-and-linting)
  - [Pitfall 2: Using `any` Without Reasoning](#pitfall-2-using-`any`-without-reasoning)
  - [Pitfall 3: Forgetting Trailing Commas](#pitfall-3-forgetting-trailing-commas)
  - [Pitfall 4: Not Running Verify Before Pushing](#pitfall-4-not-running-verify-before-pushing)
  - [Pitfall 5: Putting Experimental Code in Production](#pitfall-5-putting-experimental-code-in-production)
- [References](#references)

## Purpose
This playbook defines our standards for using **Biome (formatting)** and **OxLint (linting)** together without overlap, plus TypeScript for authoritative type checking. It provides comprehensive guidelines for maintaining consistent code quality across the project while avoiding conflicts between different tools.

**Core Philosophy:** Separate responsibilities to avoid overlap and conflicting rules. Biome handles formatting, OxLint handles linting, and TypeScript handles type checking. Each tool has a clear, non-overlapping domain.


## Proactive Fixing (Formatting vs Linting)

We separate responsibilities to avoid overlap and conflicting rules.

### Formatter: Biome

Biome is the source of truth for formatting.

**Primary command:**
```bash
bun run lint  # Runs biome check --write
```

**What Biome handles:**
- Code formatting (indentation, quotes, semicolons)
- Trailing commas
- Line length
- Whitespace

### Linter: OxLint

OxLint is the source of truth for linting.

**Primary command:**
```bash
bun run lint:ox  # Read-only
```

**Optional autofix:**
```bash
bun run lint:ox:fix
```

**What OxLint handles:**
- Code quality issues
- Potential bugs
- Performance problems
- Security vulnerabilities
- Import/export issues

**Why this separation matters:**
- **No conflicts:** Each tool has a clear domain
- **Faster feedback:** Formatting and linting can run independently
- **Better maintainability:** Easier to update and configure each tool
- **Clearer errors:** Users know which tool to check for specific issues

## Handling "any" (noExplicitAny)

While we strive for type safety, we recognize that in tests and generic helpers (like Mastra tools), `any` or `unknown` casts are sometimes necessary.

### Prefer `unknown`

When possible, use `unknown` and perform type guards.

**Good:**
```typescript
function processData(data: unknown): Result {
  if (isValidData(data)) {
    return process(data);
  }
  throw new Error("Invalid data");
}
```

**Bad:**
```typescript
function processData(data: any): Result {
  return process(data);  // No type safety
}
```

### Selective Suppression

If `any` is truly required, use a biome ignore comment with reasoning.

**Good:**
```typescript
// biome-ignore lint/suspicious/noExplicitAny: External API doesn't provide types
const x: any = externalApi.getData();
```

**Bad:**
```typescript
// biome-ignore lint/suspicious/noExplicitAny
const x: any = externalApi.getData();  // No reasoning!
```

### Reasoning Required

Never use an empty ignore comment. Always explain why the check is being bypassed.

**Template:**
```typescript
// biome-ignore lint/suspicious/noExplicitAny: <specific reason why any is necessary>
```

**Valid reasons:**
- External API doesn't provide types
- Working with legacy code
- Test mocking
- Dynamic data structures
- Interop with untyped libraries

## Formatting Standards

### Indentation

- **Spaces:** 2 spaces
- **Tabs:** Never use tabs

**Example:**
```typescript
function example() {
  if (condition) {
    doSomething();
  }
}
```

### Quotes

- **JavaScript/TypeScript:** Single quotes
- **JSON:** Double quotes (required by JSON spec)

**Example:**
```typescript
const message = 'Hello, world!';  // Single quotes
const config = { "key": "value" };  // JSON uses double quotes
```

### Semicolons

- **Always required:** Never omit semicolons

**Example:**
```typescript
// Good
const x = 1;
const y = 2;

// Bad
const x = 1
const y = 2
```

### Trailing Commas

- **JavaScript/TypeScript:** ES5 style (trailing commas allowed)
- **JSON:** No trailing commas (required by JSON spec)

**Example:**
```typescript
// Good (JS/TS)
const obj = {
  a: 1,
  b: 2,
};

// Good (JSON)
{
  "a": 1,
  "b": 2
}
```

## The "Scripts Lab" Exception

Experimental code that doesn't need to meet production quality standards should live in `scripts/lab/`.

### What Goes in `scripts/lab/`

- Experimental prototypes
- Proof-of-concept implementations
- Temporary test scripts
- Exploratory code
- Code that doesn't need type safety

### Configuration

This directory is explicitly excluded from Biome and TypeScript checks in `biome.json` and `tsconfig.json`.

**biome.json:**
```json
{
  "overrides": [
    {
      "include": ["scripts/lab/**"],
      "linter": {
        "rules": {
          "all": false
        }
      },
      "formatter": {
        "enabled": false
      }
    }
  ]
}
```

**tsconfig.json:**
```json
{
  "exclude": ["scripts/lab/**"]
}
```

### OxLint Configuration

If needed, add matching ignore patterns for OxLint so all tools agree.

**oxlint.json:**
```json
{
  "ignore": ["scripts/lab/**"]
}
```

**Why this matters:**
- **Freedom:** Developers can experiment without friction
- **Clarity:** Clear separation between production and experimental code
- **Consistency:** All tools agree on what to check
- **Safety:** Experimental code can't accidentally enter production

## Pre-commit vs. CI

### Pre-commit: Light and Fast

Runs formatting and basic type checking.

**Commands:**
```bash
bun run lint      # Biome formatting
bun run typecheck # TypeScript type checking
```

**What it checks:**
- Code formatting (Biome)
- Basic type errors (TypeScript)
- Quick feedback loop

**Why:** Fast feedback during development without blocking on comprehensive checks.

### CI / Verify: Comprehensive

Runs full pipeline including linting and tests.

**Command:**
```bash
bun run check  # Biome format check + OxLint + tsc --noEmit
bun run test   # All tests
```

**What it checks:**
- Code formatting (Biome, read-only)
- Linting (OxLint)
- Type checking (TypeScript)
- All tests

**Why:** Comprehensive validation before merging to main.

### When in Doubt

Run `bun run verify` before pushing to ensure the full pipeline will pass.

```bash
bun run verify
```

**What verify does:**
1. Runs Biome format check (read-only)
2. Runs OxLint
3. Runs TypeScript type checking
4. Runs all tests

## OxLint Responsibilities (Best-Practice Baseline)

### OxLint is the Lint Engine

OxLint is our primary linting engine. Enable `typescript` and `import` plugins as the default baseline.

**Configuration:**
```json
{
  "plugins": ["typescript", "import"]
}
```

### Avoid Stylistic Overlap

Keep OxLint style rules off and let Biome handle formatting.

**Configuration:**
```json
{
  "categories": {
    "style": "off"
  }
}
```

**Why:** Prevents conflicts between OxLint and Biome formatting rules.

### Type Checking Remains `tsc --noEmit`

TypeScript's compiler (`tsc`) remains the authoritative type checker. OxLint's type checking complements `tsc` but does not replace it.

**Why:**
- `tsc` is the official TypeScript compiler
- OxLint's type checking is faster but less comprehensive
- Using both provides better coverage

### Recommended Baseline

**OxLint categories:**
- **correctness:** error
- **suspicious:** warn
- **perf:** warn
- **style:** off

**Biome linter:**
- **disabled:** Let OxLint handle linting

**Example configuration:**
```json
{
  "categories": {
    "correctness": "error",
    "suspicious": "warn",
    "perf": "warn",
    "style": "off"
  },
  "plugins": ["typescript", "import"]
}
```

## Best Practices

### 1. Run Formatting Before Committing

Always run Biome formatting before committing.

```bash
bun run lint
```

**Why:** Ensures consistent formatting across the codebase.

### 2. Fix Linting Issues Before Pushing

Always fix OxLint issues before pushing.

```bash
bun run lint:ox
bun run lint:ox:fix  # If autofix available
```

**Why:** Prevents CI failures and maintains code quality.

### 3. Use Type Guards Instead of `any`

Prefer `unknown` with type guards over `any`.

```typescript
// Good
function process(data: unknown): Result {
  if (isValidData(data)) {
    return process(data as DataType);
  }
  throw new Error("Invalid data");
}

// Bad
function process(data: any): Result {
  return process(data);
}
```

**Why:** Maintains type safety while handling dynamic data.

### 4. Document Ignore Comments

Always explain why you're ignoring a rule.

```typescript
// biome-ignore lint/suspicious/noExplicitAny: External API doesn't provide types
const data = externalApi.getData() as any;
```

**Why:** Provides context for future reviewers and prevents misuse.

### 5. Use Scripts Lab for Experiments

Put experimental code in `scripts/lab/`.

```bash
# Good
scripts/lab/experiment.ts

# Bad
src/experiment.ts
```

**Why:** Keeps production code clean and type-safe.

### 6. Run Verify Before Pushing

Always run `bun run verify` before pushing.

```bash
bun run verify
```

**Why:** Ensures the full pipeline passes before CI.

## Common Pitfalls

### Pitfall 1: Mixing Formatting and Linting

**Problem:** Using both Biome and OxLint for formatting.

**Solution:** Let Biome handle formatting, OxLint handle linting.

```json
// Good
{
  "biome": { "formatter": { "enabled": true } },
  "oxlint": { "categories": { "style": "off" } }
}
```

### Pitfall 2: Using `any` Without Reasoning

**Problem:** Using `any` without explaining why.

**Solution:** Always provide reasoning in ignore comments.

```typescript
// Bad
// biome-ignore lint/suspicious/noExplicitAny
const x: any = getData();

// Good
// biome-ignore lint/suspicious/noExplicitAny: External API doesn't provide types
const x: any = getData();
```

### Pitfall 3: Forgetting Trailing Commas

**Problem:** Inconsistent trailing comma usage.

**Solution:** Use ES5 style for JS/TS, none for JSON.

```typescript
// Good (JS/TS)
const obj = { a: 1, b: 2, };

// Good (JSON)
{ "a": 1, "b": 2 }
```

### Pitfall 4: Not Running Verify Before Pushing

**Problem:** Pushing code that fails CI.

**Solution:** Always run `bun run verify` before pushing.

```bash
bun run verify
git push
```

### Pitfall 5: Putting Experimental Code in Production

**Problem:** Experimental code in `src/` or `tests/`.

**Solution:** Use `scripts/lab/` for experimental code.

```bash
# Good
scripts/lab/experiment.ts

# Bad
src/experiment.ts
```

## References

- [Biome Documentation](https://biomejs.dev/) – Official Biome documentation
- [OxLint Documentation](https://oxlint.rs/) – Official OxLint documentation
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) – TypeScript language reference
- [Loading Process Playbook](./loading-process-playbook.md) – Two-step loading process pattern
- [Mastra Agent Playbook](./mastra-agent-playbook.md) – Mastra-specific patterns
- [Agentic SDLC Playbook](./agentic-sdlc.md) – Agent-assisted development practices

---

**Version:** 1.0  
**Last Updated:** 2026-03-21  
**Maintained by:** Mastra Development Team
