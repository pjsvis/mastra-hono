---
id: PB-017
title: "Nushell User Playbook"
role: "Orchestrate"
infrastructure: [nushell]
last_updated: "2026-03-26"
tags: [playbook]
---

# Nushell User Playbook

Nushell is a **modern, type-safe shell** that treats data as structured values (tables, records, lists) instead of raw text. Ideal for JSON, APIs, and data pipelines.

**Core Philosophy:** Structured data everywhere. Pipe, filter, and transform with type-safe primitives.

## Usage

### Quick Commands

```nu
# Task management
tdu                    # Start new task session
tdl                    # List all tasks
td-foc td-12345       # Focus on a task
station-status         # Show focused task
td-open               # Filter open tasks
td-inprog             # Filter in-progress tasks

# Git shortcuts
td-status             # Git status
td-commits            # Recent commits
td-branch             # Current branch

# Skate (secrets)
skg                   # Get skate session
```

### Source Project Aliases

```nu
# Load project shortcuts (one-time per session)
source "$(pwd)/src/mastra/tools/nushell-aliases.nu"

# Or add to config.nu for persistent loading
source "/absolute/path/to/mastra-hono/src/mastra/tools/nushell-aliases.nu"
```

### Daily Workflow

```nu
# Morning
tdu
station-status
tdl

# Development
td-status
td-commits

# End of day
td-unfoc
td-review
```

### Structured Data

```nu
# JSON as tables
td list --json | from json | where status == "open"

# Filter and select
td list --json | from json | select id title status priority

# Count tasks by status
td list --json | from json | group-by status | get in_progress
```

---

## Reference

### Aliases

| Alias | Command | Description |
|-------|---------|-------------|
| `tdu` | `td usage --new-session` | New task session |
| `tdl` | `td list` | List all tasks |
| `td-foc` | `td focus <id>` | Focus on task |
| `station-status` | `td current --json | from json | get focused.issue` | Show focused task |

### Config File

```nu
# ~/.config/nushell/config.nu
$nu.config-path      # Show config location
config nu            # Edit config

# Add to config.nu
source "/path/to/mastra-hono/src/mastra/tools/nushell-aliases.nu"
```

### Setup Script

```bash
# Run automated setup
nu scripts/setup-nushell.nu

# Verify
tdu
tdl
```

### Troubleshooting

**Aliases not found:**
```nu
source "$(pwd)/src/mastra/tools/nushell-aliases.nu"
```

**td/git not found:**
```nu
# Check PATH
$env.PATH

# Add if needed
$env.PATH = ($env.PATH | prepend "/usr/local/bin")
```

---

## Setup

**Installation & Configuration:** See [Playbook Setup Guide](./setup-playbook.md)

Quick setup:
```bash
# macOS
brew install nushell

# Verify
nu --version

# Link project aliases
nu scripts/setup-nushell.nu
```

---

## See Also

- [Nushell Agent Playbook](./nushell-agent-playbook.md) – Agent-specific usage
- [Git Workflow Playbook](./git-workflow-playbook.md) – Git workflows
- [Playbook Setup Guide](./setup-playbook.md) – Installation & configuration
