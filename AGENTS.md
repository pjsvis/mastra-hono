# AGENTS.md

## MANDATORY: Use td for Task Management

Run `tdn` (aliased to `td usage --new-session`) at the absolute start of every conversation window or after any `/clear`. This is your mandatory **Grounding Signal**.

- **Why**: It initializes your session ID and provides the current "Work Territory" map.
- **Repeatability**: Do not worry about repeating it too often. It is idempotent and essential for maintaining task state.

### Session Boundaries (Required)
- **Start of session:** `td usage --new-session`
- **End of session:** `td handoff <issue-id> --done ... --remaining ... --decision ... --uncertain ...`

### Session End Checklist (Required)
- [ ] Run `td handoff` before you say “done” or end the session
- [ ] Include done / remaining / decision / uncertain
- [ ] Submit `td review <issue-id>` only after a handoff is recorded

## The Symmetric Mentation Principle

This project operates on the principle of **Symmetric Mentation**: the deliberate split between high-velocity execution and sovereign auditing.

- **Local (Gumption)**: AI agents (Claude/Cursor) focus on implementing features and fixing bugs. Task state is strictly managed via `td` to ensure continuity across context windows.
- **Cloud (Sovereignty)**: GitHub Agentic Workflows (GHAW) act as the final gatekeeper, verifying that local work meets the project's standards via natural language audit logic.

## The Manual Task Lifecycle

We follow a **Manual Brief-to-Task** workflow:

1. **The Brief**: Create or select a Markdown brief in `briefs/`.
2. **The Task**: Manually create a task with `td create` and link it to the brief:
   ```bash
   td create "Task Title" \
     --brief "briefs/my-brief.md" \
     --playbook "playbooks/my-playbook.md" \
     --description "Brief: briefs/my-brief.md"
   ```
3. **The Development**: 
   - Start and isolate: `td start <task-id> && bun run td-worktree add <task-id>`
   - Change directory: `cd ../<task-id> && bun install`
   - Implement the objectives. **If blocked or confused, run `bun run ask "your question"`** to ping the Human's iPhone via ntfy.
4. **The PR**: When ready, create a PR with `bun run create-pr`. This automatically:
   - Creates the GitHub PR
   - Updates the task status to `in_review`
   - Links the PR to the task
5. **The Finish**: Run `bun run finish`. This automated closure engine:
   - Runs all verification checks (Lint + Types + Tests)
   - Generates a **Debrief** automatically from session logs
   - Links the Debrief and any new **Playbooks** to the task
   - Performs a final `td handoff` and creates the **GitHub PR** (if not already created)
6. **The Approve**: Once the PR is merged, run `td approve <task-id>` to mark it as **DONE** and close the local lifecycle.

### Agent Scratchpad (Transient Data)
The `scratchpad/` directory is a dedicated, git-ignored facility for agents to place temporary files, intermediate reasoning logs, or convenient artifacts.
- **Usage**: Feel free to create files here for your own reference or to pass state between tool calls if needed.
- **Lifecycle**: Content in `scratchpad/` is transient. It is ignored by Git and will be removed when the worktree is deleted.

## The Merge Queue (AI-Gated)

We use **Mergify** to enforce an "Atomic-to-Main" workflow. PRs are not merged manually.

1. **AI Review**: Upon PR creation, **CodeRabbit** and the **Sovereign Review Agent** (GHAW) audit the code.
2. **Auto-Queue**: When AI reviews are positive and all CI checks (Lint, Type Check, Test) pass, Mergify automatically enqueues the PR.
3. **Speculative Batching**: Mergify tests multiple PRs in parallel to prevent the "Rebase Race" and accelerate delivery.

### Cleanup & Tidying (The Ephemeral Workspace)
Once `finish` is run:
- **Automatic Unfocus**: The task is detached from your session.
- **Worktree Cleanup**: Run `bun run td-worktree cleanup <task-id>` to remove the worktree and local branch.
- **Sovereign Review**: Any further feedback from the PR should be treated as a *new* session.

### The "Map of Knowledge" (Description)
The task `description` field in `td` is used as a high-visibility context map. It follows a strict format for easy jumping:
- **Brief**: `briefs/my-brief.md`
- **Debrief**: `debriefs/td-id.md`
- **Test-Plan**: `tests/human/td-id-verification.md`
- **Playbook**: `playbooks/my-pattern.md`

This ensures that any agent (or human) focusing on the task has immediate access to the entire documentation stack.

Sessions are automatic (based on terminal/agent context). Optional:
- td session "name" to label the current session
- td session --new to force a new session in the same context

Use td usage -q after first read.

This document provides guidance for AI coding agents working in this repository.

## CRITICAL: Mastra Skill Required

**BEFORE doing ANYTHING with Mastra code or answering Mastra questions, load the Mastra skill FIRST.**

See [Mastra Skills section](#mastra-skills) for loading instructions.

## Project Overview

This is a **Mastra** project written in TypeScript - your **Agent Forge** for building production-ready AI agents.

**Purpose:**
- **Template + Runtime**: Starter template for your own agents
- **Production hardened**: Testing, scripts, and monitoring baked in
- **Reusable patterns**: Pre-built structures for common agent types

Mastra is a framework for building AI-powered applications and agents with a modern TypeScript stack.

## Tech Stack & Coding Patterns

- **Framework**: Hono (Edge-compatible).
- **Agentic Engine**: Mastra AI.
- **Validation**: All tool inputs/outputs MUST use **Zod** schemas. No `any`.
- **Hono Routes**: Use `factory.createHandlers()` for type safety. Chained routes are preferred for clarity.
- **Mastra Tools**: Define all tools in `src/mastra/tools/` using the `createTool` factory.
- **TypeScript**: Strict mode is mandatory. Run `tsc --noEmit` before any push.

## Commands

This project uses **Bun** as the package manager and runtime.

### Installation

```bash
bun install
```

### Development

Start the Mastra Studio at http://studio.localhost:1355 by running the `dev` script:

```bash
bun run dev
```

### Build

In order to build a production-ready server, run the `build` script:

```bash
bun run build
```

## Environment Tools

- `nu` (Nushell) is available for structured data ingestion and loads its PATH/rigging aliases from `~/.config/nushell/env.nu` and `~/.config/nushell/config.nu`. The `station-status` command resolves the focused task via `td current --json` + `td list --json` (no direct DB access required). See `docs/nushell-agent-usage.md` for the full agent workflow guide and `playbooks/nushell-agent-playbook.md` for operational rules.

## Project Structure

### Core folders

| Folder                 | Description                                                                                                                              |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `src/mastra`           | Entry point for all Mastra-related code and configuration.                                                                               |
| `src/mastra/agents`    | Define and configure your agents - their behavior, goals, and tools.                                                                     |
| `src/mastra/workflows` | Define multi-step workflows that orchestrate agents and tools together.                                                                  |
| `src/mastra/tools`     | Create reusable tools that your agents can call                                                                                          |
| `src/mastra/mcp`       | (Optional) Implement custom MCP servers to share your tools with external agents                                                         |
| `src/mastra/scorers`   | (Optional) Define scorers for evaluating agent performance over time                                                                     |
| `src/mastra/public`    | (Optional) Contents are copied into the `.build/output` directory during the build process, making them available for serving at runtime |

### Test & scripts

| Folder      | Description                                                                 |
| ----------- | --------------------------------------------------------------------------- |
| `tests/`    | Agent, workflow, and tool tests using Bun's built-in test runner            |
| `scripts/`  | Utility scripts for scaffolding, deployment, and data operations            |

### Top-level files

Top-level files define how your Mastra project is configured, built, and connected to its environment.

| File                  | Description                                                                                                       |
| --------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `src/mastra/index.ts` | Central entry point where you configure and initialize Mastra.                                                    |
| `.env.example`        | Deprecated for secrets. Use Skate (`skate set ...`) and load via `src/lib/secrets.ts` at runtime.                 |
| `package.json`        | Defines project metadata, dependencies, and available npm scripts.                                                |
| `tsconfig.json`       | Configures TypeScript options such as path aliases, compiler settings, and build output.                          |

## Mastra Skills

Skills are modular capabilities that extend agent functionalities. They provide pre-built tools, integrations, and workflows that agents can leverage to accomplish tasks more effectively.

This project has skills installed for the following agents:

- Claude Code
- Cursor

### Loading Skills

1. **Load the Mastra skill FIRST** - Use `/mastra` command or Skill tool
2. **Never rely on cached knowledge** - Mastra APIs change frequently between versions
3. **Always verify against current docs** - The skill provides up-to-date documentation

**Why this matters:** Your training data about Mastra is likely outdated. Constructor signatures, APIs, and patterns change rapidly. Loading the skill ensures you use current, correct APIs.

Skills are automatically available to agents in your project once installed. Agents can access and use these skills without additional configuration.

## Pi Extensions

Pi extensions provide specialized capabilities. See `.pi/extensions/` for available extensions.

### PR Review Loop Extension

The `pr-review-loop` extension monitors GitHub PR reviews and automatically fixes issues.

**State File Pattern:** State is persisted to `~/.ctx/pr-watch-state.json` to survive restarts.

| File | Purpose |
|------|---------|
| `~/.ctx/pr-watch-state.json` | PID-like state file - presence indicates active monitoring |

**On session start:** Extension checks for `~/.ctx/pr-watch-state.json` and resumes monitoring if found.

**Commands:**
- `/pr-watch <number>` - Start monitoring a PR
- `/pr-status` - Show current status
- `/pr-fix` - Auto-fix review issues
- `/pr-stop` - Stop monitoring

**Polling Cadence:** 5 minutes (eventual consistency - PR reviews are not real-time)

## Resources

- [Mastra Documentation](https://mastra.ai/llms.txt)
- [Mastra .well-known skills discovery](https://mastra.ai/.well-known/skills/index.json)
