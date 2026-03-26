---
id: PB-003
title: "Agentic SDLC Playbook"
role: "Orchestrate"
infrastructure: [td, mastra]
last_updated: "2026-03-21"
tags: [playbook]
---

# Agentic SDLC Playbook

## Purpose
This playbook outlines heuristics for an Agentic Software Development Life Cycle (SDLC). As software development evolves to include autonomous and semi-autonomous AI agents, our practices must adapt to maximize their leverage. This document provides guidance on how to structure code, context, and workflows to enable effective agent-assisted development.

**Core Philosophy:** Design software and workflows that align with how agents think and work. Agents excel at pattern matching, constraint satisfaction, and declarative reasoning. By structuring our code and processes accordingly, we can maximize agent effectiveness while maintaining quality and reliability.


## Verifiable Goals (TDD as Agent Rails)

**Heuristic:** Give agents a verifiable win condition, not open-ended instructions.

### The Problem

Agents struggle with ambiguous requests like "make this component better." Without clear success criteria, agents may:
- Make unnecessary changes
- Break existing functionality
- Over-engineer solutions
- Miss the actual intent

### The Solution

However, they excel at satisfying constraints. Test-Driven Development (TDD) is the ultimate agent guardrail.

### Practice

Write a failing unit or integration test that defines the expected behavior, edge cases, and required schemas. Hand the agent the failing test output and instruct it to make the test pass. The test suite acts as an objective, automated reviewer.

### Example

**Bad (Open-ended):**
```
"Improve the user authentication component"
```

**Good (Verifiable):**
```typescript
// Test file
describe('Authentication', () => {
  it('should reject invalid credentials', async () => {
    const result = await authenticate('user@example.com', 'wrong-password');
    expect(result.success).toBe(false);
    expect(result.error).toBe('INVALID_CREDENTIALS');
  });

  it('should rate limit after 5 failed attempts', async () => {
    // ... test implementation
  });
});
```

Then instruct the agent:
```
"Make these tests pass. The tests define the required behavior for authentication."
```

### Benefits

- **Objective Success Criteria:** Tests clearly define what "done" looks like
- **Regression Prevention:** Agents can't break existing functionality without failing tests
- **Edge Case Coverage:** Tests explicitly handle edge cases that agents might miss
- **Self-Documenting:** Tests serve as executable documentation

## Context Density over Context Volume

**Heuristic:** Feed agents highly relevant, dense information. Avoid dumping the entire repository into the context window.

### The Problem

LLMs suffer from "lost in the middle" syndrome. If you provide 100,000 tokens of loosely related code, their attention degrades, and they are more likely to:
- Hallucinate connections between unrelated systems
- Miss critical details buried in the context
- Make incorrect assumptions about system behavior
- Generate code that doesn't fit the overall architecture

### The Solution

Keep files small and modular (Single Responsibility Principle). When an agent needs to work on a feature, only load the specific interface, the implementation file, and the associated tests into its context.

### Practice

**File Structure:**
```
src/
  auth/
    auth.service.ts        # Implementation
    auth.interface.ts      # Interface/Types
    auth.test.ts           # Tests
    auth.utils.ts          # Helper functions
```

**Context Loading:**
```typescript
// When asking an agent to work on auth
// Load ONLY these files:
- src/auth/auth.interface.ts  # Defines the contract
- src/auth/auth.service.ts    # Current implementation
- src/auth/auth.test.ts       # Expected behavior
```

### Benefits

- **Higher Quality:** Focused context leads to better decisions
- **Faster Responses:** Less context means faster processing
- **Fewer Errors:** Reduced hallucination and incorrect assumptions
- **Better Maintainability:** Small, focused files are easier to understand

## Declarative State over Imperative Mutation

**Heuristic:** Agents reason better about declarative state machines than deeply nested imperative logic.

### The Problem

Agents are pattern-matchers. They can easily grasp and modify declarative configurations because the "desired state" is explicitly described. Imperative code full of side-effects, deep `for` loops, and mutated variables is harder for agents to debug because the state is hidden in the execution flow.

### The Solution

Prefer pure functions, immutable data structures, and state machines. If a complex imperative loop is required, isolate it into a pure function with a strict input/output contract that the agent can test in isolation.

### Practice

**Declarative (Good):**
```typescript
// State machine
type AuthState = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'authenticated', user: User }
  | { status: 'error', error: string };

// Pure state transition
const transition = (state: AuthState, action: Action): AuthState => {
  switch (state.status) {
    case 'idle':
      return action.type === 'LOGIN' 
        ? { status: 'loading' }
        : state;
    case 'loading':
      return action.type === 'SUCCESS'
        ? { status: 'authenticated', user: action.user }
        : action.type === 'ERROR'
        ? { status: 'error', error: action.error }
        : state;
    // ... other cases
  }
};
```

**Imperative (Bad):**
```typescript
// Hard for agents to reason about
let isAuthenticated = false;
let currentUser = null;
let isLoading = false;
let error = null;

function login(email, password) {
  isLoading = true;
  // ... complex logic with side effects
  if (success) {
    isAuthenticated = true;
    currentUser = user;
    isLoading = false;
  } else {
    error = "Login failed";
    isLoading = false;
  }
}
```

### Benefits

- **Predictable Behavior:** State transitions are explicit and traceable
- **Easier Testing:** Pure functions are easy to test in isolation
- **Better Debugging:** State history can be logged and replayed
- **Agent-Friendly:** Clear patterns that agents can understand and modify

## The "Why" in Code Comments

**Heuristic:** Agents can read code perfectly. Comments should only explain the "why."

### The Problem

You no longer need comments that explain *what* the code is doing (`// increment counter by 1`). Agents parse ASTs and code flow better than humans. However, agents have zero context about your business logic, historical tech debt, or weird edge cases.

### The Solution

Reserve comments for business rules, non-obvious mathematical formulas, or explanations of *why* a seemingly sub-optimal approach was taken.

### Practice

**Bad (Explains "what"):**
```typescript
// Increment the counter by 1
counter++;
```

**Good (Explains "why"):**
```typescript
// We cap this at 50 because of a rate limit in the legacy Stripe integration
// TODO: Remove this cap once we migrate to Stripe API v3
const MAX_REQUESTS = 50;
```

**Good (Explains business logic):**
```typescript
// Free users get 5 requests per day. This is enforced at the API level
// but we also check here to provide better error messages.
if (user.plan === 'free' && requestCount >= 5) {
  throw new RateLimitError('Free plan limit exceeded');
}
```

**Good (Explains non-obvious math):**
```typescript
// This formula calculates the exponential backoff with jitter
// to prevent thundering herd problems. See RFC 8474 for details.
const backoff = Math.min(
  baseDelay * Math.pow(2, attempt) + Math.random() * jitter,
  maxDelay
);
```

### Benefits

- **Reduced Noise:** Comments don't duplicate what the code already says
- **Higher Value:** Comments provide context that code cannot
- **Better Understanding:** Future developers (and agents) understand the reasoning
- **Maintainable:** Comments stay relevant as code evolves

## Tool Chaining (The Unix Philosophy for Agents)

**Heuristic:** Agents perform best when armed with narrow, single-purpose tools.

### The Problem

Do not build monolithic "God Tools" that attempt to fetch, parse, summarize, and write data all at once. If an agent fails using a God Tool, it's difficult to know which part failed.

### The Solution

Build small, composable tools. For example, instead of a `fetchAndSummarizeUrl` tool, build a `fetchUrl` tool and let the agent decide if it needs to summarize the output using its own reasoning or by calling a separate `summarizeText` tool.

### Practice

**Monolithic (Bad):**
```typescript
// God tool - does too much
const fetchAndSummarizeUrl = async (url: string) => {
  const html = await fetch(url);
  const text = parseHtml(html);
  const summary = summarize(text);
  const keywords = extractKeywords(text);
  return { summary, keywords };
};
```

**Composable (Good):**
```typescript
// Small, focused tools
const fetchUrl = async (url: string): Promise<string> => {
  const response = await fetch(url);
  return response.text();
};

const parseHtml = (html: string): string => {
  // Extract text from HTML
};

const summarizeText = (text: string): string => {
  // Summarize text
};

const extractKeywords = (text: string): string[] => {
  // Extract keywords
};
```

**Agent Usage:**
```typescript
// Agent can chain tools as needed
const html = await fetchUrl(url);
const text = parseHtml(html);

// Agent decides what to do next
if (needsSummary) {
  const summary = await summarizeText(text);
  // Use summary
}

if (needsKeywords) {
  const keywords = await extractKeywords(text);
  // Use keywords
}
```

### Benefits

- **Easier Debugging:** Each tool can be tested independently
- **Better Reusability:** Tools can be combined in different ways
- **Clearer Failures:** It's obvious which tool failed
- **Flexibility:** Agents can choose which tools to use

## Deterministic Environments

**Heuristic:** Agents shouldn't have to fight your environment.

### The Problem

If a build fails because of a missing global dependency, a different Node/Bun version, or a floating package version, an agent might spend hours trying to fix the code when the code isn't the problem.

### The Solution

Strictly enforce lockfiles (`bun.lockb`, `package-lock.json`), use strict Node/Bun version engines, and provide agents with exact CLI commands that are guaranteed to work in a fresh environment.

### Practice

**package.json:**
```json
{
  "engines": {
    "node": ">=18.0.0 <19.0.0",
    "bun": ">=1.0.0 <2.0.0"
  },
  "scripts": {
    "dev": "bun run dev",
    "build": "bun run build",
    "test": "bun test",
    "lint": "bun run lint",
    "typecheck": "tsc --noEmit"
  }
}
```

**.nvmrc:**
```
18.17.0
```

**Dockerfile:**
```dockerfile
FROM oven/bun:1.0.0 AS base
WORKDIR /app

# Copy lockfiles first for better caching
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build
RUN bun run build
```

**CI/CD:**
```yaml
- name: Setup Bun
  uses: oven-sh/setup-bun@v1
  with:
    bun-version: 1.0.0

- name: Install dependencies
  run: bun install --frozen-lockfile

- name: Run tests
  run: bun test
```

### Benefits

- **Reproducible Builds:** Same code, same result, every time
- **Faster Debugging:** Issues are in the code, not the environment
- **Better Collaboration:** Everyone works in the same environment
- **Agent Efficiency:** Agents focus on code, not environment setup

## Best Practices

### 1. Always Write Tests First

Before asking an agent to implement a feature, write the tests first. This provides clear success criteria.

**Why:** Tests define the contract and prevent agents from over-engineering.

### 2. Keep Context Focused

Only provide the minimum context needed for the task. Don't dump the entire codebase.

**Why:** Focused context leads to better quality and faster responses.

### 3. Use Pure Functions

Prefer pure functions over functions with side effects.

**Why:** Pure functions are easier to test, debug, and reason about.

### 4. Document the "Why"

Use comments to explain business logic and non-obvious decisions.

**Why:** Agents can read code but can't infer business context.

### 5. Build Small Tools

Create small, composable tools instead of monolithic ones.

**Why:** Small tools are easier to debug, test, and reuse.

### 6. Enforce Deterministic Environments

Use lockfiles, version constraints, and containerization.

**Why:** Prevents environment-related issues that waste agent time.

### 7. Provide Clear Success Criteria

Define what "done" looks like before starting work.

**Why:** Agents need clear goals to work effectively.

### 8. Review Agent Output

Always review and test agent-generated code.

**Why:** Agents can make mistakes; human oversight ensures quality.

## Common Pitfalls

### Pitfall 1: Giving Open-Ended Instructions

**Problem:** Asking agents to "improve" or "optimize" without clear criteria.

**Solution:** Define specific, measurable goals with tests.

```typescript
// Bad
"Optimize this function"

// Good
"Make this function run in under 100ms for inputs up to 10,000 items"
```

### Pitfall 2: Overloading Context

**Problem:** Providing too much context, causing the agent to lose focus.

**Solution:** Only provide relevant files and information.

```typescript
// Bad
"Here's the entire codebase, fix the bug"

// Good
"Here's the auth service and its tests. The login is failing with error X."
```

### Pitfall 3: Ignoring Environment Issues

**Problem:** Blaming agent code when the issue is environmental.

**Solution:** Ensure the environment is deterministic before starting.

```bash
# Always verify environment
bun install --frozen-lockfile
bun run typecheck
bun run test
```

### Pitfall 4: Not Testing Agent Output

**Problem:** Assuming agent-generated code is correct without verification.

**Solution:** Always run tests and review the code.

```bash
# After agent makes changes
bun run test
bun run lint
bun run typecheck
```

### Pitfall 5: Building Monolithic Tools

**Problem:** Creating tools that do too many things.

**Solution:** Build small, focused tools that can be chained together.

```typescript
// Bad
const doEverything = async () => { /* ... */ };

// Good
const step1 = async () => { /* ... */ };
const step2 = async () => { /* ... */ };
const step3 = async () => { /* ... */ };
```

## References

- [Agentic Integrity Playbook](./agentic-integrity-playbook.md) – Ensuring agent outputs are trustworthy
- [Mastra Agent Playbook](./mastra-agent-playbook.md) – Mastra-specific patterns and best practices
- [Loading Process Playbook](./loading-process-playbook.md) – Two-step loading process pattern
- [Test-Driven Development](https://en.wikipedia.org/wiki/Test-driven_development) – TDD methodology
- [Pure Functions](https://en.wikipedia.org/wiki/Pure_function) – Functional programming concepts
- [State Machines](https://en.wikipedia.org/wiki/Finite-state_machine) – State machine design patterns
- [Unix Philosophy](https://en.wikipedia.org/wiki/Unix_philosophy) – Small, composable tools

---

**Version:** 1.0  
**Last Updated:** 2026-03-21  
**Maintained by:** PolyVis Development Team
