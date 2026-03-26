---
id: PB-025
title: "TypeScript Standards Playbook"
role: "Build"
infrastructure: [bun, zod]
last_updated: "2026-03-21"
tags: [playbook]
---

# TypeScript Standards Playbook

## Table of Contents

- [Purpose](#purpose)
- [Loose Autocomplete](#loose-autocomplete)
- [Branded Types (Nominal Typing)](#branded-types-nominal-typing)
- [Exhaustive Switches](#exhaustive-switches)
- [Result Pattern (Error Handling)](#result-pattern-error-handling)
- [Zod Type Inference](#zod-type-inference)
- [Bun-First Patterns](#bun-first-patterns)
  - [Explicit Main Check](#explicit-main-check)
  - [Path Resolution](#path-resolution)
- [AI-Friendly Typing](#ai-friendly-typing)
- [Best Practices](#best-practices)
  - [1. Always Use Zod for Data Structures](#1-always-use-zod-for-data-structures)
  - [2. Use Branded Types for IDs](#2-use-branded-types-for-ids)
  - [3. Use Exhaustive Switches](#3-use-exhaustive-switches)
  - [4. Use Result Pattern for Error Handling](#4-use-result-pattern-for-error-handling)
  - [5. Use Explicit Return Types](#5-use-explicit-return-types)
- [Common Pitfalls](#common-pitfalls)
  - [Pitfall 1: Using `any` Instead of `unknown`](#pitfall-1-using-`any`-instead-of-`unknown`)
  - [Pitfall 2: Not Using Branded Types for IDs](#pitfall-2-not-using-branded-types-for-ids)
  - [Pitfall 3: Missing Exhaustive Switch Cases](#pitfall-3-missing-exhaustive-switch-cases)
  - [Pitfall 4: Not Deriving Types from Zod Schemas](#pitfall-4-not-deriving-types-from-zod-schemas)
- [References](#references)

## Purpose
This playbook defines idiomatic TypeScript patterns used in the Mastra-Hono project. These patterns are selected for high type-safety, excellent developer experience (IDE autocomplete), and AI-maintainability. It provides comprehensive guidelines for writing TypeScript code that is both human-readable and AI-friendly.

**Core Philosophy:** Write TypeScript that is type-safe, maintainable, and AI-friendly. Use explicit types, avoid `any`, prefer Zod for validation, and follow patterns that enhance IDE autocomplete and make code easier for AI agents to understand and modify.


## Loose Autocomplete

When you want to provide a set of known string literals but still allow any string, use the `(string & {})` trick. This prevents TypeScript from collapsing the union into a simple `string` type, preserving IDE suggestions.

```typescript
// ✅ Standard Pattern
type ModelNames = "gpt-4o" | "claude-3-5-sonnet" | "nemo-3" | (string & {});

// Usage:
const model: ModelNames = ""; // IDE will suggest the literals above
```

**Why this matters:**
- **IDE Autocomplete:** Provides suggestions for known values
- **Flexibility:** Still allows arbitrary strings if needed
- **Type Safety:** Maintains type information for known values
- **AI-Friendly:** AI agents can see the available options

**When to use:**
- When you have a set of known values but want to allow extensions
- When you want IDE suggestions for common values
- When you need to support both known and unknown values

## Branded Types (Nominal Typing)

Use branded types to prevent passing the wrong ID to a function (e.g., passing a `UserId` where a `TaskId` is expected), even if both are strings.

```typescript
type Brand<K, T> = K & { __brand: T };

type TaskId = Brand<string, "TaskId">;
type UserId = Brand<string, "UserId">;

function getTask(id: TaskId) { /* ... */ }

const myUserId = "user_123" as UserId;
// getTask(myUserId); // ❌ Compile error: UserId is not assignable to TaskId
```

**Why this matters:**
- **Type Safety:** Prevents mixing different ID types
- **Compile-Time Errors:** Catches mistakes at compile time
- **Self-Documenting:** Makes the purpose of IDs explicit
- **AI-Friendly:** AI agents understand the distinction between ID types

**When to use:**
- When you have different types of IDs (TaskId, UserId, etc.)
- When you want to prevent accidental misuse
- When you need nominal typing in TypeScript

## Exhaustive Switches

Ensure that all possible cases of a union (e.g., an enum or literal union) are handled at compile-time using the `never` type.

```typescript
type Status = "open" | "in_progress" | "closed";

function handleStatus(status: Status) {
  switch (status) {
    case "open": return "Starting...";
    case "in_progress": return "Working...";
    case "closed": return "Done.";
    default: {
      // If a new status is added to the union, this will fail to compile
      const _exhaustiveCheck: never = status;
      return _exhaustiveCheck;
    }
  }
}
```

**Why this matters:**
- **Compile-Time Safety:** Ensures all cases are handled
- **Future-Proof:** Adding new cases forces you to update all switches
- **AI-Friendly:** AI agents can see all possible cases
- **Maintainability:** Prevents missing case bugs

**When to use:**
- When handling union types or enums
- When you want to ensure all cases are covered
- When you want compile-time guarantees

## Result Pattern (Error Handling)

Prefer the `[error, data]` tuple pattern (via `await-to-js`) over try/catch blocks for cleaner control flow and explicit error handling that AI agents can easily follow.

```typescript
import { to } from "await-to-js";

async function fetchData() {
  const [err, data] = await to(fetch("...").then(r => r.json()));
  
  if (err) {
    console.error("Failed to fetch:", err);
    return null;
  }
  
  return data;
}
```

**Why this matters:**
- **Explicit Error Handling:** Errors are handled explicitly
- **Cleaner Control Flow:** No nested try/catch blocks
- **AI-Friendly:** AI agents can easily follow the error handling pattern
- **Consistent:** Provides a consistent error handling pattern

**When to use:**
- When handling async operations
- When you want explicit error handling
- When you want to avoid try/catch nesting

## Zod Type Inference

Always derive types from Zod schemas to ensure your runtime validation and compile-time types are perfectly in sync.

```typescript
import { z } from "zod";

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

// ✅ Derive the type from the schema
type User = z.infer<typeof UserSchema>;
```

**Why this matters:**
- **Type Safety:** Runtime validation matches compile-time types
- **Single Source of Truth:** Schema defines both validation and types
- **Maintainability:** Changes to schema automatically update types
- **AI-Friendly:** AI agents can see the schema and types together

**When to use:**
- When defining data structures
- When you need runtime validation
- When you want to keep types and schemas in sync

## Bun-First Patterns

### Explicit Main Check

Use `import.meta.main` to detect if a file is being run directly.

```typescript
if (import.meta.main) {
  console.log("Running script directly...");
}
```

**Why this matters:**
- **Explicit:** Clear indication when file is run directly
- **Bun-Specific:** Leverages Bun's import.meta.main feature
- **AI-Friendly:** AI agents can understand when code runs

**When to use:**
- When you have scripts that can be imported or run directly
- When you need to detect execution context

### Path Resolution

Use `import.meta.dirname` for reliable path resolution relative to the current file.

```typescript
import { join } from "path";
const configPath = join(import.meta.dirname, "config.json");
```

**Why this matters:**
- **Reliable:** Works consistently across different execution contexts
- **Bun-Specific:** Leverages Bun's import.meta.dirname feature
- **AI-Friendly:** AI agents can understand path resolution

**When to use:**
- When you need to resolve paths relative to the current file
- When you need to load configuration files

## AI-Friendly Typing

- **Avoid `any`**: Always use `unknown` if the type is truly unknown, then narrow it.
- **Prefer Interfaces for Objects**: They generally provide better error messages and performance than type aliases for complex objects.
- **Explicit Return Types**: While TS can infer them, explicit return types on exported functions help both humans and AI understand the contract without digging into the implementation.

```typescript
// ✅ AI-Friendly
export function processTask(id: TaskId): Promise<boolean> {
  // ...
}
```

**Why this matters:**
- **Type Safety:** Avoiding `any` maintains type safety
- **Better Error Messages:** Interfaces provide clearer error messages
- **Explicit Contracts:** Return types make the API clear
- **AI-Friendly:** AI agents can understand the API without reading implementation

**When to use:**
- Always avoid `any`
- Use interfaces for complex objects
- Use explicit return types for exported functions

## Best Practices

### 1. Always Use Zod for Data Structures

Define data structures with Zod schemas and derive types from them.

```typescript
// Good
const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
});
type User = z.infer<typeof UserSchema>;

// Bad
type User = {
  id: string;
  name: string;
};
```

**Why:** Maintains type safety and runtime validation in sync.

### 2. Use Branded Types for IDs

Use branded types to prevent ID confusion.

```typescript
// Good
type TaskId = Brand<string, "TaskId">;
type UserId = Brand<string, "UserId">;

// Bad
type TaskId = string;
type UserId = string;
```

**Why:** Prevents passing wrong IDs to functions.

### 3. Use Exhaustive Switches

Ensure all cases are handled in switches.

```typescript
// Good
function handleStatus(status: Status) {
  switch (status) {
    case "open": return "Starting...";
    case "in_progress": return "Working...";
    case "closed": return "Done.";
    default: {
      const _exhaustiveCheck: never = status;
      return _exhaustiveCheck;
    }
  }
}

// Bad
function handleStatus(status: Status) {
  if (status === "open") return "Starting...";
  if (status === "in_progress") return "Working...";
  return "Done."; // Missing case for "closed"
}
```

**Why:** Ensures all cases are handled at compile time.

### 4. Use Result Pattern for Error Handling

Prefer `[error, data]` tuples over try/catch.

```typescript
// Good
const [err, data] = await to(fetch("...").then(r => r.json()));
if (err) {
  console.error("Failed to fetch:", err);
  return null;
}

// Bad
try {
  const data = await fetch("...").then(r => r.json());
  return data;
} catch (err) {
  console.error("Failed to fetch:", err);
  return null;
}
```

**Why:** Cleaner control flow and explicit error handling.

### 5. Use Explicit Return Types

Add explicit return types to exported functions.

```typescript
// Good
export function processTask(id: TaskId): Promise<boolean> {
  // ...
}

// Bad
export function processTask(id: TaskId) {
  // ...
}
```

**Why:** Makes the API clear without reading implementation.

## Common Pitfalls

### Pitfall 1: Using `any` Instead of `unknown`

**Problem:** Using `any` loses type safety.

```typescript
// Bad
function processData(data: any) {
  return data.value; // May fail at runtime
}

// Good
function processData(data: unknown) {
  if (isValidData(data)) {
    return (data as DataType).value;
  }
  throw new Error("Invalid data");
}
```

**Solution:** Use `unknown` and type guards.

### Pitfall 2: Not Using Branded Types for IDs

**Problem:** Different ID types can be confused.

```typescript
// Bad
type TaskId = string;
type UserId = string;

function getTask(id: TaskId) { /* ... */ }
const userId = "user_123" as UserId;
getTask(userId); // No error!

// Good
type TaskId = Brand<string, "TaskId">;
type UserId = Brand<string, "UserId">;

function getTask(id: TaskId) { /* ... */ }
const userId = "user_123" as UserId;
getTask(userId); // Compile error!
```

**Solution:** Use branded types for IDs.

### Pitfall 3: Missing Exhaustive Switch Cases

**Problem:** New cases added to unions are not handled.

```typescript
// Bad
function handleStatus(status: Status) {
  if (status === "open") return "Starting...";
  if (status === "in_progress") return "Working...";
  return "Done."; // Missing "closed" case
}

// Good
function handleStatus(status: Status) {
  switch (status) {
    case "open": return "Starting...";
    case "in_progress": return "Working...";
    case "closed": return "Done.";
    default: {
      const _exhaustiveCheck: never = status;
      return _exhaustiveCheck;
    }
  }
}
```

**Solution:** Use exhaustive switches with `never` type.

### Pitfall 4: Not Deriving Types from Zod Schemas

**Problem:** Types and schemas can get out of sync.

```typescript
// Bad
type User = {
  id: string;
  name: string;
  email: string;
};

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  // Missing email!
});

// Good
const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});
type User = z.infer<typeof UserSchema>;
```

**Solution:** Always derive types from Zod schemas.

## References

- [TypeScript Handbook](https://www.typescriptlang.org/docs/) – Official TypeScript documentation
- [Zod Documentation](https://zod.dev/) – Schema validation library
- [await-to-js Documentation](https://github.com/scopsy/await-to-js) – Error handling library
- [Bun Documentation](https://bun.sh/docs) – Bun runtime documentation
- [Loading Process Playbook](./loading-process-playbook.md) – Two-step loading process pattern
- [Mastra Agent Playbook](./mastra-agent-playbook.md) – Mastra-specific patterns
- [Agentic SDLC Playbook](./agentic-sdlc.md) – Agent-assisted development practices

---

**Version:** 1.0  
**Last Updated:** 2026-03-21  
**Maintained by:** PolyVis Development Team
