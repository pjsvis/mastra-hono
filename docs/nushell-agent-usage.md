# Nushell Agent Usage Guide

This guide equips coding agents with a reliable Nushell setup and repeatable patterns for structured, low-friction task management with `td`. It is organized as **short summaries** that link to **detailed sections**.

---

## Quick Summary

- **Everyday Mode (Shortcuts):** fast, stable commands for daily task work.  
  See: [Everyday Mode Detail](#everyday-mode-detail)

- **Development Mode (Tooling):** create or refine Nushell commands and verify output shapes.  
  See: [Development Mode Detail](#development-mode-detail)

- **Troubleshooting:** common failures and fixes.  
  See: [Troubleshooting Detail](#troubleshooting-detail)

---

## Prerequisites (Summary)

- `nu` installed (Nushell)
- `td` available on PATH
- `~/.config/nushell/env.nu` and `~/.config/nushell/config.nu` configured
- `station-status` should use `td` JSON output (no DB access)

See: [Prerequisites Detail](#prerequisites-detail)

---

## Everyday Mode Detail

**Use this mode for daily agent work.** It optimizes for speed and consistency.

### Daily Rituals
- Start of session: `td usage --new-session`
- Focused task snapshot: `td current --json | from json | get focused.issue`
- Focused task detail: `station-status | to json`

### Active Task View
- Active tasks: `td list --json | from json | where status in ["open", "in_progress", "in_review"] | select id title status priority updated_at | sort-by updated_at | table`

### Review Queue
- Review list: `td list --json | from json | where status == "in_review" | select id title implementer_session | table`

### Search by Keyword
- Find tasks: `td list --json | from json | where title =~ "nushell" | select id title status | to json`

### General-Purpose Shortcuts (Everyday Mode)
- `tdu` → initialize session quickly (`td usage --new-session`)
- `tdl` → list tasks fast (`td list`)
- `station-status` → focused task as structured output
- `skg` → quick secrets lookup (`skate get`)

### Piping into Nushell (Everyday Mode)
Yes — you can pipe structured output into Nushell commands. When the source is JSON, just pass it through `from json` and continue filtering. Example pattern:
- `some-command --json | from json | select ... | to json`

### Everyday Mode Examples
- Focused task (compact):
  - `td current --json | from json | get focused.issue | select id title status | to json`
- Open tasks sorted by priority:
  - `td list --json | from json | where status == "open" | sort-by priority | select id title priority | table`
- In-review tasks for quick triage:
  - `td list --json | from json | where status == "in_review" | select id title implementer_session | table`
- Quick keyword scan:
  - `td list --json | from json | where title =~ "nushell" | select id title status | to json`

---

## Development Mode Detail

**Use this mode when creating or updating Nushell tools.** It emphasizes correctness and shape inspection.

### Typical Flow
1. Edit `~/.config/nushell/config.nu`.
2. Re-source it: `source ~/.config/nushell/config.nu`.
3. Validate JSON shape:
   - `td current --json | from json | to json`
   - `td list --json | from json | first | to json`

### `station-status` Design (Reference)
- Pull focused issue ID from `td current --json`
- Filter `td list --json` by that ID
- Output structured data for easy piping

### Alias Design (Reference)
- `tdu` → `td usage --new-session`
- `tdl` → `td list`
- `skg` → `skate get`

---

## Prerequisites Detail

### Required Tools
- `nu` installed (Nushell)
- `td` available on PATH

### Required Files
- `~/.config/nushell/env.nu`  
- `~/.config/nushell/config.nu`

### Environment Expectations
- PATH should include:
  - `/usr/local/bin`
  - `~/.bun/bin`
  - `~/.local/bin`

---

## Troubleshooting Detail

### `station-status` returns nothing
- Ensure a task is focused: `td focus <issue-id>`
- Verify focused output: `td current --json | from json | get focused`
- Re-source config: `source ~/.config/nushell/config.nu`

### “Field not found” errors
- Inspect JSON shape:
  - `td current --json | from json | to json`
  - `td list --json | from json | first | to json`

### PATH issues
- Confirm PATH entries in `~/.config/nushell/env.nu`
- Restart `nu` after edits

---

## Agent Guidance

Nushell is **not** the system shell here. It is a **sensory layer** for extracting structured truth from task state. Prefer it when:
- filtering by status,
- assembling summaries,
- doing any task selection logic,
- producing JSON snapshots for logs or reasoning.

### Can I just pipe stuff into Nushell?
Yes — if the upstream command returns JSON (or table-like output), you can pipe it into Nushell and parse with `from json` (or keep it as a table). Typical flow:
- `command --json | from json | where ... | select ... | to json`

### Best General-Purpose Shortcuts
- `tdu` for new-session initialization
- `tdl` for quick task listing
- `station-status` for focused task details
- `skg` for fast secrets lookup

When in doubt, keep output explicit and structured using `to json` or `table`.