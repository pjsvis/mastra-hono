# Design Heuristics

This document outlines the core architectural and design heuristics for the Mastra Agent Forge repository. While playbooks provide concrete workflows and step-by-step guides, these heuristics describe *why* and *how* we shape our systems.

## 1. The Result/Option Return Pattern

**Heuristic: Handle failures gracefully by returning an Error/Result object rather than throwing exceptions.**

When building tools or functions that agents and UIs rely on, it is highly preferable to handle edge cases internally and return a structured object indicating success or failure.

### Why?
- **Simplified UI handling:** The UI or consumer simply checks `if (result.error)` and displays the error state to the user, allowing them to fix and resubmit. It avoids crashing the UI and needing global Error Boundaries.
- **Agent resilience:** LLM agents handle structured error messages in JSON responses much better than abrupt stack traces or `catch` blocks. The agent reads the `error` string and can autonomously self-correct and re-invoke the tool.

### Example
Instead of this:
```typescript
if (!input.isValid) {
  throw new Error("Invalid input provided"); // Hard crash or requires try/catch
}
```

Do this:
```typescript
// Schema: outputSchema: z.object({ result: z.number().optional(), error: z.string().optional() })

if (!input.isValid) {
  return { error: "Invalid input provided. Please provide a positive number." }; // Graceful failure
}

return { result: 42 };
```

## 2. Type-Safety Strictness Zones

**Heuristic: Type-safety should be uncompromisingly strict in production paths, and entirely disabled in scratchpads.**

Instead of scattering `@ts-ignore` or `any` throughout the codebase to accommodate quick prototyping, we establish geographical zones with distinct compiler rules:

- **The `@src` zone:** Hyper-strict. `noExplicitAny` is enforced. This ensures the production runtime is bulletproof and refactors are safe.
- **The `tests` & `@scripts` zone:** Moderately strict. Generic types and `any` are allowed sparingly when dealing with mocking or broad scripting tasks.
- **The `scripts/lab` zone:** The wild west. TypeScript and Biome are disabled for this folder (`skipLibCheck`, `ignore`). This gives developers a low-friction sandbox to explore ideas without wrestling the compiler.

## 3. Separation of Review & Implementation

**Heuristic: The session that writes the code cannot approve the code.**

Implemented via the `td` CLI, we strictly enforce that the agent or user session that begins a task and creates a handoff cannot be the one to approve it. This creates a natural architectural boundary that forces code to be auditable, readable, and contextually complete before it can be merged.