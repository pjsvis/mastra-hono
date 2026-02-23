# Agentic Workflow Transition for Mastra-Hono

This document describes how to transition Mastra-Hono to a **Symmetric Mentation** workflow that combines local task management with cloud-based review and secure notifications.

---

## 1. Core Infrastructure Overview

The workflow anchors agent state locally (via `td`) while delegating final review to GitHub workflows.

| Component | Role | Purpose |
| --- | --- | --- |
| **Local Sleeve (SideCar + td)** | Local task state | Keeps task context durable and structured. |
| **Cloud Brain (GHAW)** | PR audit | Runs sovereign checks in CI using `review.md`. |
| **Haptic Link (ntfy)** | Notifications | Pushes actionable results to your phone. |
| **Isolation (Git Worktrees)** | Environment isolation | Keeps task changes isolated and reproducible. |

---

## 2. Setup Instructions (Phase 1: Local)

### Step 1: Install agentic tooling

```
gh extension install github/gh-aw
# Ensure td is installed and available on PATH.
```

### Step 2: Initialize repository workflows

```
gh aw init
# This creates .github/workflows for agentic markdown workflows.
```

### Step 3: Configure ntfy for notifications (private)

Use a **private** topic or tokenized URL. Avoid public topics.

```
# Replace <private-topic-or-token> with your private ntfy topic or token.
alias notify="curl -d \"Action Required in Mastra-Hono\" https://ntfy.sh/<private-topic-or-token>"
```

On iPhone, subscribe to the same private topic in the ntfy app.

---

## 3. Repository Artifacts & Placement

| Artifact | Path | Purpose |
| --- | --- | --- |
| **AGENTS.md** | `/AGENTS.md` | Repo constitution for all agents. |
| **review.md** | `.github/workflows/review.md` | GHAW review instructions. |
| **CL.json** | `/root/conceptual-lexicon.json` | Project lexicon for agent context. |
| **td.db** | `~/.td/mastra-hono.db` | Local task state (outside repo). |

After editing `review.md`, recompile the lock file:

```
gh aw compile
```

---

## 4. Operational Loop

1. **Create a task**: start a new `td` task and worktree.
2. **Mentation**: execute work locally; use `td` for durable context.
3. **Submission**: push the branch; CI runs `review.md`.
4. **Feedback**: ntfy posts pass/fail updates.

---

## 5. Notes

- `tsc --noEmit` remains the authoritative type check.
- Formatting is handled by Biome.
- Linting is handled by OxLint (where configured).