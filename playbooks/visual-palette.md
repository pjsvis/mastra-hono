---
id: PB-027
title: "Visual Palette Playbook"
role: "Build"
infrastructure: [nushell]
last_updated: "2026-03-21"
tags: [playbook]
---

# Visual Palette Playbook

## Table of Contents

- [Purpose](#purpose)
- [Philosophy](#philosophy)
- [The Palette](#the-palette)
- [Quick Reference](#quick-reference)
  - [td list (all tasks)](#td-list-all-tasks)
  - [td current (focused task)](#td-current-focused-task)
- [Output Examples](#output-examples)
  - [table](#table)
  - [compact (table -e)](#compact-table--e)
  - [csv](#csv)
  - [nuon](#nuon)
  - [json](#json)
  - [html](#html)
- [Why This Matters](#why-this-matters)
- [Integration with Edinburgh Protocol](#integration-with-edinburgh-protocol)
- [Best Practices](#best-practices)
  - [1. Choose Format Based on Use Case](#1-choose-format-based-on-use-case)
  - [2. Use Table for Human Overview](#2-use-table-for-human-overview)
  - [3. Use Compact for Focused View](#3-use-compact-for-focused-view)
  - [4. Use CSV for Export](#4-use-csv-for-export)
  - [5. Use NUON for Chaining](#5-use-nuon-for-chaining)
  - [6. Use JSON for Debugging](#6-use-json-for-debugging)
- [Common Pitfalls](#common-pitfalls)
  - [Pitfall 1: Using Wrong Format for Use Case](#pitfall-1-using-wrong-format-for-use-case)
  - [Pitfall 2: Not Using Compact for Focused View](#pitfall-2-not-using-compact-for-focused-view)
  - [Pitfall 3: Not Using NUON for Chaining](#pitfall-3-not-using-nuon-for-chaining)
  - [Pitfall 4: Using JSON for Human Overview](#pitfall-4-using-json-for-human-overview)
  - [Pitfall 5: Not Using CSV for Export](#pitfall-5-not-using-csv-for-export)
- [References](#references)

## Purpose
This playbook defines a limited palette of structured output formats for deterministic display. It provides guidelines for choosing the right format when displaying structured data, ensuring consistency and clarity across all tools and workflows.
 
**Core Philosophy:** Limited palette, maximum clarity. When displaying structured data, use one of these formats. No ad-hoc formatting—the choice should be trivial.


## Philosophy

**Limited palette, maximum clarity.**

When displaying structured data, use one of these formats. No ad-hoc formatting — the choice should be trivial.

**Why this matters:**
- **Consistency:** All tools use the same formats
- **Predictability:** Same input → same output every time
- **Clarity:** Limited choices make decisions trivial
- **Maintainability:** Easy to understand and maintain

## The Palette

| Format | Command Suffix | When to Use |
|--------|-----------------|-------------|
| **table** | `\| table` | Quick human overview, terminal |
| **compact** | `\| select ... \| table -e` | Focused single-item key-value |
| **csv** | `\| to csv -n` | Export, spreadsheets |
| **html** | `\| to html` | Web rendering |
| **nuon** | `\| to nuon` | Nushell-native, pipe to other nu commands |
| **json** | `\| to json -r` | Debugging, API interop |

**Format Selection Guide:**

| Scenario | Recommended Format | Reason |
|----------|-------------------|--------|
| **Daily standup** | `table` | Quick overview of all tasks |
| **Focused review** | `compact` | Single task at a glance |
| **Export to spreadsheet** | `csv` | Standard format for data transfer |
| **Pass to another nu command** | `nuon` | Pipe-friendly, preserves structure |
| **API debug** | `json` | Full structure for debugging |
| **Share in email** | `html` | Rendered view for documentation |
| **Pipeline stage inspection** | `nuon` | Chain transforms |

## Quick Reference

### td list (all tasks)

```bash
# Table overview
nu -c "td list --json | from json | table"

# CSV export  
nu -c "td list --json | from json | to csv -n"

# HTML table
nu -c "td list --json | from json | to html"

# NUON (pipe to other nu commands)
nu -c "td list --json | from json | to nuon"

# Select fields to JSON
nu -c "td list --json | from json | select id title status | to json"
```

### td current (focused task)

```bash
# Compact key-value (recommended)
nu -c "td current --json | from json | get focused.issue | select id title status priority | table -e"

# Pretty JSON
nu -c "td current --json | from json | get focused.issue | to json -r"

# NUON
nu -c "td current --json | from json | get focused.issue | to nuon"
```

## Output Examples

### table
```
╭───┬───────────┬────────────────────────────────────────────┬───────────┬─────╮
│ # │    id     │                   title                    │  status   │ ... │
├───┼───────────┼────────────────────────────────────────────┼───────────┼─────┤
│ 0 │ td-ca5306 │ Evaluate Nushell integration opportunities │ in_progre │ ... │
╰───┴───────────┴────────────────────────────────────────────┴───────────┴─────╯
```

**When to use:**
- Quick scan of multiple records
- Human overview in terminal
- Displaying lists or arrays
- Reviewing task lists

### compact (table -e)
```
╭──────────┬────────────────────────────────────────────╮
│ id       │ td-ca5306                                  │
│ title    │ Evaluate Nushell integration opportunities │
│ status   │ in_progress                                │
│ priority │ P2                                         │
╰──────────┴────────────────────────────────────────────╯
```

**When to use:**
- Focused single-item view
- Status summary
- Key-value display
- Compact reference

### csv
```
td-ca5306,Evaluate Nushell integration opportunities,in_progress,chore,P2,0,...
```

**When to use:**
- Export to spreadsheets
- Data transfer between tools
- CSV import into databases
- External tool integration

### nuon
```
[[id, title, status, type, priority]; ["td-ca5306", "Evaluate Nushell integration opportunities", in_progress, chore, "P2"]]
```

**When to use:**
- Chaining nu commands
- Nushell-native processing
- Data pipelines
- Intermediate transformations

### json
```json
{
  "id": "td-ca5306",
  "title": "Evaluate Nushell integration opportunities",
  "status": "in_progress",
  ...
}
```

**When to use:**
- Debugging
- API interop
- Full structure inspection
- Configuration files

### html
```html
<table><thead><tr><th>id</th><th>title</th>...</tr></thead>...
```

**When to use:**
- Web rendering
- Email documentation
- Report generation
- Markdown conversion

## Why This Matters

| Principle | Benefit |
|----------|---------|
| **Limited choices** | Trivial decision — just pick format |
| **Deterministic** | Same input → same output every time |
| **Mutually readable** | Human or agent can parse |
| **Pipe-friendly** | NUON chains with other nu commands |
| **Entropy reduction** | Raw JSON (Stuff) → Structured (Thing) |

**Benefits:**
- **Consistency:** All tools use the same formats
- **Predictability:** Output is always the same for the same input
- **Clarity:** Limited choices make decisions trivial
- **Maintainability:** Easy to understand and maintain
- **AI-Friendly:** Agents can predict and parse output reliably

## Integration with Edinburgh Protocol

The visual palette embodies **Conceptual Entropy Reduction**:

```
Raw Tool Output (Stuff)
    ↓
nu -c "... | to <format>" (Thing)
    ↓
Agent/Human consumes deterministic structure
```

When every tool outputs predictable shapes, reasoning becomes trivial.

**How it works:**
1. **Raw Output:** Tools produce structured data (JSON, JSONL, YAML)
2. **Transformation:** Apply visual palette format to create deterministic shape
3. **Consumption:** Agents and humans can reason about the structured output

**Example:**
```bash
# Raw output (high entropy)
td list --json

# Transformed (low entropy)
td list --json | from json | table
```

## Best Practices

### 1. Choose Format Based on Use Case

Select the format that matches your use case.

```bash
# Good: Choose format based on use case
td list --json | from json | table  # Human overview
td list --json | from json | to csv -n  # Export

# Bad: Always use the same format regardless of use case
td list --json | from json | table  # Even when exporting
```

**Why:** Different formats serve different purposes.

### 2. Use Table for Human Overview

Use `table` for quick human scanning.

```bash
# Good
td list --json | from json | table

# Bad
td list --json | from json | to json -r  # Harder to read
```

**Why:** Tables are optimized for human readability.

### 3. Use Compact for Focused View

Use `table -e` for single-item key-value display.

```bash
# Good
td current --json | from json | get focused.issue | select id title status | table -e

# Bad
td current --json | from json | get focused.issue | table  # Too verbose
```

**Why:** Compact format provides focused information.

### 4. Use CSV for Export

Use `to csv -n` for data export.

```bash
# Good
td list --json | from json | to csv -n > export.csv

# Bad
td list --json | from json | table > export.txt  # Hard to import
```

**Why:** CSV is the standard format for data transfer.

### 5. Use NUON for Chaining

Use `to nuon` when chaining nu commands.

```bash
# Good
td list --json | from json | to nuon | where status == "in_progress"

# Bad
td list --json | from json | table | where status == "in_progress"  # May fail
```

**Why:** NUON preserves structure for further processing.

### 6. Use JSON for Debugging

Use `to json -r` for debugging and API interop.

```bash
# Good
td current --json | from json | to json -r

# Bad
td current --json | from json | table  # Loses structure
```

**Why:** JSON preserves full structure for inspection.

## Common Pitfalls

### Pitfall 1: Using Wrong Format for Use Case

**Problem:** Using table format when exporting data.

```bash
# Bad
td list --json | from json | table > export.txt

# Good
td list --json | from json | to csv -n > export.csv
```

**Solution:** Choose format based on use case.

### Pitfall 2: Not Using Compact for Focused View

**Problem:** Using full table for single-item display.

```bash
# Bad
td current --json | from json | get focused.issue | table

# Good
td current --json | from json | get focused.issue | select id title status | table -e
```

**Solution:** Use compact format for focused views.

### Pitfall 3: Not Using NUON for Chaining

**Problem:** Using table format when chaining commands.

```bash
# Bad
td list --json | from json | table | where status == "in_progress"

# Good
td list --json | from json | to nuon | where status == "in_progress"
```

**Solution:** Use NUON when chaining nu commands.

### Pitfall 4: Using JSON for Human Overview

**Problem:** Using JSON when human readability is needed.

```bash
# Bad
td list --json | from json | to json -r

# Good
td list --json | from json | table
```

**Solution:** Use table for human overview.

### Pitfall 5: Not Using CSV for Export

**Problem:** Using table format for data export.

```bash
# Bad
td list --json | from json | table > export.txt

# Good
td list --json | from json | to csv -n > export.csv
```

**Solution:** Use CSV for data export.

## References

- [Nushell Documentation](https://www.nushell.sh/) – Official Nushell documentation
- [Origami Protocol Playbook](./origami-protocol.md) – Data folding and transformation
- [Nushell Agent Playbook](./nushell-agent-playbook.md) – Nushell integration for task state
- [Loading Process Playbook](./loading-process-playbook.md) – Two-step loading process pattern
- [Edinburgh Protocol Playbook](./edinburgh-protocol.md) – Decision-making under uncertainty

---

**Version:** 1.0  
**Last Updated:** 2026-03-21  
**Maintained by:** PolyVis Development Team
