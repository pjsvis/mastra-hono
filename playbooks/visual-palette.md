---
name: visual-palette
description: The limited palette of structured output formats for deterministic display.
---

# Visual Palette

## Philosophy

**Limited palette, maximum clarity.** 

When displaying structured data, use one of these formats. No ad-hoc formatting — the choice should be trivial.

## The Palette

| Format | Command Suffix | When to Use |
|--------|-----------------|-------------|
| **table** | `\| table` | Quick human overview, terminal |
| **compact** | `\| select ... \| table -e` | Focused single-item key-value |
| **csv** | `\| to csv -n` | Export, spreadsheets |
| **html** | `\| to html` | Web rendering |
| **nuon** | `\| to nuon` | Nushell-native, pipe to other nu commands |
| **json** | `\| to json -r` | Debugging, API interop |

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

### compact (table -e)
```
╭──────────┬────────────────────────────────────────────╮
│ id       │ td-ca5306                                  │
│ title    │ Evaluate Nushell integration opportunities │
│ status   │ in_progress                                │
│ priority │ P2                                         │
╰──────────┴────────────────────────────────────────────╯
```

### csv
```
td-ca5306,Evaluate Nushell integration opportunities,in_progress,chore,P2,0,...
```

### nuon
```
[[id, title, status, type, priority]; ["td-ca5306", "Evaluate Nushell integration opportunities", in_progress, chore, "P2"]]
```

## Why This Matters

| Principle | Benefit |
|----------|---------|
| **Limited choices** | Trivial decision — just pick format |
| **Deterministic** | Same input → same output every time |
| **Mutually readable** | Human or agent can parse |
| **Pipe-friendly** | NUON chains with other nu commands |
| **Entropy reduction** | Raw JSON (Stuff) → Structured (Thing) |

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
