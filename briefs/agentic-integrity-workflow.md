# Brief: Agentic Integrity Workflow (Symmetric Mentation)

## Overview
This brief defines the transition of the **mastra-hono** project to a "Symmetric Mentation" workflow. We are moving from a reactive, chat-only interaction model to a structured, territory-management paradigm. This system splits responsibility between high-velocity local execution and sovereign cloud auditing.

## Core Fundamentals

### 1. The Mentation Bridge (Local vs. Cloud)
- **Local (Gumption)**: The engine room. Agents (Claude/Cursor) focus on implementing features and fixing bugs. State is managed via `td` to prevent memory loss between context windows.
- **Cloud (Sovereignty)**: The Audit Chamber. GitHub Agentic Workflows (GHAW) act as the final gatekeeper, verifying that local work meets the repository's "Constitution" (`AGENTS.md`).

### 2. Dependency Stack
- **`td`**: Persistent task management. Stores work-in-progress, decisions, and handoffs in `.todos/db.sqlite`.
- **`GHAW`**: Natural language CI/CD. Uses `.github/workflows/review.md` to define audit logic in plain English.
- **`ntfy`**: A low-latency "Haptic Link". Pushes "Action Required" notifications to your iPhone via `ntfy.sh`.
- **`Git Worktrees`**: Ensures physical isolation for tasks, preventing environment pollution.

## Implementation Roadmap

### Phase 1: Infrastructure
- [ ] **GHAW Initialization**: Run `gh aw init` to set up the agentic workflow directory.
- [ ] **ntfy Connection**: Configure the `notify` alias on Mac and subscribe to the `ctx-mastra-hono-pjs` topic on iPhone.
- [ ] **td Setup**: Initialize the task database if not already present.

### Phase 2: Repository Artefacts
- [ ] **AGENTS.md**: Update the project "Constitution" with Hono factory patterns and Mastra tool requirements.
- [ ] **review.md**: Create the Sovereign Reviewer instructions for GHAW.
- [ ] **conceptual-lexicon.json**: Sync the v1.79 lexicon to align agent personas.

## Operational Loop
1.  **Initialize**: `td usage --new-session` to see current work.
2.  **Forge**: `bun run forge` to link a Brief to a Task.
3.  **Gumption**: Agent implements work. If stuck, uses `bun run ask` to request human input via iPhone.
4.  **Finish**: `bun run finish` to auto-verify, auto-debrief, link artifacts, and trigger the Sovereign Audit.

## Ctx Opinion
Implementing this workflow solves the "50 First Dates" context loss problem. It anchors the agent in deterministic local storage while leveraging the cloud for non-negotiable quality enforcement. This reduces cognitive load and turns the repository into a self-governing entity.
