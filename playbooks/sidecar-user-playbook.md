---
name: sidecar-user
description: Terminal-based development dashboard for managing AI agent workflows, task tracking with td, git operations, and workspace management.
---

# Sidecar User Playbook

## Purpose
Sidecar is a terminal-based development dashboard that consolidates your entire development workflow into a single interface. Use it to plan tasks with td, chat with AI agents, review diffs, stage commits, and manage workspaces—all without leaving the terminal.

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

### 1. Git Status Plugin
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

### 2. TD Monitor (Task Management)
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

### 3. Workspaces Plugin
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

### 4. Conversations Plugin
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

### 5. File Browser
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
