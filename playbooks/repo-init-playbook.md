---
id: PB-030
title: "Repository Initialization & Environment Playbook"
role: "Orchestrate"
infrastructure: [git, skate, td, sidecar, docmd, tmux]
last_updated: "2026-03-26"
tags: [setup, onboarding, workflow]
---

# Repository Initialization & Environment Playbook

## Purpose
This playbook defines the "Golden Path" for initializing a local development environment for the PolyVis stack. It ensures that both human developers and AI agents operate within a synchronized, secure, and conflict-free "Context-as-Code" environment.

---

## 1. Toolchain Prerequisites
Ensure the following binaries are installed and available in your `$PATH`:

- **Runtime:** `bun` (Version >= 1.1.0)
- **Secrets:** `skate` (Charm.sh)
- **Task Management:** `td` (Internal CLI)
- **Workspace/Worktree:** `sidecar` (Internal CLI)
- **Documentation:** `docmd` (Internal CLI)
- **Linting/Formatting:** `biome` (via `bun`)
- **Session Management:** `tmux` (see section 10)

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

## 10. Session Management (tmux)
We use **tmux** for persistent terminal sessions, especially for remote development over Tailscale.

### Installation

**macOS:**
```bash
brew install tmux
```

**Linux (Debian/Ubuntu):**
```bash
sudo apt update && sudo apt install tmux
```

**Linux (CentOS/RHEL/Rocky):**
```bash
sudo yum install tmux
```

### Basic Configuration (`~/.tmux.conf`)

Create or update your tmux configuration:

```bash
# ~/.tmux.conf

# Extended keys support (for modern terminal emulators)
set -g extended-keys on
set -g extended-keys-format csi-u

# Enable mouse support (scrolling, pane selection, resizing)
set -g mouse on

# Improve colors
set -g default-terminal "screen-256color"

# Start window numbering at 1 (easier to reach)
set -g base-index 1
setw -g pane-base-index 1

# Renumber windows when one is closed
set -g renumber-windows on

# Increase scrollback buffer (10k lines)
set -g history-limit 10000

# Status bar customization
set -g status-right '#[fg=green]#H #[default]%Y-%m-%d %H:%M'

# Reload config shortcut (Ctrl-b r)
bind r source-file ~/.tmux.conf \; display "Config reloaded!"

# Shows [tmux] in green at the start of your status bar
set -g status-left '#[fg=green,bold][tmux] #[fg=blue]#S #[default]'
```

### Session Identification (iPad/Remote)

When working on iPad Mini or other devices with smaller screens, it's easy to lose track of whether you're inside tmux. Add these to your config:

```bash
# Visual indicator that you're in tmux
set -g status-left '#[fg=green,bold][tmux] #[fg=blue]#S #[default]'

# Or add an emoji indicator to your shell prompt
# Add this to ~/.bashrc or ~/.zshrc:
# if [[ -n "$TMUX" ]]; then export PS1="🟢 $PS1"; fi
```

### iPad-Optimized Settings

For smaller screens (iPad Mini, phones):

```bash
# Larger scrollback for smaller screen
set -g history-limit 50000

# Status bar with session name (helpful when multitasking)
set -g status-left '#[fg=blue]#S #[default]'

# Simpler status for narrow screens
set -g status-right '#[fg=green]%H:%M'

# Ensure mouse works with touch
set -g mouse on
```

### Daily Workflow

```bash
# Create or attach to a session
tmux new-session -A -s main

# Detach (keep running): Ctrl-b d
# Reattach later: tmux attach -t main
```

### Auto-Cleanup of Old Sessions

Idle tmux sessions consume memory (5-20MB each). Create `~/.local/bin/tmux-cleanup`:

```bash
#!/bin/bash
# Kill tmux sessions idle for >7 days
MAX_AGE_DAYS=7
CUTOFF=$(date +%s -d "$MAX_AGE_DAYS days ago" 2>/dev/null || date -v-${MAX_AGE_DAYS}d +%s)

tmux ls -F '#{session_name}:#{session_created}' 2>/dev/null | \
  while IFS=: read -r name created; do
    if [[ "$created" -lt "$CUTOFF" ]]; then
      echo "Killing old session: $name (created $(date -r "$created" '+%Y-%m-%d'))"
      tmux kill-session -t "$name"
    fi
  done
```

Make executable and add to crontab:
```bash
chmod +x ~/.local/bin/tmux-cleanup
crontab -e
# Add: 0 2 * * * ~/.local/bin/tmux-cleanup >> ~/.local/share/tmux-cleanup.log 2>&1
```

### Tailscale Integration

Since Tailscale provides encrypted mesh networking, SSH to remote hosts is automatically secured:

```bash
# SSH via Tailscale (encrypted end-to-end)
ssh user@hostname.tailnet-name.ts.net

# Start persistent session on remote
tmux new-session -A -s dev

# Work, detach with Ctrl-b d, disconnect SSH
# Later: reconnect and resume exactly where you left off
ssh user@hostname.tailnet-name.ts.net
tmux attach -t dev
```

---
**Version:** 1.2  
**Status:** Operational  
**Maintained by:** PolyVis Development Team