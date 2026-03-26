---
id: PB-030
title: "Repository Initialization & Environment Playbook"
role: "Orchestrate"
infrastructure: [git, skate, td, sidecar, docmd]
last_updated: "2026-03-26"
tags: [setup, onboarding, workflow]
---

# Repository Initialization & Environment Playbook

## Purpose
This playbook defines the "Golden Path" for initializing a local development environment for the Mastra-Hono stack. It ensures that both human developers and AI agents operate within a synchronized, secure, and conflict-free "Context-as-Code" environment.

---

## 1. Toolchain Prerequisites
Ensure the following binaries are installed and available in your `$PATH`:

- **Runtime:** `bun` (Version >= 1.1.0)
- **Secrets:** `skate` (Charm.sh)
- **Task Management:** `td` (Internal CLI)
- **Workspace/Worktree:** `sidecar` (Internal CLI)
- **Documentation:** `docmd` (Internal CLI)
- **Linting/Formatting:** `biome` (via `bun`)

---

## 2. Global Git Configuration
To prevent "divergent branch" errors and maintain a linear history, every environment must be configured with these defaults:

```bash
# Force rebase on pull to keep history clean
git config --global pull.rebase true

# Automatically set up remote tracking on push
git config --global push.autoSetupRemote true

# Ensure pre-commit hooks are active
bun install
```

---

## 3. Secret Management (Skate)
We use **Skate** for identity-based secret storage. **Never create `.env` files.**

### Initial Seeding
Run these once to seed your local encrypted store:
```bash
skate set ANTHROPIC_API_KEY <your-key>
skate set OPENAI_API_KEY <your-key>
# Add other keys as needed (MASTRA_API_KEY, etc.)
```

### Retrieval Heuristic
The application uses the `getSkateSecret` utility to fetch these at runtime. If a key is missing, the agent/app will fail-fast rather than using empty strings.

---

## 4. Task & Context Initialization (TD)
Every session starts with a `td` initialization to map the "Work Territory."

```bash
# Initialize the session
td usage --new-session

# Sync latest tasks
td sync
```

---

## 5. Workspace Strategy (Sidecar)
We use **Git Worktrees** via Sidecar to isolate tasks. This prevents dependency churn and "dirty" state when switching between feature implementation and PR reviews.

### The "Agent-Safe" Loop
1. **Sync Main:** `git checkout main && git pull`
2. **Spawn Workspace:** Open `sidecar`, press `n` for a new worktree.
3. **Link Task:** Press `t` to link the active `td` issue.
4. **Develop:** Work entirely within the worktree.
5. **PR:** Press `m` in Sidecar to push and create a PR.

---

## 6. Project Structure Reference

| Directory | Purpose |
| :--- | :--- |
| `briefs/` | Implementation specs and "Context-as-Code" inputs. |
| `docs/` | System documentation and `llms.txt` source. |
| `playbooks/` | Operational "How-To" guides for humans and agents. |
| `scripts/` | Tooling, migrations, and "lab" experiments. |
| `src/` | Core application logic (Hono/Mastra). |
| `tests/` | E2E and Unit tests (Bun test runner). |
| `nu/` | Nushell-based automation scripts. |

---

## 7. Documentation & Verification (Docmd)
Before any major push or after merging a PR, regenerate the documentation site and LLM-friendly context:

```bash
# Build the docs-site and llms.txt
bun run docs:build
```

---

## 8. The "Daily Sync" (Avoiding the Mess)
Because agents are frequently merging PRs on GitHub, follow this routine daily:

1. **Pull Main:** Ensure your local `main` is current.
2. **Stash/Commit:** Never leave uncommitted changes in `main`.
3. **Check Red Folders:** If Zed shows red folders, run `git status`. Usually, this means an agent moved files. Use `git add -A` or `git restore .` to resolve.
4. **Rebase Local Branches:** If you have long-running branches, rebase them onto the new `main`:
   ```bash
   git checkout feature-branch
   git rebase main
   ```

---

## 9. Opinion: Why this works
By combining **Skate** (Identity), **TD** (Task State), and **Sidecar** (Filesystem Isolation), we solve the "Context Drift" problem. The agent can work on a PR in a worktree without touching your active editor files, and your global Git config ensures that even if you both move forward at once, a simple `pull` will reconcile the history without manual intervention.

---
**Version:** 1.0  
**Status:** Operational  
**Maintained by:** PolyVis Development Team