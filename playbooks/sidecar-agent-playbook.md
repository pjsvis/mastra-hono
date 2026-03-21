---
date: 2026-03-21
tags: [playbook, sidecar, agent, td, task-management, workspace, git, development]
agent: local-ai
environment: development
version: 1.0
last_updated: 2026-03-21
---

# Sidecar Agent Playbook

## Purpose
This playbook defines how AI agents should integrate with Sidecar for development workflows, task tracking, workspace management, and code quality standards. It is critical for agents to use `td` as structured external memory to persist context across sessions. This playbook provides comprehensive guidelines for effective agent-sidecar integration.

**Core Philosophy:** Always use `td` as structured external memory to persist context across sessions. The session that implements code cannot approve it. Maintain strict separation between implementation and review.

## Table of Contents

- [Purpose](#purpose)
- [Table of Contents](#table-of-contents)
- [Mandatory Directives](#mandatory-directives)
  - [Mandatory Session Check](#mandatory-session-check)
  - [Mandatory Task Creation](#mandatory-task-creation)
  - [Tracking Progress](#tracking-progress)
  - [Mandatory Handoffs (Crucial)](#mandatory-handoffs-crucial)
  - [Review Workflow](#review-workflow)
  - [Querying State](#querying-state)
- [Integration Patterns](#integration-patterns)
  - [Pattern 1: Plugin Development Guidelines](#pattern-1-plugin-development-guidelines)
  - [Pattern 2: Workspace Workflow](#pattern-2-workspace-workflow)
  - [Pattern 3: Git Operations via Sidecar](#pattern-3-git-operations-via-sidecar)
  - [Pattern 4: Conversation Tracking](#pattern-4-conversation-tracking)
- [Configuration & Development Workflow](#configuration--development-workflow)
- [Keyboard Shortcuts Reference](#keyboard-shortcuts-reference)
- [Best Practices](#best-practices)
- [Common Pitfalls](#common-pitfalls)
- [References](#references)

## Mandatory Directives

### Mandatory Session Check

Always run `td usage --new-session` at the beginning of your work to see open work and view tasks/epics.

**Why:** This initializes your session ID and provides the current "Work Territory" map. It's your mandatory ground signal.

```bash
td usage --new-session
```

### Mandatory Task Creation

If a human does not provide an existing task for your work, you *must* create a task (or tasks) using `td` first and use it to track your progress.

**Why:** Tasks provide structured external memory that persists context across sessions.

```bash
# Create an issue
td create "Implement feature X" --type feature --priority P1

# Create an epic
td epic create "Feature X System" --priority P0

# Link child issue to an epic
td create "Child task" --parent td-abc123
```

### Tracking Progress

Use `td` to track progress and link tasks to workspaces when applicable. Sidecar's TD Monitor plugin provides visibility into task progress.

**Why:** Tracking progress ensures work is visible and traceable.

```bash
# Start an issue (moves from open to in_progress)
td start <issue-id>

# Focus your session on a specific issue
td focus <issue-id>

# Log progress, decisions, or blockers
td log "Implemented core logic"
td log --decision "Chose approach A because of performance"
td log --blocker "Waiting on API keys"
```

### Mandatory Handoffs (Crucial)

Before your context window ends, ALWAYS run a handoff command. This ensures the next session resumes exactly where you stopped, preventing hallucinated progress or repeated work.

**Why:** Handoffs prevent the next agent from losing important context and ensure continuity.

```bash
td handoff td-abc123 \
  --done "Completed item 1, Completed item 2" \
  --remaining "Item 3, Item 4" \
  --decision "Used standard library to minimize dependencies" \
  --uncertain "Should we handle edge case Z?"
```

**Required fields:**
- `--done`: What has been completed
- `--remaining`: What still needs to be done
- `--decision`: Key decisions made during the session

**Optional fields:**
- `--uncertain`: Areas of uncertainty
- `--blocked`: What's blocking progress

### Review Workflow

The session that implements the code *cannot* approve it. This enforces review separation.

**Why:** Separate review catches issues the implementer missed and ensures quality.

```bash
# Submit your work for review
td review <issue-id>

# To review others' work (must be in a different session)
td reviewable                 # List pending reviews
td context <issue-id>         # Read full handoff
td files <issue-id>           # Check modified files
td approve <issue-id>         # Approve and close
td reject <issue-id> --reason "Missing tests"
```

### Querying State

```bash
td list                          # List open issues
td query "status = in_progress"  # Advanced query
td critical-path                 # See optimal work sequence
td dep add <issue> <depends>     # Add a dependency
```

## Integration Patterns

### Pattern 1: Plugin Development Guidelines

When developing Sidecar plugins, follow these constraints:

#### Height Constraints

```go
// Always constrain plugin output height
func (p *Plugin) View(width, height int) string {
    p.width, p.height = width, height
    
    // Calculate internal layout respecting height
    content := p.renderContent()
    
    // Use lipgloss.Height to limit rendered lines
    return lipgloss.Height(height).Render(content)
    // OR manually limit rendered lines
}
```

**Critical:** The app's header/footer are always visible. Plugins must not exceed allocated height or the header will scroll off-screen.

**Why:** Height constraints ensure the UI remains usable and doesn't break the layout.

#### Footer/Command Hints

```go
// DO NOT render footers in plugin View()
// The app renders unified footer using plugin.Commands()

// Define commands with short names in Commands() method
func (p *Plugin) Commands() []string {
    return []string{"stage", "unstage", "diff", "commit"}
    // Keep names short (1 word preferred) to prevent wrapping
}
```

**Why:** Unified footer provides consistent UX and prevents command wrapping.

#### Inter-Plugin Communication

Plugins communicate via `tea.Msg` broadcast:

```go
// Example: Open file in file browser from another plugin
func (p *Plugin) openInFileBrowser(path string) tea.Cmd {
    return tea.Batch(
        app.FocusPlugin("file-browser"),
        func() tea.Msg {
            return filebrowser.NavigateToFileMsg{Path: path}
        },
    )
}
```

**Available messages:**
- `FocusPluginByIDMsg{PluginID}` - Switch focus to a plugin
- `NavigateToFileMsg{Path}` - Navigate to and preview a file (from filebrowser plugin)

**Why:** Inter-plugin communication enables complex workflows and better UX.

### Pattern 2: Workspace Workflow

When working with Sidecar workspaces (git worktrees):

```bash
# 1. Create workspace for feature ('n' in Workspaces plugin or via td)
# 2. Link TD task for context ('t' in Workspaces plugin or `td link`)
# 3. Launch agent from workspace ('a' in Workspaces plugin)
# 4. Complete work and merge ('m' for merge workflow: commit → push → PR → cleanup)
```

**Benefits:**
- Isolated development environments
- Parallel development on multiple features
- Clean git history
- Easy cleanup after merge

### Pattern 3: Git Operations via Sidecar

When Sidecar is running, prefer using its Git plugin for staging and committing to maintain workspace state consistency.

```bash
# Stage files: Press 's'
# Review diffs: Press 'd' (full-screen) or 'v' (side-by-side)
# Commit: Press 'c'
```

**Why:** Sidecar's Git plugin provides consistent state management and better UX.

### Pattern 4: Conversation Tracking

Sidecar auto-captures conversations from supported agents (Claude Code, Codex, Cursor CLI, Gemini CLI, Kiro, OpenCode, Pi Agent, Warp, Amp Code). Use `/` to search past sessions when resuming work and track token usage.

**Benefits:**
- Automatic conversation capture
- Searchable history
- Token usage tracking
- Context preservation across sessions

## Configuration & Development Workflow

### Workspace tmux Preview

Configure tmux capture max bytes in `~/.config/sidecar/config.json`:

```json
{
  "plugins": {
    "workspace": { "tmuxCaptureMaxBytes": 102400 }
  }
}
```

**Why:** Limits memory usage and prevents performance issues with large tmux captures.

### Build & Version Standards

```bash
# Format and lint
make fmt && make lint

# Run tests before committing
make test
# or: go test ./...

# Build and Install with version info
make build
make install-dev
# or: go install -ldflags "-X main.Version=v0.1.0" ./cmd/sidecar
```

**Reference:** `.claude/skills/release/SKILL.md` for release procedures.

**Why:** Consistent build process ensures quality and reproducibility.

## Keyboard Shortcuts Reference

| Key | Action | Context |
|-----|--------|---------|
| `a` | Launch/attach agent | Workspaces plugin |
| `t` | Link/unlink TD task | Workspaces plugin |
| `m` | Start merge workflow | Workspaces plugin |
| `s` | Stage file | Git plugin |
| `u` | Unstage file | Git plugin |
| `c` | Commit staged | Git plugin |
| `d` | View diff | Git plugin |
| `n` | New workspace | Workspaces plugin |
| `D` | Delete workspace | Workspaces plugin |
| `r` | Refresh/TD review | Any plugin |
| `j/k`, `↓/↑` | Navigate items | Global |
| `tab` / `shift+tab` | Next/Prev plugin | Global |
| `1-9` | Focus plugin by number | Global |
| `@` | Project switcher | Global |
| `W` | Worktree switcher | Global |
| `#` | Theme switcher | Global |

## Best Practices

### 1. Always Start with Session Check

Run `td usage --new-session` before any work.

```bash
td usage --new-session
```

**Why:** Ensures your session ID is set and you have the current "Work Territory" map.

### 2. Always Create Tasks Before Starting Work

Never start work without a linked task.

```bash
td create "Task title" --type feature --priority P1
```

**Why:** Tasks provide structured external memory that persists context.

### 3. Always Perform Handoffs Before Ending Sessions

Run `td handoff` before terminating a session.

```bash
td handoff <issue-id> \
  --done "Completed X" \
  --remaining "Need to do Y" \
  --decision "Chose approach Z"
```

**Why:** Preserves context for the next agent or developer.

### 4. Follow Plugin Height Constraints

Never exceed allocated height in plugin `View()` methods.

```go
return lipgloss.Height(height).Render(content)
```

**Why:** Prevents UI breakage and ensures consistent layout.

### 5. Use Short Command Names

Keep command names to 1 word when possible.

```go
func (p *Plugin) Commands() []string {
    return []string{"stage", "unstage", "diff", "commit"}
}
```

**Why:** Prevents command wrapping in the footer.

### 6. Never Render Footers in Plugin View()

Don't render footers in plugin `View()` methods.

```go
// Bad
func (p *Plugin) View(width, height int) string {
    return content + "\n" + footer  // Don't do this!
}

// Good
func (p *Plugin) Commands() []string {
    return []string{"command1", "command2"}  // Define commands here
}
```

**Why:** The app renders a unified footer using plugin.Commands().

### 7. Never Approve Your Own Code

The session that implements code cannot approve it.

```bash
# Bad
td start <task-id>
# ... implement ...
td approve <task-id>

# Good
td start <task-id>
# ... implement ...
td handoff <task-id> --done "Implemented X"
# ... new session ...
td approve <task-id>
```

**Why:** Separate review catches issues the implementer missed.

### 8. Run Tests Before Committing

Always run tests before committing.

```bash
make test
```

**Why:** Prevents broken code from entering the repository.

## Common Pitfalls

### Pitfall 1: Starting Work Without a Task

**Problem:** Beginning work without creating or linking a task.

**Solution:** Always create or link a task before starting work.

```bash
# Bad
# Just start coding without a task

# Good
td create "Implement feature X" --type feature
td start <task-id>
# Then start coding
```

### Pitfall 2: Forgetting Handoffs

**Problem:** Ending sessions without recording handoffs.

**Solution:** Always perform a handoff before ending the session.

```bash
# Bad
# Just end the session

# Good
td handoff <task-id> \
  --done "Completed X" \
  --remaining "Need to do Y" \
  --decision "Chose approach Z"
```

### Pitfall 3: Exceeding Plugin Height

**Problem:** Plugins render too much content and exceed allocated height.

**Solution:** Always constrain plugin output height.

```go
// Bad
func (p *Plugin) View(width, height int) string {
    return p.renderAllContent()  // May exceed height
}

// Good
func (p *Plugin) View(width, height int) string {
    content := p.renderContent()
    return lipgloss.Height(height).Render(content)
}
```

### Pitfall 4: Rendering Footers in View()

**Problem:** Plugins render their own footers.

**Solution:** Define commands in Commands() method, don't render footers.

```go
// Bad
func (p *Plugin) View(width, height int) string {
    return content + "\n" + footer
}

// Good
func (p *Plugin) Commands() []string {
    return []string{"command1", "command2"}
}
```

### Pitfall 5: Approving Own Code

**Problem:** Approving code in the same session that implemented it.

**Solution:** Always perform a handoff and approve in a new session.

```bash
# Bad
td start <task-id>
# ... implement ...
td approve <task-id>

# Good
td start <task-id>
# ... implement ...
td handoff <task-id> --done "Implemented X"
# ... new session ...
td approve <task-id>
```

### Pitfall 6: Committing Without Tests

**Problem:** Committing code without running tests.

**Solution:** Always run tests before committing.

```bash
# Bad
git commit -m "Implemented feature"

# Good
make test
git commit -m "Implemented feature"
```

## References

- [Sidecar Documentation](https://github.com/yourusername/sidecar) – Official Sidecar documentation
- [TD CLI Documentation](../docs/td-cli.md) – Task management and context tracking
- [Git Workflow Playbook](./git-workflow-playbook.md) – Branching and review workflow
- [Loading Process Playbook](./loading-process-playbook.md) – Two-step loading process pattern
- [Agentic Integrity Playbook](./agentic-integrity-playbook.md) – Ensuring agent outputs are trustworthy
- [Nushell Agent Playbook](./nushell-agent-playbook.md) – Nushell integration for task state

---

**Version:** 1.0  
**Last Updated:** 2026-03-21  
**Maintained by:** Mastra Development Team
