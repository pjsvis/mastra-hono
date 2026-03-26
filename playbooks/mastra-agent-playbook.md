---
id: PB-015
title: "Mastra Agent Playbook"
role: "Build | Review"
infrastructure: [mastra]
last_updated: "2026-03-21"
tags: [playbook]
---

# Mastra Agent Playbook

## Purpose
This playbook outlines the architectural patterns, heuristics, and type-safety rules for our Mastra Agent Forge repository. It provides guidelines for maintaining a robust, production-ready codebase while preserving space for experimentation.

**Core Philosophy:** Maintain strict type-safety in production code while allowing flexibility in experimental zones. Balance structure with innovation.


## Project Structure and Type-Safety Zones

Our repository is divided into distinct zones, each with its own strictness level regarding type safety and linting. This structure allows us to maintain production quality while enabling rapid experimentation.

### Strict Zone: `@src/`

**Location:** `src/` (Aliased as `@src/*`)

**Purpose:** Production-hardened code. This is where agents, tools, workflows, and core server logic live.

**Rules:**
- Strict type-safety is enforced
- No `any` types allowed
- Avoid `@ts-ignore` or `as any`
- All Biome linting rules apply fully
- Must have comprehensive unit testing
- All function parameters and return types must be explicitly typed

**What goes here:**
- Agent definitions (`src/mastra/agents/`)
- Tool definitions (`src/mastra/tools/`)
- Workflow definitions (`src/mastra/workflows/`)
- Server logic (`src/index.ts`)
- Core business logic

### Promotable Zone: `@scripts/` and `tests/`

**Location:** `scripts/` (excluding `lab/`) and `tests/`

**Purpose:** Automation, scaffolding, deployment scripts, and test files.

**Rules:**
- Type-safety is enforced but can be slightly more relaxed than `@src/`
- Prefer strong typing, but `as any` or generic types may be used cautiously (e.g., in generic test helpers)
- Designed to eventually be promoted or used strictly within CI/CD
- Biome linting applies but may have some relaxations

**What goes here:**
- Build scripts (`scripts/build.ts`)
- Deployment scripts (`scripts/deploy.ts`)
- Test files (`tests/**/*.test.ts`)
- Utility scripts (`scripts/utils.ts`)

### Experimental Zone: `scripts/lab/`

**Location:** `scripts/lab/`

**Purpose:** A sandbox for experimental code, proofs-of-concept, and exploratory agent building.

**Rules:**
- **No type checking.** TypeScript and Biome errors are ignored or disabled here
- Do not import code from `lab/` into `@src/` or `tests/`
- Use this space to rapidly prototype ideas without compiler friction
- Code here is not subject to pre-commit checks

**What goes here:**
- Experimental agent prototypes
- Proof-of-concept implementations
- Exploratory code
- Temporary test scripts

**Why this separation matters:**
- **Quality:** Strict zones ensure production code meets high standards
- **Innovation:** Experimental zones allow rapid iteration without friction
- **Safety:** Clear boundaries prevent experimental code from leaking into production

## Mastra Patterns

### Creating Tools

All tools must be created using `@mastra/core/tools` and defined with Zod schemas for validation.

**Template:**

```typescript
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const myTool = createTool({
  id: 'my-tool',
  description: 'What the tool does',
  inputSchema: z.object({
    // Strict typing required here
    param1: z.string().describe('Description of param1'),
    param2: z.number().optional().describe('Description of param2'),
  }),
  outputSchema: z.object({
    // Define output structure
    result: z.string(),
  }),
  execute: async ({ inputData }) => {
    // Implementation
    return {
      result: 'output',
    };
  },
});
```

**Best Practices:**
- Use descriptive `id` values (kebab-case)
- Provide clear `description` for both the tool and each parameter
- Define both `inputSchema` and `outputSchema` with Zod
- Keep `execute` functions focused and testable
- Handle errors gracefully and return structured error responses

### Creating Agents

Agents should be defined in `src/mastra/agents/`.

**Template:**

```typescript
import { Agent } from '@mastra/core/agent';
import { myTool } from '../tools/my-tool';

export const myAgent = new Agent({
  id: 'my-agent',
  name: 'Agent Name',
  instructions: 'Your system prompt here',
  model: 'model-provider/model-name',
  tools: { myTool }, // Register tools here
});
```

**Best Practices:**
- Use descriptive `id` values (kebab-case)
- Provide clear `name` for display purposes
- Write comprehensive `instructions` that define the agent's behavior
- Specify the exact `model` to use (don't rely on defaults)
- Register only the tools the agent needs
- Keep agent definitions focused on a single purpose

### Creating Workflows

Workflows go in `src/mastra/workflows/`. They should consist of distinct steps created with `createStep` and strung together via `createWorkflow`. Handle dependencies and error states gracefully.

**Template:**

```typescript
import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

// Define step 1
const step1 = createStep({
  id: 'step-1',
  description: 'Description of step 1',
  inputSchema: z.object({
    input: z.string(),
  }),
  outputSchema: z.object({
    result: z.string(),
  }),
  execute: async ({ inputData }) => {
    // Implementation
    return {
      result: 'output',
    };
  },
});

// Define step 2
const step2 = createStep({
  id: 'step-2',
  description: 'Description of step 2',
  inputSchema: z.object({
    input: z.string(),
  }),
  outputSchema: z.object({
    result: z.string(),
  }),
  execute: async ({ inputData }) => {
    // Implementation
    return {
      result: 'output',
    };
  },
});

// Create workflow
export const myWorkflow = createWorkflow({
  id: 'my-workflow',
  description: 'Description of the workflow',
  steps: [
    {
      id: 'step-1',
      step: step1,
    },
    {
      id: 'step-2',
      step: step2,
      dependencies: ['step-1'], // Specify dependencies
    },
  ],
});
```

**Best Practices:**
- Keep steps focused and single-purpose
- Define clear input/output schemas for each step
- Specify dependencies explicitly
- Handle errors gracefully at each step
- Use descriptive IDs and descriptions
- Consider retry logic for transient failures

## Pre-Commit Expectations

Before code enters the `main` branch, the pre-commit hook (`bun run precommit`) must pass. This runs:

1. **`biome check`** – Linting and formatting checks
2. **`tsc --noEmit`** – Type checking
3. **`bun test`** – Unit tests

**What this means:**
- All code must pass Biome linting rules
- All type errors must be resolved
- All tests must pass
- No `any` types in strict zones
- No `@ts-ignore` comments in strict zones

**If you're exploring and don't want to deal with types:**
- Do it in `scripts/lab/` where type-safety is disabled
- Never import from `lab/` into `@src/` or `tests/`
- Remember that code in `lab/` is not subject to pre-commit checks

**How to run checks manually:**

```bash
# Run all checks
bun run precommit

# Run individual checks
bun run lint      # Biome check
bun run typecheck # TypeScript check
bun run test      # Unit tests
```

## Best Practices

### 1. Always Use Zod Schemas

Every tool, agent, and workflow should use Zod schemas for validation. This ensures type safety and provides clear documentation.

**Good:**
```typescript
inputSchema: z.object({
  userId: z.string().describe('The user ID'),
  count: z.number().min(1).max(100).describe('Number of items'),
})
```

**Bad:**
```typescript
inputSchema: z.object({
  userId: z.any(),
  count: z.any(),
})
```

### 2. Keep Functions Focused

Each function, step, or tool should do one thing well. If a function is doing too much, split it into smaller, testable pieces.

**Good:**
```typescript
const validateInput = (input: string): boolean => { /* ... */ };
const processData = (data: string): Result => { /* ... */ };
const saveResult = (result: Result): void => { /* ... */ };
```

**Bad:**
```typescript
const processEverything = (input: string): void => {
  // Validate, process, and save all in one function
};
```

### 3. Write Tests for Production Code

All code in `@src/` must have corresponding tests. Aim for high test coverage, but prioritize testing critical paths.

**Test structure:**
```typescript
import { describe, it, expect } from 'bun:test';
import { myTool } from '../tools/my-tool';

describe('myTool', () => {
  it('should process valid input', async () => {
    const result = await myTool.execute({
      inputData: { param1: 'test' },
    });
    expect(result).toBeDefined();
  });

  it('should handle invalid input', async () => {
    await expect(async () => {
      await myTool.execute({
        inputData: { param1: 123 }, // Wrong type
      });
    }).toThrow();
  });
});
```

### 4. Use Descriptive Names

Use clear, descriptive names for functions, variables, and types. Avoid abbreviations unless they're widely understood.

**Good:**
```typescript
const getUserById = (userId: string): User => { /* ... */ };
const calculateTotalPrice = (items: Item[]): number => { /* ... */ };
```

**Bad:**
```typescript
const getU = (id: string): User => { /* ... */ };
const calc = (i: Item[]): number => { /* ... */ };
```

### 5. Handle Errors Gracefully

Never let errors propagate unhandled. Always catch errors and return structured error responses.

**Good:**
```typescript
try {
  const result = await operation();
  return { success: true, data: result };
} catch (error) {
  return {
    success: false,
    error: error instanceof Error ? error.message : 'Unknown error',
  };
}
```

**Bad:**
```typescript
const result = await operation(); // Might throw
return result;
```

### 6. Document Your Code

Use JSDoc comments to document functions, classes, and complex logic.

**Good:**
```typescript
/**
 * Processes user input and returns a formatted result.
 * @param input - The raw user input string
 * @returns A formatted result object
 * @throws {ValidationError} If input is invalid
 */
const processInput = (input: string): Result => { /* ... */ };
```

**Bad:**
```typescript
const processInput = (input: string): Result => { /* ... */ };
```

## Common Pitfalls

### Pitfall 1: Using `any` Type

**Problem:** Using `any` defeats the purpose of TypeScript and can lead to runtime errors.

**Solution:** Use proper types or `unknown` with type guards.

```typescript
// Bad
const data: any = fetchData();

// Good
const data: unknown = fetchData();
if (isValidData(data)) {
  // Use data with proper typing
}
```

### Pitfall 2: Ignoring Type Errors

**Problem:** Using `@ts-ignore` or `as any` to silence type errors.

**Solution:** Fix the underlying type issue or move the code to `scripts/lab/`.

```typescript
// Bad
// @ts-ignore
const result = someUntypedFunction();

// Good
const result = someUntypedFunction() as ExpectedType;
```

### Pitfall 3: Not Testing Edge Cases

**Problem:** Only testing the happy path and not handling errors or edge cases.

**Solution:** Write tests for error conditions, null inputs, and boundary values.

```typescript
// Test edge cases
it('should handle empty input', async () => { /* ... */ });
it('should handle null input', async () => { /* ... */ });
it('should handle maximum values', async () => { /* ... */ });
```

### Pitfall 4: Importing from Experimental Zone

**Problem:** Importing code from `scripts/lab/` into `@src/` or `tests/`.

**Solution:** Never import from `lab/`. If code is ready for production, move it to the appropriate zone.

```typescript
// Bad
import { experimentalFunction } from '../../scripts/lab/experimental';

// Good
import { productionFunction } from '../utils/production';
```

### Pitfall 5: Skipping Pre-Commit Checks

**Problem:** Using `--no-verify` to skip pre-commit checks.

**Solution:** Fix the issues properly. If you need to skip checks, work in `scripts/lab/`.

```bash
# Bad
git commit --no-verify

# Good
bun run precommit
git commit
```

## References

- [Mastra Documentation](https://mastra.ai/) – Official Mastra framework documentation
- [Zod Documentation](https://zod.dev/) – Schema validation library
- [Biome Documentation](https://biomejs.dev/) – Linting and formatting tool
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) – TypeScript language reference
- [Loading Process Playbook](./loading-process-playbook.md) – Two-step loading process pattern
- [Git Workflow Playbook](./git-workflow-playbook.md) – Branching and review workflow
- [Agentic Integrity Playbook](./agentic-integrity-playbook.md) – Ensuring agent outputs are trustworthy

---

**Version:** 1.0  
**Last Updated:** 2026-03-21  
**Maintained by:** PolyVis Development Team
