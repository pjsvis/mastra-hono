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

## 4. The Canonical Workflow Loop (Delivery + Review Agents)

This is the end-to-end, canonical loop using the tools we already have.

### Phase A — Delivery Agent (Build + PR)
1.  **Identify**: Run `td usage --new-session` to see the work territory.
2.  **Forge**: Run `bun run forge` to pick a Brief and link it to a Task.
3.  **Implement**: The local agent follows `AGENTS.md`. **If confused, it runs `bun run ask "..."` to ping the developer.**
4.  **Local Verify**: Run `bun run check`.
5.  **Finish**: Run `bun run finish`. It auto-checks quality, auto-generates a Debrief, links artifacts, and triggers the Cloud Audit.
6.  **Handoff**: Ensure a `td handoff` is recorded before ending the session.

### Phase B — Review Agent (PR Health Gate)
1.  **Inspect PRs**: Use `gh` to list open PRs and check status + review comments.
2.  **Fix & Push**: Address actionable issues (CI failures, CodeRabbit comments), then push updates.
3.  **Re-check**: Re-run `bun run check` until the PR is clean.
4.  **TD Approval Gate**: Once the PR is clean and review-ready, run:
    ```bash
    td reviewable
    td approve <issue-id>
    ```

### Phase C — Human Merge + Tidy
1.  **Merge** the PR in GitHub.
2.  **Cleanup** the task in `td` (final tidy-up and closeout).

## 5. Deployment Heuristics

- **Start with Mastra-Hono**: This stack is low-entropy and high-visibility, making it the perfect "Pilot" for the workflow.
- **Fail Fast**: The cloud agent should fail the PR immediately if `tsc` or `lint` fails.
- **Human in the Loop**: Only use `ntfy` for signals requiring immediate attention. Don't spam the "Haptic Link".
