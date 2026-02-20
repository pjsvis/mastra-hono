# Agent-Assisted SDLC Practices

As software development evolves to include autonomous and semi-autonomous AI agents, our practices must adapt to maximize their leverage. This playbook outlines heuristics for an Agentic Software Development Life Cycle (SDLC).

## 1. Verifiable Goals (TDD as Agent Rails)

**Heuristic: Give agents a verifiable win condition, not open-ended instructions.**

Agents struggle with ambiguous requests like "make this component better." However, they excel at satisfying constraints. Test-Driven Development (TDD) is the ultimate agent guardrail. 

- **Practice:** Write a failing unit or integration test that defines the expected behavior, edge cases, and required schemas. Hand the agent the failing test output and instruct it to make the test pass. The test suite acts as an objective, automated reviewer.

## 2. Context Density over Context Volume

**Heuristic: Feed agents highly relevant, dense information. Avoid dumping the entire repository into the context window.**

LLMs suffer from "lost in the middle" syndrome. If you provide 100,000 tokens of loosely related code, their attention degrades, and they are more likely to hallucinate or break unrelated systems.

- **Practice:** Keep files small and modular (Single Responsibility Principle). When an agent needs to work on a feature, only load the specific interface, the implementation file, and the associated tests into its context.

## 3. Declarative State over Imperative Mutation

**Heuristic: Agents reason better about declarative state machines than deeply nested imperative logic.**

Agents are pattern-matchers. They can easily grasp and modify declarative configurations (like React UI states, SQL schemas, or Terraform) because the "desired state" is explicitly described. Imperative code full of side-effects, deep `for` loops, and mutated variables is harder for agents to debug because the state is hidden in the execution flow.

- **Practice:** Prefer pure functions, immutable data structures, and state machines. If a complex imperative loop is required, isolate it into a pure function with a strict input/output contract that the agent can test in isolation.

## 4. The "Why" in Code Comments

**Heuristic: Agents can read code perfectly. Comments should only explain the "why."**

You no longer need comments that explain *what* the code is doing (`// increment counter by 1`). Agents parse ASTs and code flow better than humans. However, agents have zero context about your business logic, historical tech debt, or weird edge cases.

- **Practice:** Reserve comments for business rules (`// We cap this at 50 because of a rate limit in the legacy Stripe integration`), non-obvious mathematical formulas, or explanations of *why* a seemingly sub-optimal approach was taken.

## 5. Tool Chaining (The Unix Philosophy for Agents)

**Heuristic: Agents perform best when armed with narrow, single-purpose tools.**

Do not build monolithic "God Tools" that attempt to fetch, parse, summarize, and write data all at once. If an agent fails using a God Tool, it's difficult to know which part failed.

- **Practice:** Build small, composable tools. For example, instead of a `fetchAndSummarizeUrl` tool, build a `fetchUrl` tool and let the agent decide if it needs to summarize the output using its own reasoning or by calling a separate `summarizeText` tool.

## 6. Deterministic Environments

**Heuristic: Agents shouldn't have to fight your environment.**

If a build fails because of a missing global dependency, a different Node/Bun version, or a floating package version, an agent might spend hours trying to fix the code when the code isn't the problem.

- **Practice:** Strictly enforce lockfiles (`bun.lockb`, `package-lock.json`), use strict Node/Bun version engines, and provide agents with exact CLI commands that are guaranteed to work in a fresh environment.