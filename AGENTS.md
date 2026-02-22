# AGENTS.md

## MANDATORY: Use td for Task Management

Run `tdn` (aliased to `td usage --new-session`) at the absolute start of every conversation window or after any `/clear`. This is your mandatory **Grounding Signal**.

- **Why**: It initializes your session ID and provides the current "Work Territory" map.
- **Repeatability**: Do not worry about repeating it too often. It is idempotent and essential for maintaining task state.

### Session Boundaries (Required)
- **Start of session:** `td usage --new-session`
- **End of session:** `td handoff <issue-id> --done ... --remaining ... --decision ... --uncertain ...`

### Session End Checklist (Required)
## The Forge Lifecycle (Mandatory Workflow)

We follow a strict **Brief-to-Task** lifecycle:

1. **The Brief**: Every task begins as a Markdown file in `briefs/`.
2. **The Forge**: Run `bun run forge` to pick a brief and link it to a `td` task.
3. **The Gumption**: The agent implements the objectives. **If blocked or confused, the agent MUST run `bun run ask "your question"`** to ping the Human's iPhone via ntfy.
4. **The Finish**: Run `bun run finish`. This is a fully automated closure engine that:
   - Runs all verification checks (Lint + Types + Tests).
   - Generates a **Debrief** automatically from session logs.
   - Links the Debrief and any new **Playbooks** to the `td` ticket.
   - Performs a final `td handoff` and pushes the branch to trigger the **Sovereign Cloud Review**.

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
- **Template + Runtime**: Starter template AND forge for your own agents
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

Start the Mastra Studio at localhost:4111 by running the `dev` script:

```bash
bun run dev
```

### Build

In order to build a production-ready server, run the `build` script:

```bash
bun run build
```

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
| `.env.example`        | Template for environment variables - copy and rename to `.env` to add your secret [model provider](/models) keys. |
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

## Resources

- [Mastra Documentation](https://mastra.ai/llms.txt)
- [Mastra .well-known skills discovery](https://mastra.ai/.well-known/skills/index.json)
