---
name: origami-protocol
description: A lexicon for folding structured data into deterministic shapes. Provides shorthand for structuring data and debugging ingestion pipelines.
---

# The Origami Protocol

## Philosophy

**Same base, multiple forms.**

The Origami Protocol is a **lexicon for data folding** — transforming structured data into predictable shapes without losing information. Like origami, we start with a single sheet (raw data) and fold it into forms that reveal different aspects.

## Core Principle

```
Data (Paper)
    ↓ fold()
    Table | Compact | CSV | NUON | JSON | HTML
    ↓ unfold()
    Original data (preserved)
```

Every fold is:
- **Deterministic** — same input → same output
- **Reversible** — data is transformed, not destroyed
- **Composable** — folds can be chained

---

## The Folds

### 1. Flat Fold → `table`

Reveals overview. Best for scanning multiple records.

```bash
nu -c "td list --json | from json | table"
```

**Output:**
```
╭───┬───────────┬────────────────────────────────────────────┬───────────┬─────╮
│ # │    id     │                   title                    │  status   │ ... │
├───┼───────────┼────────────────────────────────────────────┼───────────┼─────┤
│ 0 │ td-ca5306 │ Evaluate Nushell integration opportunities │ in_progre │ ... │
╰───┴───────────┴────────────────────────────────────────────┴───────────┴─────╯
```

**Best for:** Quick scan, human overview, terminal display

---

### 2. Stacked Fold → `table -e`

Reveals key-value. Best for single-record focus.

```bash
nu -c "td current --json | from json | get focused.issue | select id title status priority | table -e"
```

**Output:**
```
╭──────────┬────────────────────────────────────────────╮
│ id       │ td-ca5306                                  │
│ title    │ Evaluate Nushell integration opportunities │
│ status   │ in_progress                                │
│ priority │ P2                                         │
╰──────────┴────────────────────────────────────────────╯
```

**Best for:** Focused task, status summary, compact reference

---

### 3. Rolled Fold → `csv`

Reveals exportable form. Best for spreadsheets and data transfer.

```bash
nu -c "td list --json | from json | to csv -n"
```

**Output:**
```
td-ca5306,Evaluate Nushell integration opportunities,in_progress,chore,P2,0,...
```

**Best for:** Export, spreadsheets, external tools

---

### 4. Nested Fold → `nuon`

Reveals structure that chains. Best for piping to other nu commands.

```bash
nu -c "td list --json | from json | to nuon"
```

**Output:**
```
[[id, title, status, type, priority]; ["td-ca5306", "Evaluate Nushell integration opportunities", in_progress, chore, "P2"]]
```

**Best for:** Chaining transforms, Nushell-native processing, data pipelines

---

### 5. Pressed Fold → `json`

Reveals full structure. Best for debugging and API interop.

```bash
nu -c "td current --json | from json | to json -r"
```

**Output:**
```json
{
  "id": "td-ca5306",
  "title": "Evaluate Nushell integration opportunities",
  "status": "in_progress",
  ...
}
```

**Best for:** Debugging, API payloads, full inspection

---

### 6. Wrapped Fold → `html`

Reveals renderable form. Best for web display.

```bash
nu -c "td list --json | from json | to html"
```

**Output:**
```html
<table><thead><tr><th>id</th><th>title</th>...</tr></thead>...
```

**Best for:** Web rendering, email, documentation

---

## Debugging Ingestion Pipelines

### The Fold Debug Pattern

When data flows through a pipeline, use origami to inspect each stage:

```
Raw Input → Fold → Inspect → Fold → Inspect → Output
```

**Example: Debug a JSON API response**

```bash
# Stage 1: Raw response
curl -s https://api.example.com/data | to json -r

# Stage 2: Extract specific field
curl -s https://api.example.com/data | from json | get data.items | table

# Stage 3: Filter and compact
curl -s https://api.example.com/data | from json | where status == "active" | select id name | table -e
```

### Fold Selection by Pipeline Stage

| Stage | Fold | Why |
|-------|------|-----|
| **Input** | `json` | Verify structure |
| **Transform** | `nuon` | Chain transforms |
| **Filter** | `table` | Verify filter results |
| **Output** | `csv` | Export or final format |

### Common Pipeline Debug Commands

```bash
# Verify input shape
curl -s https://api.com/data | from json | to nuon | head -c 200

# Count records
curl -s https://api.com/data | from json | length

# Check for nulls
curl -s https://api.com/data | from json | where field == null | length

# Sample first record
curl -s https://api.com/data | from json | first | to json -r

# Validate schema
curl -s https://api.com/data | from json | first | columns | table
```

---

## The Origami Grammar

### Command Pattern

```
<source> | from <format> | [transforms] | to <fold>
```

### Transform Verbs

| Verb | Action |
|------|--------|
| `select` | Choose fields |
| `where` | Filter rows |
| `get` | Navigate to field |
| `sort-by` | Order results |
| `group-by` | Aggregate |
| `insert` | Add computed field |
| `update` | Modify field |
| `drop` | Remove field |

### Examples

```bash
# Select + sort + table
td list --json | from json | sort-by priority | select id title status | table

# Filter + compact
td list --json | from json | where status == "in_progress" | table -e

# Extract + JSON
td current --json | from json | get focused.issue | to json -r

# Chain transforms (nuon)
td list --json | from json | where priority == "P2" | to nuon
```

---

## Catalog: When to Use Which Fold

| Scenario | Fold | Reason |
|----------|------|--------|
| **Daily standup** | `table` | Quick overview of all tasks |
| **Focused review** | `compact` | Single task at a glance |
| **Export to spreadsheet** | `csv` | Standard format |
| **Pass to another nu command** | `nuon` | Pipe-friendly |
| **API debug** | `json` | Full structure |
| **Share in email** | `html` | Rendered view |
| **Pipeline stage inspection** | `nuon` | Chain transforms |
| **Count/verify** | `table` | Aggregate view |

---

## Entropy Reduction

The Origami Protocol embodies **Conceptual Entropy Reduction**:

| Stage | Entropy | Action |
|-------|--------|--------|
| Raw JSON | High | Parse with `from json` |
| Structured | Medium | Transform with verbs |
| Folded | Low | Output deterministic shape |
| Consumed | Zero | Agent/human can reason |

```
Raw Tool Output (Stuff)
    ↓ origami()
    Deterministic Fold (Thing)
    ↓
    Agent/Human consumes predictable structure
```

---

## Integration with Edinburgh Protocol

The Origami Protocol is the **display layer** of the Edinburgh Protocol:

1. **Mentation** — Agent processes input (handled by Mastra)
2. **Origami** — Output folded into deterministic shape (this protocol)
3. **Impartial Spectator** — Human/agent can verify

When agents output in origami folds, verification becomes trivial.

---

## Reference

### Quick Reference Card

```
# Overview
td list --json | from json | table

# Focused
td current --json | from json | get focused.issue | table -e

# Export
td list --json | from json | to csv -n

# Debug
td show <id> --json | from json | to json -r

# Chain
td list --json | from json | to nuon
```

### Environment

- **Requires:** `nu` (Nushell)
- **Data source:** Any JSON-producing CLI (`td`, `curl`, `jq`, etc.)
- **Platform:** macOS, Linux, WSL
