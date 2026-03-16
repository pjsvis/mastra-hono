# Nushell Aliases for Common Tasks

This file defines a set of reusable aliases that simplify frequent operations in the Mastra project.  
All aliases are written in **Nushell** (nu) syntax and can be added to your `config.nu` or imported via a separate module.

## Alias Overview

| Alias | Command | Description |
|-------|---------|-------------|
| `tdu` | `td usage --new-session` | Start a new task session. |
| `tdl` | `td list` | List all tasks. |
| `station-status` | `td current --json | from json | get focused.issue` | Show the focused task as JSON. |
| `td-foc` | `td focus <issue-id>` | Focus a specific task. |
| `td-unfoc` | `td unfocus` | Clear any focused task. |
| `td-open` | `td list --json | from json | where status == "open"` | List open tasks. |
| `td-inprog` | `td list --json | from json | where status == "in_progress"` | List in‑progress tasks. |
| `td-review` | `td list --json | from json | where status == "in_review"` | List tasks awaiting review. |
| `td-all` | `td list --json | from json` | List all tasks. |
| `td-summary` | `td list --json | from json | select id title status priority` | Quick summary table of tasks. |
| `skg` | `skate get` | Retrieve the current skate session. |
| `sk-set` | `skate set <value>` | Set a skate configuration value. |
| `sk-del` | `skate delete <key>` | Delete a skate configuration key. |
| `td-commits` | `git log --oneline --decorate --graph` | Show recent git commits in a concise format. |
| `td-clean` | `git clean -fdx` | Remove untracked files. |
| `td-status` | `git status` | Show current git status. |
| `td-branch` | `git branch --show-current` | Show the current branch. |

## How to Add These Aliases

1. **Create a module file** (e.g., `nushell-aliases.nu`) and paste the alias definitions below.
2. **Import the module** in your `config.nu` with `source ~/.config/nushell/config.nu` or `source nushell-aliases.nu`.

### Alias Definitions

```nu
# nushell-aliases.nu

# Task session management
alias tdu = "td usage --new-session"
alias tdl = "td list"

# Focus management
alias td-foc = "td focus"
alias td-unfoc = "td unfocus"

# Focused task snapshot
alias station-status = "td current --json | from json | get focused.issue"

# Task filters
alias td-open = "td list --json | from json | where status == \"open\""
alias td-inprog = "td list --json | from json | where status == \"in_progress\""
alias td-review = "td list --json | from json | where status == \"in_review\""
alias td-all = "td list --json | from json"
alias td-summary = "td list --json | from json | select id title status priority"

# Skate commands
alias skg = "skate get"
alias sk-set = "skate set"
alias sk-del = "skate delete"

# Git shortcuts
alias td-commits = "git log --oneline --decorate --graph"
alias td-clean = "git clean -fdx"
alias td-status = "git status"
alias td-branch = "git branch --show-current"
```

## Usage Tips

- **Combining commands**: Pipe the output of an alias into other NuShell commands for further transformation, e.g., `td-open | from json | select id title | to json`.
- **Error handling**: Use `try`/`catch` around aliases that may fail (e.g., `td-foc` if the issue ID does not exist).
- **Extensibility**: Add new aliases as needed; keep them grouped logically for readability.

---

**Note**: Ensure that the `td` and `skate` binaries are available in your PATH when using these aliases. If they are installed in a virtual environment, activate it before starting NuShell.

---