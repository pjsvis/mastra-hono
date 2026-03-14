---
name: nushell-user
description: User-focused playbook for installing, configuring, and deploying Nushell shortcuts in the Mastra-Hono project.
---

# Nushell User Playbook

## Purpose
This playbook provides a complete guide for setting up Nushell (`nu`) as your primary or auxiliary shell for interacting with the Mastra-Hono project. It includes installation steps, configuration patterns, and automated deployment of the project's custom alias vocabulary.

## 1. Installation

### macOS (Homebrew)
```bash
brew install nushell
```

### Linux / General (Cargo)
```bash
cargo install nu
```

### Windows (Winget)
```powershell
winget install nushell
```

### Verification
Run `nu --version` to confirm installation.

---

## 2. Configuration

Nushell uses two main configuration files: `config.nu` and `env.nu`.

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

---

## 3. Project Shortcuts & Aliases

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

---

## 4. Automated Deployment

We provide a script to automate the linking and sourcing of project aliases.

### Deployment Script: `scripts/setup-nushell.nu`
This script will:
1. Detect your current `config.nu`.
2. Add a `source` line pointing to the project's aliases if it doesn't already exist.
3. Verify the setup.

#### Run the Deployment Script:
```bash
nu scripts/setup-nushell.nu
```

---

## 5. Multi-Shell Access (The CLI Bridge)

If you are not currently in a Nushell session, you can still access these project shortcuts via `bun run` from any shell (Bash, Zsh, etc.):

- `bun run tdl` -> List all tasks
- `bun run tdu` -> Start new task session
- `bun run status` -> Show focused task status
- `bun run td-open` -> List open tasks
- `bun run td-review` -> List tasks for review

### Via Mastra CLI
You can also use the integrated CLI directly:
- `bun cli task list`
- `bun cli task focus <id>`
- `bun cli task inprog`

---

## 6. Usage Guide (Nushell Native)

### Everyday Shortcuts
| Alias | Command | Description |
|-------|---------|-------------|
| `tdu` | `td usage --new-session` | Start new task session |
| `tdl` | `td list` | List all tasks |
| `td-foc` | `td focus <id>` | Focus on a task |
| `station-status` | (custom) | Show focused task JSON |
| `td-open` | (custom) | List open tasks |

### Git Shortcuts
| Alias | Command | Description |
|-------|---------|-------------|
| `td-status` | `git status` | Quick repo status |
| `td-commits`| `git log...` | Visual commit history |
| `td-branch` | `git branch...`| Current branch name |

### Help Command
The project includes a self-documenting help system:
```nu
source src/mastra/tools/help-aliases.nu
h-mastra
```

---

## 6. Project-Specific Customization

If you want to add your own local aliases that are not committed to the repo, create a `.local.nu` file and source it in your `config.nu`.

```nu
# In config.nu
source ~/.config/nushell/my-private-aliases.nu
```

---

## Troubleshooting

### "Command not found"
Ensure the `td` CLI and `git` are in your system PATH. Nushell inherits the PATH from the environment it was started from.

### "File not found" when sourcing
Always use absolute paths in `config.nu` for sourcing project-specific files, or use the `setup-nushell.nu` script which handles path resolution.
