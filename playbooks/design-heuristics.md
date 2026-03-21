---
id: PB-007
title: "Design Heuristics"
role: "Build"
infrastructure: [td]
last_updated: "2026-03-21"
tags: [playbook]
---

# Design Heuristics

## Table of Contents

- [Purpose](#purpose)
- [The Result/Option Return Pattern](#the-resultoption-return-pattern)
  - [Why?](#why)
  - [Example](#example)
  - [Benefits](#benefits)
- [Type-Safety Strictness Zones](#type-safety-strictness-zones)
  - [The `@src` Zone](#the-`@src`-zone)
  - [The `tests` & `@scripts` Zone](#the-`tests`-&-`@scripts`-zone)
  - [The `scripts/lab` Zone](#the-`scriptslab`-zone)
- [Separation of Review & Implementation](#separation-of-review-&-implementation)
  - [Implementation](#implementation)
  - [Why this matters](#why-this-matters)
- [Pipeline Resiliency & Idempotency](#pipeline-resiliency-&-idempotency)
  - [Key Practices](#key-practices)
  - [Benefits](#benefits)
- [Intermediate Artifacts & JSONL](#intermediate-artifacts-&-jsonl)
  - [Why?](#why)
  - [Example](#example)
  - [Benefits](#benefits)
- [Best Practices](#best-practices)
  - [1. Always Return Result Objects](#1-always-return-result-objects)
  - [2. Respect Type-Safety Zones](#2-respect-type-safety-zones)
  - [3. Separate Implementation from Review](#3-separate-implementation-from-review)
  - [4. Design for Failure](#4-design-for-failure)
  - [5. Emit Intermediate Artifacts](#5-emit-intermediate-artifacts)
  - [6. Use JSONL for Large Datasets](#6-use-jsonl-for-large-datasets)
- [Common Pitfalls](#common-pitfalls)
  - [Pitfall 1: Throwing Exceptions from Tools](#pitfall-1-throwing-exceptions-from-tools)
  - [Pitfall 2: Using `any` in Production Code](#pitfall-2-using-`any`-in-production-code)
  - [Pitfall 3: Approving Own Code](#pitfall-3-approving-own-code)
  - [Pitfall 4: Fragile Pipelines](#pitfall-4-fragile-pipelines)
  - [Pitfall 5: No Intermediate Artifacts](#pitfall-5-no-intermediate-artifacts)
- [References](#references)

## Purpose
This document outlines the core architectural and design heuristics for the Mastra Agent Forge repository. While playbooks provide concrete workflows and step-by-step guides, these heuristics describe *why* and *how* we shape our systems. These principles guide our decision-making and ensure consistency across the codebase.

**Core Philosophy:** Design systems that are resilient, maintainable, and agent-friendly. Prioritize graceful error handling, strict type safety in production, and clear separation of concerns.


## The Result/Option Return Pattern

**Heuristic:** Handle failures gracefully by returning an Error/Result object rather than throwing exceptions.

When building tools or functions that agents and UIs rely on, it is highly preferable to handle edge cases internally and return a structured object indicating success or failure.

### Why?

**Simplified UI handling:**
The UI or consumer simply checks `if (result.error)` and displays the error state to the user, allowing them to fix and resubmit. It avoids crashing the UI and needing global Error Boundaries.

**Agent resilience:**
LLM agents handle structured error messages in JSON responses much better than abrupt stack traces or `catch` blocks. The agent reads the `error` string and can autonomously self-correct and re-invoke the tool.

### Example

**Bad (Throwing exceptions):**
```typescript
if (!input.isValid) {
  throw new Error("Invalid input provided"); // Hard crash or requires try/catch
}
```

**Good (Returning result object):**
```typescript
// Schema: outputSchema: z.object({ result: z.number().optional(), error: z.string().optional() })

if (!input.isValid) {
  return { error: "Invalid input provided. Please provide a positive number." }; // Graceful failure
}

return { result: 42 };
```

### Benefits

- **Predictable behavior:** Consumers always get a response, never an exception
- **Better debugging:** Error messages are structured and actionable
- **Agent-friendly:** LLMs can parse and act on error messages
- **UI resilience:** No need for global error boundaries

## Type-Safety Strictness Zones

**Heuristic:** Type-safety should be uncompromisingly strict in production paths, and entirely disabled in scratchpads.

Instead of scattering `@ts-ignore` or `any` throughout the codebase to accommodate quick prototyping, we establish geographical zones with distinct compiler rules:

### The `@src` Zone

**Hyper-strict.** `noExplicitAny` is enforced. This ensures the production runtime is bulletproof and refactors are safe.

**Rules:**
- No `any` types allowed
- No `@ts-ignore` comments
- All functions must have explicit type annotations
- Strict null checks enabled
- All imports must be typed

**What goes here:**
- Agent definitions
- Tool implementations
- Workflow definitions
- Server logic
- Core business logic

### The `tests` & `@scripts` Zone

**Moderately strict.** Generic types and `any` are allowed sparingly when dealing with mocking or broad scripting tasks.

**Rules:**
- Prefer strong typing
- `any` allowed for test mocks
- Generic types acceptable for utilities
- Some relaxations for test helpers

**What goes here:**
- Test files
- Build scripts
- Deployment scripts
- Utility scripts

### The `scripts/lab` Zone

**The wild west.** TypeScript and Biome are disabled for this folder (`skipLibCheck`, `ignore`). This gives developers a low-friction sandbox to explore ideas without wrestling the compiler.

**Rules:**
- No type checking
- No linting
- No restrictions
- Experimental code only

**What goes here:**
- Experimental prototypes
- Proof-of-concept implementations
- Exploratory code
- Temporary test scripts

**Why this separation matters:**
- **Quality:** Strict zones ensure production code meets high standards
- **Innovation:** Experimental zones allow rapid iteration without friction
- **Safety:** Clear boundaries prevent experimental code from leaking into production

## Separation of Review & Implementation

**Heuristic:** The session that writes the code cannot approve the code.

Implemented via the `td` CLI, we strictly enforce that the agent or user session that begins a task and creates a handoff cannot be the one to approve it. This creates a natural architectural boundary that forces code to be auditable, readable, and contextually complete before it can be merged.

### Implementation

Using the `td` CLI workflow:

```bash
# Session 1: Implementation
td start <task-id>
# ... implement feature ...
td handoff <task-id> --done "Implemented X" --remaining "Need to test Y"

# Session 2: Review (different session)
td review <task-id>
# ... review and fix issues ...
td approve <task-id>
```

### Why this matters

- **Quality:** Separate review catches issues the implementer missed
- **Accountability:** Clear handoff points prevent ambiguity
- **Context preservation:** Reviewer has fresh perspective
- **Auditability:** Complete audit trail of who did what

## Pipeline Resiliency & Idempotency

**Heuristic:** Data pipelines should be repeatable, verifiable, and resume-able.

Data extraction, processing, or general workflows (pipelines) are prone to partial failures. The design of these systems must expect and plan for failure rather than simply crashing mid-run.

### Key Practices

#### The Result/Option Pattern (Pipeline Edition)

Just as tools return `{ result, error }`, pipeline steps should process data without crashing. The output of a pipeline run should naturally result in a "pile of things that worked" and a "pile of things that failed". You don't need to overreact to failures—just log what happened and move the failed items to the failure pile.

**Example:**
```typescript
const results = {
  succeeded: [],
  failed: [],
};

for (const item of items) {
  try {
    const result = await processItem(item);
    results.succeeded.push(result);
  } catch (error) {
    results.failed.push({ item, error: error.message });
  }
}

return results;
```

#### Idempotency via Hashing

Make operations so they can be run multiple times without causing duplicate side-effects. Use content hashing or deterministic IDs so that if a pipeline crashes halfway through, rerunning it naturally skips over already-processed items.

**Example:**
```typescript
const processed = new Set();

for (const item of items) {
  const hash = hashItem(item);
  
  if (processed.has(hash)) {
    continue; // Skip already processed
  }
  
  await processItem(item);
  processed.add(hash);
}
```

#### Resuming State

Leverage tools like `td` (for tracking the meta-state of work) or simple file markers so pipelines just pick up where they left off.

**Example:**
```typescript
// Save checkpoint
await fs.writeFile('checkpoint.json', JSON.stringify({ lastProcessed: index }));

// Resume from checkpoint
const checkpoint = JSON.parse(await fs.readFile('checkpoint.json'));
const startIndex = checkpoint.lastProcessed + 1;

for (let i = startIndex; i < items.length; i++) {
  await processItem(items[i]);
}
```

### Benefits

- **Reliability:** Pipelines can recover from failures
- **Efficiency:** Don't reprocess already-completed work
- **Debugging:** Clear visibility into what succeeded and failed
- **Maintainability:** Easier to understand and modify

## Intermediate Artifacts & JSONL

**Heuristic:** Emitting intermediate artifacts allows for better debugging and CLI composition.

Don't build monolithic pipelines where data enters point A and only exits at point Z.

### Why?

**Extraction Points:**
Identify clear extraction points where data can be dumped to disk. This allows you to manually verify the state of data halfway through a process, and prevents having to re-run expensive early steps if a later step fails.

**The Power of JSONL:**
`JSONL` (JSON Lines) is our preferred format for these artifacts. It allows you to process or tail massive datasets line-by-line without loading entire arrays into memory. It also enables us to heavily utilize CLI tools like `jq` and `fzf` to map, filter, and inspect intermediate data effortlessly during development.

### Example

**JSONL format:**
```jsonl
{"id": 1, "name": "Alice", "status": "processed"}
{"id": 2, "name": "Bob", "status": "processed"}
{"id": 3, "name": "Charlie", "status": "failed", "error": "Invalid input"}
```

**Processing with jq:**
```bash
# Filter failed items
cat artifacts.jsonl | jq 'select(.status == "failed")'

# Count by status
cat artifacts.jsonl | jq -r '.status' | sort | uniq -c

# Extract specific fields
cat artifacts.jsonl | jq -r '.name'
```

**Processing with fzf:**
```bash
# Interactive search
cat artifacts.jsonl | jq -r '.name' | fzf

# Filter and process
cat artifacts.jsonl | jq 'select(.status == "processed")' | fzf
```

### Benefits

- **Debugging:** Easy to inspect intermediate state
- **Efficiency:** Process large datasets without loading into memory
- **Flexibility:** Use standard CLI tools for analysis
- **Reproducibility:** Artifacts can be shared and reprocessed

## Best Practices

### 1. Always Return Result Objects

Never throw exceptions from tools or pipeline steps. Always return structured result objects.

```typescript
// Good
return { result: data, error: null };

// Bad
throw new Error("Something went wrong");
```

### 2. Respect Type-Safety Zones

Only use `any` or `@ts-ignore` in the appropriate zones. Never compromise type safety in `@src`.

```typescript
// Good (in tests)
const mockData: any = { /* ... */ };

// Bad (in src)
const data: any = fetchData();
```

### 3. Separate Implementation from Review

Never approve code in the same session that implemented it.

```bash
# Good
td handoff <task-id> --done "Implemented X"
# ... new session ...
td approve <task-id>

# Bad
td start <task-id>
# ... implement ...
td approve <task-id>
```

### 4. Design for Failure

Assume pipelines will fail. Design them to resume and report failures gracefully.

```typescript
// Good
const results = { succeeded: [], failed: [] };
for (const item of items) {
  try {
    results.succeeded.push(await process(item));
  } catch (error) {
    results.failed.push({ item, error });
  }
}

// Bad
for (const item of items) {
  await process(item); // If this fails, everything stops
}
```

### 5. Emit Intermediate Artifacts

Save intermediate results to disk for debugging and inspection.

```typescript
// Good
await fs.writeFile('step1-output.jsonl', JSON.stringify(results));

// Bad
// No artifacts, can't debug intermediate steps
```

### 6. Use JSONL for Large Datasets

Use JSONL format for artifacts that may be large.

```typescript
// Good
for (const item of items) {
  await fs.appendFile('output.jsonl', JSON.stringify(item) + '\n');
}

// Bad
await fs.writeFile('output.json', JSON.stringify(allItems)); // Loads everything into memory
```

## Common Pitfalls

### Pitfall 1: Throwing Exceptions from Tools

**Problem:** Tools that throw exceptions crash agents and UIs.

**Solution:** Always return result objects with error information.

```typescript
// Bad
if (!input.isValid) {
  throw new Error("Invalid input");
}

// Good
if (!input.isValid) {
  return { error: "Invalid input. Please provide a positive number." };
}
```

### Pitfall 2: Using `any` in Production Code

**Problem:** Compromising type safety in `@src` leads to runtime errors.

**Solution:** Move experimental code to `scripts/lab` or use proper types.

```typescript
// Bad (in src)
const data: any = fetchData();

// Good (in src)
const data: DataType = fetchData();

// Good (in lab)
const data: any = fetchData(); // Experimental code
```

### Pitfall 3: Approving Own Code

**Problem:** Approving code in the same session that implemented it misses issues.

**Solution:** Always perform a handoff and approve in a new session.

```bash
# Bad
td start <task-id>
# ... implement ...
td approve <task-id>

# Good
td start <task-id>
# ... implement ...
td handoff <task-id> --done "Implemented X"
# ... new session ...
td approve <task-id>
```

### Pitfall 4: Fragile Pipelines

**Problem:** Pipelines that crash on first failure lose all progress.

**Solution:** Design pipelines to collect successes and failures separately.

```typescript
// Bad
for (const item of items) {
  await process(item); // Crashes on first failure
}

// Good
const results = { succeeded: [], failed: [] };
for (const item of items) {
  try {
    results.succeeded.push(await process(item));
  } catch (error) {
    results.failed.push({ item, error });
  }
}
```

### Pitfall 5: No Intermediate Artifacts

**Problem:** No way to debug or inspect intermediate pipeline state.

**Solution:** Emit artifacts at key points in the pipeline.

```typescript
// Bad
const result = await processAll(items);

// Good
await fs.writeFile('step1.jsonl', JSON.stringify(step1Results));
await fs.writeFile('step2.jsonl', JSON.stringify(step2Results));
const result = await processAll(items);
```

## References

- [Mastra Agent Playbook](./mastra-agent-playbook.md) – Mastra-specific patterns and best practices
- [Agentic Integrity Playbook](./agentic-integrity-playbook.md) – Ensuring agent outputs are trustworthy
- [Agentic SDLC Playbook](./agentic-sdlc.md) – Agent-assisted development practices
- [Loading Process Playbook](./loading-process-playbook.md) – Two-step loading process pattern
- [Git Workflow Playbook](./git-workflow-playbook.md) – Branching and review workflow
- [Result Pattern](https://doc.rust-lang.org/std/result/) – Rust's Result/Option pattern inspiration
- [JSONL Specification](http://jsonlines.org/) – JSON Lines format specification

---

**Version:** 1.0  
**Last Updated:** 2026-03-21  
**Maintained by:** Mastra Development Team
