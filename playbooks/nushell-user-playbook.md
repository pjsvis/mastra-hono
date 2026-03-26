---
id: PB-017
title: "Nushell User Playbook"
role: "Orchestrate"
infrastructure: [nushell]
last_updated: "2026-03-21"
tags: [playbook]
---

# Nushell User Playbook

## Purpose
This playbook provides a complete guide for setting up **Nushell (nu)** as your primary or auxiliary shell for interacting with the Mastra-Hono project. It covers installation, configuration patterns, automated deployment of project shortcuts, and daily workflows. The goal is to help developers become productive with Nushell quickly and leverage its power for structured data manipulation and automation.

**Core Philosophy:** Nushell is a **modern, type‑safe shell** that treats data as structured values (tables, records, lists) rather than raw text. This makes it ideal for working with JSON, APIs, and complex data pipelines.


## Installation

### System Requirements

- **Operating System:** macOS, Linux, or Windows (WSL)
- **Shell:** Any POSIX‑compatible shell (bash, zsh, fish)
- **Dependencies:** None (Nushell is self‑contained)

### Installation Methods

#### Method 1: Homebrew (macOS)

```bash
brew install nushell
```

#### Method 2: Cargo (All Platforms)

```bash
# Install Rust toolchain if not already installed
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Nushell
cargo install nu
```

#### Method 3: Pre‑built Binaries

Download from [nushell.sh](https://nushell.sh) and add to PATH.

### Verification

```bash
nu --version
# Expected output: 0.110.0 or higher
```

## Configuration

### Config File Location

Nushell looks for configuration in:

- `~/.config/nushell/config.nu` (Linux/macOS)
- `%APPDATA%\nushell\config.nu` (Windows)

### Locate Configuration Files

In Nushell, run:

```nu
$nu.config-path
$nu.env-path
```

### Edit Configuration

You can open your config directly from Nushell:

```nu
config nu
```

### Basic Config Structure

```nu
# ~/.config/nushell/config.nu

# Load project aliases (will be added by setup script)
# source "/absolute/path/to/mastra-hono/src/mastra/tools/nushell-aliases.nu"

# Custom environment variables
$env.PATH = ($env.PATH | split row (char esep) | prepend "/usr/local/bin")

# Custom aliases
alias ll = "ls -la"
alias gs = "git status"

# Custom functions
def greet [name: string] {
  echo $"Hello, ($name)!"
}
```

### Environment Variables

```nu
# Set environment variables
$env.EDITOR = "nvim"
$env.GIT_EDITOR = "nvim"

# Load from .env file
$env.DOTENV_PATH = ".env"
```

## Project Shortcuts

The Mastra-Hono project provides a curated set of aliases in `src/mastra/tools/nushell-aliases.nu`.

### Manual Sourcing

To use these aliases in your current session:

```nu
source src/mastra/tools/nushell-aliases.nu
```

### Persistent Sourcing (Global)

To make these aliases available every time you start Nushell, add the following line to your `config.nu`:

```nu
source "/absolute/path/to/mastra-hono/src/mastra/tools/nushell-aliases.nu"
```

### Available Aliases

#### Task Management

| Alias | Command | Description |
|-------|---------|-------------|
| `tdu` | `td usage --new-session` | Start a new task session. |
| `tdl` | `td list` | List all tasks. |
| `td-foc` | `td focus <issue-id>` | Focus on a specific task. |
| `td-unfoc` | `td unfocus` | Clear any focused task. |
| `station-status` | `td current --json | from json | get focused.issue` | Show the focused task as JSON. |

#### Task Filtering

| Alias | Command | Description |
|-------|---------|-------------|
| `td-open` | `filter-tasks open` | Filter tasks with status open. |
| `td-inprog` | `filter-tasks in_progress` | Filter tasks with status in_progress. |
| `td-review` | `filter-tasks in_review` | Filter tasks with status in_review. |
| `td-all` | `td list --json | from json` | List all tasks (raw JSON). |
| `td-summary` | `td list --json | from json | select id title status priority` | Quick summary table of tasks. |

#### Git Shortcuts

| Alias | Command | Description |
|-------|---------|-------------|
| `td-commits` | `git log --oneline --decorate --graph` | Show recent git commits. |
| `td-clean` | `git clean -fdx` | Remove untracked files. |
| `td-status` | `git status` | Show current git status. |
| `td-branch` | `git branch --show-current` | Show the current branch. |

#### Skate Commands

| Alias | Command | Description |
|-------|---------|-------------|
| `skg` | `skate get` | Retrieve the current skate session. |
| `sk-set` | `skate set <value>` | Set a skate configuration value. |
| `sk-del` | `skate delete <key>` | Delete a skate configuration key. |

### Help Command

The project includes a self-documenting help system:

```nu
# Load help aliases
source src/mastra/tools/help-aliases.nu

# Show all aliases
help

# Show details for a specific alias
help station-status
```

## Automated Deployment

### Deployment Script: `scripts/setup-nushell.nu`

This script automates the linking and sourcing of project aliases. It will:

1. Detect your current `config.nu` location
2. Add a `source` line pointing to the project's aliases if it doesn't already exist
3. Verify the setup
4. Provide feedback on success or failure

#### Run the Deployment Script

```bash
nu scripts/setup-nushell.nu
```

#### Script Behavior

The script performs the following checks:

- **Path Detection:** Automatically finds the absolute path to the project's alias file
- **Config Validation:** Ensures `config.nu` exists and is writable
- **Duplicate Prevention:** Checks if the source line already exists to avoid duplicates
- **Verification:** Tests that aliases are loaded correctly after setup

#### Manual Verification

After running the script, verify the setup:

```nu
# Start a new Nushell session
nu

# Check if aliases are available
help

# Test a few aliases
tdl
station-status
```

## Multi-Shell Access

If you are not currently in a Nushell session, you can still access these project shortcuts via `bun run` from any shell (Bash, Zsh, etc.):

### Available Commands

| Command | Description |
|---------|-------------|
| `bun run tdl` | List all tasks |
| `bun run tdu` | Start new task session |
| `bun run status` | Show focused task status |
| `bun run td-open` | List open tasks |
| `bun run td-review` | List tasks for review |

### Via Mastra CLI

You can also use the integrated CLI directly:

```bash
bun cli task list
bun cli task focus <id>
bun cli task inprog
```

### Cross-Shell Compatibility

The project shortcuts are designed to work across different shells:

- **Nushell (nu):** Native alias support
- **Bash/Zsh:** Via `bun run` commands
- **Fish:** Via `bun run` commands
- **PowerShell:** Via `bun run` commands

## Usage Guide

### Everyday Shortcuts

#### Task Management

```nu
# Start a new task session
tdu

# List all tasks
tdl

# Focus on a task
td-foc td-12345

# Show focused task
station-status

# Clear focus
td-unfoc
```

#### Task Filtering

```nu
# List open tasks
td-open

# List in-progress tasks
td-inprog

# List tasks for review
td-review

# Quick summary
td-summary
```

#### Git Operations

```nu
# Show git status
td-status

# View recent commits
td-commits

# Show current branch
td-branch

# Clean untracked files (careful!)
td-clean
```

#### Skate Configuration

```nu
# Get current skate session
skg

# Set a configuration value
sk-set key=value

# Delete a configuration key
sk-del key
```

## Daily Workflow

### Morning Routine

```nu
# 1. Start a new task session
tdu

# 2. Check current focused task
station-status

# 3. List open tasks
td-open

# 4. Focus on a task
td-foc td-12345

# 5. Check git status
td-status
```

### During Development

```nu
# 1. View recent commits
td-commits

# 2. Show current branch
td-branch

# 3. List in-progress tasks
td-inprog

# 4. Show focused task
station-status
```

### End of Day

```nu
# 1. Unfocus current task
td-unfoc

# 2. Clean untracked files (careful!)
td-clean

# 3. Review tasks
td-review

# 4. List all tasks
tdl
```

## Troubleshooting

### Common Issues

#### 1. Alias Not Found

**Problem:** `station-status` command not found.

**Solution:** Ensure aliases are loaded:

```nu
source "$(pwd)/src/mastra/tools/nushell-aliases.nu"
```

Or run the setup script:

```bash
nu scripts/setup-nushell.nu
```

#### 2. "Command not found" for td or git

**Problem:** External commands not found.

**Solution:** Ensure the `td` CLI and `git` are in your system PATH. Nushell inherits the PATH from the environment it was started from.

```nu
# Check PATH
$env.PATH

# Add to PATH if needed
$env.PATH = ($env.PATH | split row (char esep) | prepend "/usr/local/bin")
```

#### 3. "File not found" when sourcing

**Problem:** Cannot find alias file.

**Solution:** Always use absolute paths in `config.nu` for sourcing project-specific files, or use the `setup-nushell.nu` script which handles path resolution.

```nu
# Get absolute path
let alias_path = (pwd | path join "src/mastra/tools/nushell-aliases.nu")
echo $alias_path
```

#### 4. Setup Script Fails

**Problem:** Setup script reports errors.

**Solution:** Check the following:

```nu
# Verify config.nu exists
$nu.config-path

# Verify alias file exists
ls src/mastra/tools/nushell-aliases.nu

# Check permissions
ls -la ~/.config/nushell/
```

### Debugging

```nu
# Show command type
which station-status

# Show alias definition
help station-status

# Inspect data type
td list --json | from json | describe

# Trace execution
nu --commands 'td list' --debug
```

## Best Practices

### 1. Use Structured Data

**Good:**
```nu
td list --json | from json | where status == "open"
```

**Bad:**
```nu
td list | grep "open"
```

### 2. Leverage Type Safety

```nu
# Define types
def process-task [task: record<id: string, status: string>] {
  # ...
}
```

### 3. Keep Functions Small

```nu
# Good: Single responsibility
def filter-open [] {
  td list --json | from json | where status == "open"
}

def count-tasks [] {
  filter-open | length
}
```

### 4. Document Your Code

```nu
# Calculate task priority score
# Args:
#   - task: Task record
# Returns: Priority score (0-100)
def calculate-priority [task: record] {
  # Implementation
}
```

### 5. Use Meaningful Names

```nu
# Good
def get-open-tasks [] { ... }

# Bad
def gt [] { ... }
```

### 6. Test Your Aliases

Before committing changes to aliases, test them:

```nu
# Test each alias
tdu
tdl
station-status
td-open
td-inprog
td-review
```

## Examples

### Example 1: Task Dashboard

```nu
def task-dashboard [] {
  let all = td list --json | from json
  let open = $all | where status == "open"
  let in_progress = $all | where status == "in_progress"
  let review = $all | where status == "in_review"

  echo "Task Dashboard"
  echo "============="
  echo $"Open: ($open | length)"
  echo $"In Progress: ($in_progress | length)"
  echo $"In Review: ($review | length)"
}

task-dashboard
```

### Example 2: Git Summary

```nu
def git-summary [] {
  let commits = ^git log --oneline | lines | length
  let branch = ^git branch --show-current
  let status = ^git status --short

  {
    commits: $commits,
    branch: $branch,
    status: $status
  }
}

git-summary | to json -r
```

### Example 3: File Analyzer

```nu
def analyze-files [pattern: string] {
  ls **/$pattern | each { |file|
    {
      name: $file.name,
      size: $file.size,
      modified: $file.modified,
      type: ($file.name | path parse | get extension)
    }
  }
}

analyze-files "*.ts" | to json
```

## References

### Official Documentation

- [Nushell Website](https://nushell.sh)
- [Nushell Book](https://book.nushell.sh)
- [Nushell GitHub](https://github.com/nushell/nushell)

### Project Documentation

- [Nushell Aliases](../src/mastra/tools/nushell-aliases.md)
- [Nushell Utilities](../src/mastra/tools/nushell-utils.nu)
- [Help Script](../src/mastra/tools/help-aliases.nu)

### Related Playbooks

- [Loading Process Playbook](./loading-process-playbook.md)
- [Git Workflow Playbook](./git-workflow-playbook.md)
- [Nushell Agent Playbook](./nushell-agent-playbook.md)

---

**Version:** 1.0  
**Last Updated:** 2026-03-21  
**Maintained by:** PolyVis Development Team
