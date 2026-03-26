---
id: PB-021
title: "Sidecar User Playbook"
role: "Orchestrate"
infrastructure: [sidecar]
last_updated: "2026-03-26"
tags: [playbook]
---

# Sidecar User Playbook

Terminal-based development dashboard. Plan tasks, manage git, browse files, and chat with AI agents—all in one interface.

**Core Philosophy:** Consolidate your entire development workflow into a single terminal interface.

## Usage

### Quick Start

```bash
# Launch in project
cd ~/projects/my-app
sidecar

# Run with debug
sidecar --debug
```

### Recommended Layout

Split terminal horizontally:
```
┌─────────────────┬──────────────┐
│  Claude/Cursor  │    Sidecar   │
│  $ claude       │  [Git][Files]│
└─────────────────┴──────────────┘
```

### Git Workflow

| Key | Action |
|-----|--------|
| `s` | Stage file |
| `u` | Unstage file |
| `d` | View diff |
| `c` | Commit |
| `b` | Switch branch |
| `P` | Push |

### Task Management

| Key | Action |
|-----|--------|
| `r` | Quick review |
| `Enter` | View task details |

```bash
# Check tasks before starting
td usage --new-session
```

### Workspaces

| Key | Action |
|-----|--------|
| `n` | New workspace |
| `a` | Launch agent |
| `t` | Link TD task |
| `m` | Merge workflow |

### Navigation

| Key | Action |
|-----|--------|
| `@` | Project switcher |
| `#` | Theme switcher |
| `q` | Quit |
| `?` | Help |
| `1-9` | Focus plugin |

---

## Reference

### Config

`~/.config/sidecar/config.json`:

```json
{
  "plugins": {
    "git-status": { "enabled": true },
    "td-monitor": { "enabled": true },
    "conversations": { "enabled": true }
  },
  "projects": {
    "list": [
      { "name": "mastra-hono", "path": "~/Dev/GitHub/mastra-hono" }
    ]
  }
}
```

### Plugins

**Git Status:** Stage, diff, commit, push
**TD Monitor:** View focused task, scrollable task list
**Workspaces:** Parallel dev with agent integration
**Conversations:** Browse AI agent session history
**File Browser:** Tree view with syntax preview

### Daily Workflow

```bash
# 1. Plan
td usage --new-session

# 2. Development
sidecar  # in split terminal
claude   # AI agent

# 3. Review & Commit
# s→stage, d→diff, c→commit

# 4. Merge
# m in Workspaces plugin
```

---

## Setup

**Installation & Configuration:** See [Playbook Setup Guide](../playbook-setup.md)

Quick setup:
```bash
# macOS
brew install marcus/tap/sidecar

# Verify
sidecar --version
```

---

## See Also

- [Sidecar Agent Playbook](./sidecar-agent-playbook.md) – Agent-specific usage
- [Git Workflow Playbook](./git-workflow-playbook.md) – Git workflows
- [Playbook Setup Guide](../playbook-setup.md) – Installation & configuration
