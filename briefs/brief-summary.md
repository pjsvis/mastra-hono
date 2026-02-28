# Brief Summary & Implementation Order

## Designation & Capabilities
Mastra Code — CLI coding agent. I can read/search/edit files, run commands/tests, and manage tasks via `td`.

## Summary of Briefs

### 1) `briefs/agent-cli-runner.md` 
**Goal:** Build a CLI for Mastra agents with `run` (single-shot) and `chat` (REPL), model override flag, and TUI enhancements (gum/glow). Uses `src/cli/` with `commands/run.ts` and `commands/chat.ts`.
**Notes:** The brief contains extra prompt-optimization content; core requirements.

### 2) `briefs/agentic-integrity-workflow.md`
**Goal:** Formalize the “Symmetric Mentation” workflow (td + GHAW + ntfy + worktrees). Includes infra setup and operational loop.

### 3) `briefs/ai-workflow-playbook.md`
**Goal:** Playbook documenting the canonical sidecar + `td` → PR workflow with worktrees, debriefs, and cleanup.

### 4) `briefs/brief-ctx-telepresence.md`
**Goal:** ntfy-based bidirectional nudge protocol for remote approvals (Bun notifier + callback watcher).

### 5) `briefs/brief-edinburgh-protocol.md`
**Goal:** Create an “Edinburgh Protocol” agent with three tools (entropy reducer, systems analyzer, impartial review), integrate into Mastra, add tests.

### 6) `briefs/brief-mcp-memory-agent.md`
**Goal:** Expose `local-memory-agent` over MCP via STDIO/SSE; add `@mastra/mcp`, server entry, and verify memory persistence.

### 7) `briefs/brief-merge-queue.md`
**Goal:** Define Mergify/AI review merge-queue workflow and `.mergify.yml` guidance.

### 8) `briefs/brief-nushell-integration.md`
**Goal:** Integrate Nushell as the sensory tier; configure `env.nu`, `config.nu`, and document in `AGENTS.md`.

### 9) `briefs/brief-observational-memory-agent.md`
**Goal:** Build a local Ollama-based agent with observational memory; include tools and tests. (Linked to td-fa8288.)

### 10) `briefs/brief-playbook-index.md`
**Goal:** Standardize playbooks with YAML metadata and build a `pb` indexer/CLI.

### 11) `briefs/brief-skate-powered-secrets.md`
**Goal:** Replace `.env` with Skate-based secrets and inject into Mastra at runtime via `src/lib/secrets.ts`.

### 12) `briefs/brief-tsgo.md`
**Goal:** Adopt tsgo + oxlint and ntfy bidirectional bridge for fast feedback; update toolchain and heuristics.

### 13) `briefs/Self-Hosting ntfy Implementation Plan.md`
**Goal:** Evaluate and plan self-hosted ntfy (Docker, auth, HTTPS, and client configuration).

## Suggested Implementation Order

> Note: Some items appear already completed in debriefs (e.g., observational memory agent, Nushell docs). Verify current status before re-implementing.

**Phase A — Foundations / Dependencies**
1. **Agentic Integrity Workflow** (`briefs/agentic-integrity-workflow.md`) — establishes workflow and governance.
2. **AI Workflow Playbook** (`briefs/ai-workflow-playbook.md`) — ensures process consistency.
3. **Nushell Integration** (`briefs/brief-nushell-integration.md`) — likely done; confirm.
4. **Skate-Powered Secrets** (`briefs/brief-skate-powered-secrets.md`) — core security baseline.

**Phase B — Core Agent Capabilities**
5. **Observational Memory Agent** (`briefs/brief-observational-memory-agent.md`) — likely done; confirm.
6. **MCP Memory Agent** (`briefs/brief-mcp-memory-agent.md`) — depends on local memory agent.
7. **Edinburgh Protocol Agent** (`briefs/brief-edinburgh-protocol.md`) — new agent + tools + tests.

**Phase C — Developer Experience**
8. **Agent CLI Runner** (`briefs/agent-cli-runner*.md`) — CLI frontend; helps validate agents.
9. **Playbook Index** (`briefs/brief-playbook-index.md`) — knowledge tooling.

**Phase D — Workflow/Infra Enhancements**
10. **Ctx Telepresence** (`briefs/brief-ctx-telepresence.md`) — optional remote approvals.
11. **Merge Queue** (`briefs/brief-merge-queue.md`) — PR automation.
12. **tsgo + oxlint** (`briefs/brief-tsgo.md`) — tooling upgrade.
13. **Self-Hosted ntfy** (`briefs/Self-Hosting ntfy Implementation Plan.md`) — infra decision, optional.

## Next Step
Pick the first brief you want to execute, and I will create the `td` ticket and start the workflow.