---
name: nushell-agent
description: Operational playbook for using Nushell as the agent sensory layer for structured task state.
---

# Nushell Agent Playbook

## Purpose
Use Nushell (`nu`) as a **sensory layer** to extract structured truth from `td` and related tools. This playbook defines the two operating modes and the approved usage patterns.

## Core Principles
1. **Structured over textual**: Prefer JSON/table output and transform it in `nu`.
2. **No DB coupling**: Do not read `td` databases directly; use `td --json`.
3. **Repeatable rituals**: Start sessions consistently and keep commands short.

---

## Modes of Use

### Mode 1: Everyday Mode (Shortcuts)
Use for daily task flow and quick status checks.

**Primary shortcuts**
- `tdu` → `td usage --new-session`
- `tdl` → `td list`
- `station-status` → focused task as structured output
- `skg` → `skate get`

**Core commands**
- Focused task snapshot:
  - `td current --json | from json | get focused.issue`
- Focused task detail:
  - `station-status | to json`
- Active tasks view:
  - `td list --json | from json | where status in ["open", "in_progress", "in_review"] | select id title status priority updated_at | sort-by updated_at | table`
- Review queue:
  - `td list --json | from json | where status == "in_review" | select id title implementer_session | table`

**Everyday examples**
- Compact focused task:
  - `td current --json | from json | get focused.issue | select id title status | to json`
- Open tasks sorted by priority:
  - `td list --json | from json | where status == "open" | sort-by priority | select id title priority | table`
- Keyword scan:
  - `td list --json | from json | where title =~ "nushell" | select id title status | to json`

---

### Mode 2: Development Mode (Tooling)
Use when creating or refining Nushell functions/aliases.

**Workflow**
1. Edit `~/.config/nushell/config.nu`
2. Re-source config: `source ~/.config/nushell/config.nu`
3. Validate output shape:
   - `td current --json | from json | to json`
   - `td list --json | from json | first | to json`

**`station-status` design**
- Pull focused issue id from `td current --json`
- Filter `td list --json` by id
- Return structured output (table/JSON)

---

## Approved Integration Rules
- Do **not** change the system shell.
- Do **not** couple to `td` storage paths.
- Always prefer `td --json` + Nushell transforms.

---

## Troubleshooting
- `station-status` returns nothing:
  - Ensure a task is focused: `td focus <issue-id>`
  - Verify: `td current --json | from json | get focused`
  - Re-source config: `source ~/.config/nushell/config.nu`

- Field not found:
  - Inspect shapes: `td current --json | from json | to json`
  - Inspect list sample: `td list --json | from json | first | to json`

---

## Summary
Nushell is the **agent sensory tier**: short commands, structured outputs, no DB coupling. Use Everyday Mode for speed and Development Mode for correctness.