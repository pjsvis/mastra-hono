# Mastra Agent Playbook

This playbook outlines the architectural patterns, heuristics, and type-safety rules for our Mastra Agent Forge repository. Follow these guidelines to maintain a robust, production-ready codebase while preserving space for experimentation.

## 1. Project Structure and Type-Safety Zones

Our repository is divided into distinct zones, each with its own strictness level regarding type safety and linting.

### 🟢 Strict Zone: `@src/`
- **Location:** `src/` (Aliased as `@src/*`)
- **Purpose:** Production-hardened code. This is where agents, tools, workflows, and core server logic live.
- **Rules:**
  - Strict type-safety is enforced.
  - No `any` types allowed. Avoid `@ts-ignore` or `as any`.
  - All Biome linting rules apply fully.
  - Must have comprehensive unit testing.

### 🟡 Promotable Zone: `@scripts/` and `tests/`
- **Location:** `scripts/` (excluding `lab/`) and `tests/`
- **Purpose:** Automation, scaffolding, deployment scripts, and test files.
- **Rules:**
  - Type-safety is enforced but can be slightly more relaxed than `@src/`.
  - Prefer strong typing, but `as any` or generic types may be used cautiously (e.g., in generic test helpers).
  - Designed to eventually be promoted or used strictly within CI/CD.

### 🔴 Experimental Zone: `scripts/lab/`
- **Location:** `scripts/lab/`
- **Purpose:** A sandbox for experimental code, proofs-of-concept, and exploratory agent building.
- **Rules:**
  - **No type checking.** TypeScript and Biome errors are ignored or disabled here.
  - Do not import code from `lab/` into `@src/` or `tests/`.
  - Use this space to rapidly prototype ideas without compiler friction.

## 2. Mastra Patterns

### Creating Tools
All tools must be created using `@mastra/core/tools` and defined with Zod schemas for validation.

```typescript
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const myTool = createTool({
  id: 'my-tool',
  description: 'What the tool does',
  inputSchema: z.object({
    // Strict typing required here
  }),
  execute: async ({ inputData }) => {
    // Implementation
  },
});
```

### Creating Agents
Agents should be defined in `src/mastra/agents/`.

```typescript
import { Agent } from '@mastra/core/agent';

export const myAgent = new Agent({
  id: 'my-agent',
  name: 'Agent Name',
  instructions: 'Your system prompt here',
  model: 'model-provider/model-name',
  tools: { myTool }, // Register tools here
});
```

### Workflows
Workflows go in `src/mastra/workflows/`. They should consist of distinct steps created with `createStep` and strung together via `createWorkflow`. Handle dependencies and error states gracefully.

## 3. Pre-Commit Expectations
Before code enters the `main` branch, the pre-commit hook (`bun run precommit`) must pass. This runs:
1. `biome check`
2. `tsc --noEmit`
3. `bun test`

Ensure your changes do not break these checks. If you are exploring and don't want to deal with types, do it in `scripts/lab/`.