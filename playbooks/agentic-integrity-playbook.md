# Playbook: Symmetric Mentation (Agentic Integrity)

This playbook outlines how to replicate the "Agentic Integrity" workflow in any new or existing project. It is based on the **Symmetric Mentation** principle: splitting high-velocity execution from sovereign auditing.

## 1. Prerequisites

- **Tools**: `gh` CLI with `gh-aw` extension, `td` CLI, and `ntfy` app (optional but recommended).
- **Isolation**: Support for Git Worktrees.

## 2. Infrastructure Setup

### Local "Gumption" Layer
1.  **Initialize `td`**:
    ```bash
    td init --name <project-name>
    ```
2.  **Haptic Link**:
    Create a `notify` alias in your shell config:
    ```bash
    alias notify='curl -d "$1" ntfy.sh/<private-topic-id>'
    ```

### Cloud "Sovereignty" Layer
1.  **Initialize GHAW**:
    ```bash
    gh aw init
    ```
2.  **Repo Secrets**:
    Add `NTFY_URL` to GitHub Secrets (`https://ntfy.sh/<private-topic-id>`).

## 3. Artefact Generation

Every project needs these three core anchors:

### A. `AGENTS.md` (The Constitution)
Place at `/AGENTS.md`. Define:
- Tech stack and mandatory library patterns.
- Coding standards (e.g., "No `any`", "Zod for all schemas").
- Forbidden actions (e.g., "Don't touch `.env`").

### B. `review.md` (The Cloud Reviewer)
Place at `.github/workflows/review.md`. Define:
- Instructions for the sovereign reviewer in plain English.
- Validation steps (e.g., `npm test`, `tsc --noEmit`).
- Notification logic (using `curl` to `ntfy`).

### C. `conceptual-lexicon.json`
Sync the latest Lexicon (`v1.79+`) to ensure agent persona alignment across local and cloud environments.

## 4. The Development Loop

1.  **Identify**: Run `td usage --new-session` to see the work territory.
2.  **Forge**: Run `bun run forge` to pick a Brief and link it to a Task.
3.  **Implement**: The local agent refers to `AGENTS.md`. **If confused, it runs `bun run ask "..."` to ping the developer.**
4.  **Finish**: Run `bun run finish`. It auto-checks quality, auto-generates a Debrief, links artifacts, and triggers the Cloud Audit.
5.  **Resolve**: If the PR fails, the developer gets an `ntfy` poke.

## 5. Deployment Heuristics

- **Start with Mastra-Hono**: This stack is low-entropy and high-visibility, making it the perfect "Pilot" for the workflow.
- **Fail Fast**: The cloud agent should fail the PR immediately if `tsc` or `lint` fails.
- **Human in the Loop**: Only use `ntfy` for signals requiring immediate attention. Don't spam the "Haptic Link".
