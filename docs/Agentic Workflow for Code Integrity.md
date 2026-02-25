# Agentic Workflow for Code Integrity

This document defines the **Symmetric Mentation** workflow: fast local development paired with rigorous, automated review in CI. It separates execution from verification and uses secure notifications for human-in-the-loop decisions.

---

## 1. Workflow Architecture

Local agents focus on execution. Cloud agents focus on verification.

| Layer | Component | Operational Role |
| --- | --- | --- |
| Local Action | SideCar + td | High-velocity task tracking with durable local state. |
| Haptic Link | ntfy | Real-time human notifications on success/failure. |
| Cloud Audit | GHAW | Automated PR review against `AGENTS.md` and `review.md`. |
| Isolation | Git Worktrees | Dedicated worktrees per task to avoid cross-contamination. |

---

## 2. Infrastructure Setup

### Phase 1: Local Tooling & Communications

1. **Install GHAW CLI extension**
   - Run: `gh extension install github/gh-aw`

2. **Configure ntfy (Mac + iPhone)**
   - iPhone: install the `ntfy` app and subscribe to a **private** topic.
   - Mac: add a helper function (use a private topic or token).

3. **Initialize td**
   - Run: `td init --name mastra-hono`

### Phase 2: Repository Configuration

1. **Initialize GHAW**
   - Run: `gh aw init`

2. **Configure GitHub secrets**
   - Add a `GITHUB_COPILOT_TOKEN` (or equivalent) to repo secrets for GHAW.

3. **Secure ntfy usage**
   - Store the ntfy URL as a secret (e.g., `NTFY_URL`) and reference it in workflows.

---

## 3. Artifacts & Placement

| Artifact | Path | Purpose |
| --- | --- | --- |
| `AGENTS.md` | `/AGENTS.md` | Source-of-truth standards and coding patterns. |
| `review.md` | `/.github/workflows/review.md` | GHAW review instructions. |
| `CL.json` | `/root/conceptual-lexicon.json` | Domain lexicon for agent alignment. |

After editing `review.md`, recompile the lock file:
- Run: `gh aw compile`

---

## 4. Operational Loop

1. **Start Task**
   - Create and start a task in `td`.
2. **Local Execution**
   - Implement changes in a dedicated worktree.
3. **Sovereign Gate**
   - Push the branch; GHAW runs review automation.
4. **Haptic Feedback**
   - ntfy notifies success/failure so you can act immediately.

---

## 5. Security & Reliability Notes

- **Avoid public ntfy topics.** Use private topics or tokens.
- **Keep `tsc --noEmit` authoritative.** Linting complements type checks, not replaces them.
- **Don’t suppress CI errors.** Surface real failures to avoid false “success” states.

---

## 6. Quick Reference

- Local verification: `bun run check`
- Create/refresh GHAW lock file: `gh aw compile`
