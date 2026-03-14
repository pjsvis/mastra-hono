---
name: typescript-standards
description: TypeScript patterns and standards for a Bun-first, AI-friendly environment.
---

# TypeScript Standards Playbook

## Purpose
This playbook defines idiomatic TypeScript patterns used in the Mastra-Hono project. These patterns are selected for high type-safety, excellent developer experience (IDE autocomplete), and AI-maintainability.

---

## 1. Loose Autocomplete
When you want to provide a set of known string literals but still allow any string, use the `(string & {})` trick. This prevents TypeScript from collapsing the union into a simple `string` type, preserving IDE suggestions.

```typescript
// ✅ Standard Pattern
type ModelNames = "gpt-4o" | "claude-3-5-sonnet" | "nemo-3" | (string & {});

// Usage:
const model: ModelNames = ""; // IDE will suggest the literals above
```

---

## 2. Branded Types (Nominal Typing)
Use branded types to prevent passing the wrong ID to a function (e.g., passing a `UserId` where a `TaskId` is expected), even if both are strings.

```typescript
type Brand<K, T> = K & { __brand: T };

type TaskId = Brand<string, "TaskId">;
type UserId = Brand<string, "UserId">;

function getTask(id: TaskId) { /* ... */ }

const myUserId = "user_123" as UserId;
// getTask(myUserId); // ❌ Compile error: UserId is not assignable to TaskId
```

---

## 3. Exhaustive Switches
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

---

## 4. Result Pattern (Error Handling)
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

---

## 5. Zod Type Inference
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

---

## 6. Bun-First Patterns

### Explicit Main Check
Use `import.meta.main` to detect if a file is being run directly.

```typescript
if (import.meta.main) {
  console.log("Running script directly...");
}
```

### Path Resolution
Use `import.meta.dirname` for reliable path resolution relative to the current file.

```typescript
import { join } from "path";
const configPath = join(import.meta.dirname, "config.json");
```

---

## 7. AI-Friendly Typing
- **Avoid `any`**: Always use `unknown` if the type is truly unknown, then narrow it.
- **Prefer Interfaces for Objects**: They generally provide better error messages and performance than type aliases for complex objects.
- **Explicit Return Types**: While TS can infer them, explicit return types on exported functions help both humans and AI understand the contract without digging into the implementation.

```typescript
// ✅ AI-Friendly
export function processTask(id: TaskId): Promise<boolean> {
  // ...
}
```
