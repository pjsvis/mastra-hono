---
id: PB-021
title: "Sidecar User Playbook"
role: "Orchestrate"
infrastructure: [sidecar]
last_updated: "2026-03-21"
tags: [playbook]
---

# Sidecar User Playbook

## Table of Contents

- [Purpose](#purpose)
- [Quick Start](#quick-start)
- [Recommended Terminal Layout](#recommended-terminal-layout)
- [Core Features & Plugins](#core-features-&-plugins)
  - [Git Status Plugin](#git-status-plugin)
  - [TD Monitor (Task Management)](#td-monitor-task-management)
  - [Workspaces Plugin](#workspaces-plugin)
  - [Conversations Plugin](#conversations-plugin)
  - [File Browser](#file-browser)
- [Global Navigation Shortcuts](#global-navigation-shortcuts)
- [Configuration](#configuration)
  - [Example Configuration](#example-configuration)
- [Typical Workflow](#typical-workflow)
  - [1. Plan Phase](#1-plan-phase)
  - [2. Development Phase](#2-development-phase)
  - [3. Review & Commit Phase](#3-review-&-commit-phase)
  - [4. Workspace Management](#4-workspace-management)
  - [5. Merge Phase](#5-merge-phase)
- [Installation](#installation)
  - [macOS (Recommended)](#macos-recommended)
  - [Linux / Other](#linux--other)
- [Tips for Effective Use](#tips-for-effective-use)
- [Best Practices](#best-practices)
  - [1. Always Check TD Before Starting Work](#1-always-check-td-before-starting-work)
  - [2. Use Split Terminal Layout](#2-use-split-terminal-layout)
  - [3. Link Tasks to Workspaces](#3-link-tasks-to-workspaces)
  - [4. Review Diffs Before Committing](#4-review-diffs-before-committing)
  - [5. Use Merge Workflow for Cleanup](#5-use-merge-workflow-for-cleanup)
- [Common Pitfalls](#common-pitfalls)
  - [Pitfall 1: Not Checking TD Before Starting Work](#pitfall-1-not-checking-td-before-starting-work)
  - [Pitfall 2: Not Linking Tasks to Workspaces](#pitfall-2-not-linking-tasks-to-workspaces)
  - [Pitfall 3: Forgetting to Review Diffs](#pitfall-3-forgetting-to-review-diffs)
  - [Pitfall 4: Not Cleaning Up Workspaces](#pitfall-4-not-cleaning-up-workspaces)
  - [Pitfall 5: Not Using Project Switcher](#pitfall-5-not-using-project-switcher)
- [References](#references)

## Purpose
Sidecar is a terminal-based development dashboard that consolidates your entire development workflow into a single interface. Use it to plan tasks with td, chat with AI agents, review diffs, stage commits, and manage workspaces—all without leaving the terminal. This playbook provides comprehensive guidelines for using Sidecar effectively in your daily development workflow.

**Core Philosophy:** Consolidate your entire development workflow into a single terminal interface. Plan tasks, chat with AI agents, review diffs, stage commits, and manage workspaces without leaving the terminal.


## Quick Start

```bash
# Navigate to your project and launch Sidecar
cd ~/projects/my-app
sidecar

# Run with debug logging
sidecar --debug

# Check version
sidecar --version
```

## Recommended Terminal Layout

Split your terminal horizontally:

```
┌─────────────────────────────┬─────────────────────┐
│                             │                     │
│   Claude Code / Cursor      │     Sidecar         │
│                             │                     │
│   $ claude                  │   [Git] [Files]     │
│   > fix the auth bug...     │   [Tasks] [Workspaces]│
│                             │                     │
└─────────────────────────────┴─────────────────────┘
```

Run your AI coding agent on one side and Sidecar on the other for non-intrusive monitoring. You can even run two Sidecar instances side-by-side to create a dashboard view (e.g., Tasks on one, Git on the other).

## Core Features & Plugins

### Git Status Plugin

View and manage staged, modified, and untracked files.

**Keyboard shortcuts:**
| Key | Action |
|-----|--------|
| `s` | Stage file |
| `u` | Unstage file |
| `d` | View diff (full-screen) |
| `v` | Toggle side-by-side diff |
| `h/l` | Switch sidebar/diff focus |
| `c` | Commit staged changes |
| `b` | Switch branches |
| `P` | Push to remote |

**When to use:**
- Reviewing changes before committing
- Staging specific files
- Viewing diffs in detail
- Managing branches

### TD Monitor (Task Management)

Integration with TD task management system for tracking work across AI agent sessions.

**Features:**
- View current focused task
- Scrollable task list with status indicators
- Activity log with session context

**Keyboard shortcuts:**
| Key | Action |
|-----|--------|
| `r` | Quick review submission |
| `Enter` | View task details |

**Before starting new work:**
```bash
# In a separate terminal or before launching agent
td usage --new-session  # See open work and view tasks/epics
```

**When to use:**
- Tracking progress on tasks
- Reviewing task status
- Submitting work for review
- Viewing activity logs

### Workspaces Plugin

Manage workspaces for parallel development with integrated agent support.

**Keyboard shortcuts:**
| Key | Action |
|-----|--------|
| `n` | Create new workspace |
| `D` | Delete workspace |
| `s` / `a` | Start / Launch agent in workspace |
| `Enter` | Attach to a running agent |
| `t` | Link/unlink TD task |
| `m` | Start merge workflow |
| `p` | Push branch |
| `o` | Open in finder/terminal |

**Merge workflow (`m` key):**
1. Commit changes
2. Push branch
3. Create PR
4. Cleanup workspace

**When to use:**
- Working on multiple features in parallel
- Isolating development environments
- Managing git worktrees
- Integrating with TD tasks

### Conversations Plugin

Browse session history from multiple AI coding agents.

**Features:**
- Unified view across all supported agents (Claude Code, Codex, Cursor, Gemini, etc.)
- View message content and token usage
- Track conversation history across context resets

**Keyboard shortcuts:**
| Key | Action |
|-----|--------|
| `/` | Search sessions |
| `Enter` | Expand/collapse message content |

**When to use:**
- Reviewing past agent sessions
- Tracking token usage
- Searching for specific conversations
- Understanding context resets

### File Browser

Navigate project files with tree view and syntax-highlighted preview.

**Features:**
- Collapsible directory tree
- Code preview with syntax highlighting
- Auto-refresh on file changes

**Keyboard shortcuts:**
| Key | Action |
|-----|--------|
| `Enter` | Open/close folder |
| `/` | Search files |
| `h/l` | Switch tree/preview focus |

**When to use:**
- Navigating project structure
- Previewing file contents
- Searching for files
- Understanding code organization

## Global Navigation Shortcuts

| Key | Action |
|-----|--------|
| `q`, `ctrl+c` | Quit |
| `@` | Open project switcher (jump between configured repos instantly) |
| `W` | Open worktree switcher |
| `#` | Open theme switcher (453+ community color schemes) |
| `tab` / `shift+tab` | Navigate plugins |
| `1-9` | Focus plugin by number |
| `j/k`, `↓/↑` | Navigate items |
| `ctrl+d/u` | Page down/up |
| `g/G` | Jump to top/bottom |
| `enter` | Select |
| `esc` | Back/close |
| `r` | Refresh |
| `?` | Toggle help |
| `!` | Open diagnostics/updates modal |

## Configuration

Config file location: `~/.config/sidecar/config.json`

### Example Configuration

```json
{
  "plugins": {
    "git-status": { "enabled": true, "refreshInterval": "1s" },
    "td-monitor": { "enabled": true, "refreshInterval": "2s" },
    "conversations": { "enabled": true },
    "file-browser": { "enabled": true },
    "workspaces": { "enabled": true }
  },
  "ui": {
    "showClock": true,
    "theme": { "name": "default" },
    "nerdFontsEnabled": true
  },
  "projects": {
    "list": [
      { "name": "sidecar", "path": "~/code/sidecar" },
      { "name": "td", "path": "~/code/td" },
      { "name": "hiac", "path": "~/Dev/GitHub/hiac" }
    ]
  }
}
```

*Note: Enable `nerdFontsEnabled` only if you have a Nerd Font installed, which will add rounded pill-shaped UI elements.*

## Typical Workflow

### 1. Plan Phase
```bash
# Create tasks for your work
td usage --new-session
td add "Fix authentication bug"
td add "Update documentation"
```

### 2. Development Phase
```bash
# Launch Sidecar
sidecar

# In a split terminal, launch your AI agent
claude  # or cursor, codex, etc.
```

### 3. Review & Commit Phase
```bash
# In Sidecar Git plugin:
# - Press 's' to stage files
# - Press 'd' to review diffs
# - Press 'c' to commit
```

### 4. Workspace Management
```bash
# Create workspace for feature branch ('n' in Workspaces plugin)
# Link TD task for context tracking ('t' to link task)
# Launch agent from workspace ('a' to attach agent)
```

### 5. Merge Phase
```bash
# Complete the merge workflow ('m' in Workspaces plugin)
```

## Installation

### macOS (Recommended)
```bash
brew install marcus/tap/sidecar
```

### Linux / Other
```bash
curl -fsSL https://raw.githubusercontent.com/marcus/sidecar/main/scripts/setup.sh | bash
```

## Tips for Effective Use

1. **Configure Project Switching**: Add frequently used projects to `~/.config/sidecar/config.json` for quick switching with `@`.
2. **Use Dashboard View**: Run two Sidecar instances side-by-side—one focused on Tasks, one on Git/Workspaces.
3. **Browse Conversations**: Use `/` to search past agent sessions to track what was done and review token usage.
4. **Customize Your Theme**: Press `#` to browse themes and reduce eye strain.
5. **Stay Updated**: Sidecar checks for updates on startup. Press `!` to open diagnostics when notified.

## Best Practices

### 1. Always Check TD Before Starting Work

Run `td usage --new-session` before starting any work.

```bash
td usage --new-session
```

**Why:** Ensures you have the current "Work Territory" map and session ID.

### 2. Use Split Terminal Layout

Run Sidecar alongside your AI agent.

```
┌─────────────────────────────┬─────────────────────┐
│   AI Agent                  │     Sidecar         │
└─────────────────────────────┴─────────────────────┘
```

**Why:** Provides non-intrusive monitoring and quick access to task status.

### 3. Link Tasks to Workspaces

Always link TD tasks to workspaces.

```bash
# In Workspaces plugin, press 't' to link task
```

**Why:** Provides context tracking and ensures work is traceable.

### 4. Review Diffs Before Committing

Always review diffs before committing.

```bash
# In Git plugin, press 'd' to view diff
```

**Why:** Prevents accidental commits and ensures code quality.

### 5. Use Merge Workflow for Cleanup

Use the merge workflow (`m` key) to clean up workspaces.

```bash
# In Workspaces plugin, press 'm' to start merge workflow
```

**Why:** Automates commit, push, PR creation, and workspace cleanup.

## Common Pitfalls

### Pitfall 1: Not Checking TD Before Starting Work

**Problem:** Starting work without checking current tasks.

**Solution:** Always run `td usage --new-session` first.

```bash
td usage --new-session
```

### Pitfall 2: Not Linking Tasks to Workspaces

**Problem:** Workspaces not linked to TD tasks.

**Solution:** Always link tasks when creating workspaces.

```bash
# In Workspaces plugin, press 't' to link task
```

### Pitfall 3: Forgetting to Review Diffs

**Problem:** Committing without reviewing changes.

**Solution:** Always review diffs before committing.

```bash
# In Git plugin, press 'd' to view diff
```

### Pitfall 4: Not Cleaning Up Workspaces

**Problem:** Workspaces left behind after merge.

**Solution:** Use the merge workflow to clean up automatically.

```bash
# In Workspaces plugin, press 'm' to start merge workflow
```

### Pitfall 5: Not Using Project Switcher

**Problem:** Manually navigating between projects.

**Solution:** Configure projects and use `@` to switch quickly.

```bash
# Configure in ~/.config/sidecar/config.json
# Press '@' to switch projects
```

## References

- [Sidecar Documentation](https://github.com/marcus/sidecar) – Official Sidecar documentation
- [TD CLI Documentation](../docs/td-cli.md) – Task management and context tracking
- [Sidecar Agent Playbook](./sidecar-agent-playbook.md) – Agent-specific Sidecar usage
- [Git Workflow Playbook](./git-workflow-playbook.md) – Branching and review workflow
- [Loading Process Playbook](./loading-process-playbook.md) – Two-step loading process pattern

---

**Version:** 1.0  
**Last Updated:** 2026-03-21  
**Maintained by:** PolyVis Development Team
