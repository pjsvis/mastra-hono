# Loading Process

## Purpose
This file provides **centralized loading instructions** for all playbooks in the Mastra project. It defines the current **two‑step loading process** pattern for structured markdown documentation.

**Core Philosophy:** Documentation should be **discoverable** and **extractable** – users should be able to find what they need in seconds, not minutes.

## Version
**Current Version:** 1.0  
**Last Updated:** 2026-03-21

## How to Use This File

Add this line to the top of your playbook (after frontmatter):

```nu
source "$(pwd)/LOADING_PROCESS.md"
```

This will include the loading process instructions in your playbook without duplication.

## The Loading Process

This playbook is designed for **two‑step lookup**:

### Step 1 – Review Contents

Scan the **Table of Contents** below to identify which section contains the information you need. Each section is self‑contained and can be read independently.

### Step 2 – Extract Section

Use `ast-grep` or any markdown processor to extract the specific section you need.

#### Using `ast-grep` (recommended)

```bash
# Extract a specific section by heading
ast-grep -p '## Section Name' -A 50 playbooks/your-playbook.md

# Extract all code blocks in a section
ast-grep -p '```bash' -A 10 playbooks/your-playbook.md

# Extract a table
ast-grep -p '| Column 1 | Column 2' -A 20 playbooks/your-playbook.md

# Extract all checklists
ast-grep -p '## Checklist' -A 30 playbooks/your-playbook.md
```

#### Alternative Extraction Methods

**Simple grep:**
```bash
grep -A 30 "## Section Name" playbooks/your-playbook.md
```

**sed:**
```bash
sed -n '/## Section Name/,/^## /p' playbooks/your-playbook.md | head -n -1
```

**awk:**
```bash
awk '/## Section Name/,/^## [^#]/ {print}' playbooks/your-playbook.md | head -n -1
```

## When to Use This Pattern

### Ideal Use Cases

| Situation | Recommended Action | Rationale |
|-----------|-------------------|-----------|
| **Large documentation files** (> 100 lines) | Apply two‑step loading | Users need navigation to find relevant sections quickly. |
| **Multiple sections with distinct topics** | Apply two‑step loading | Each section can be read independently. |
| **Frequent updates to specific sections** | Apply two‑step loading | Smaller, focused edits reduce merge conflicts. |
| **Team collaboration on documentation** | Apply two‑step loading | Clear structure reduces confusion and improves onboarding. |
| **Documentation that needs to be searchable** | Apply two‑step loading | Metadata and tags enable semantic discovery. |

### When NOT to Use This Pattern

| Situation | Recommended Action | Rationale |
|-----------|-------------------|-----------|
| **Very short documents** (< 50 lines) | Skip table of contents | Navigation overhead outweighs benefits. |
| **Single‑topic documents** | Skip table of contents | No need for navigation; document is already focused. |
| **Temporary or draft documents** | Skip table of contents | Not worth the overhead for short‑lived content. |
| **Highly sequential content** | Skip table of contents | Content must be read in order; extraction would break flow. |

## Design Principles

### 1. Self‑Contained Sections

Each section should be **independently readable**. A user should be able to extract a single section and understand it without needing context from other sections.

### 2. Hierarchical Structure

Use **consistent heading levels** to create a clear hierarchy:

- `#` – Document title (use once)
- `##` – Major sections (table of contents level)
- `###` – Subsections within major sections
- `####` – Detailed subsections

### 3. Anchor Links

Every section in the table of contents should have a corresponding anchor link. GitHub automatically creates anchor links from headings by converting to lowercase and replacing spaces with hyphens.

### 4. Frontmatter Metadata

Include **version** and `last_updated` fields in frontmatter for tracking and maintenance:

```yaml
---
version: 1.0
last_updated: 2026-03-21
---
```

### 5. Progressive Disclosure

Structure information from general to specific:
1. **High-level overview** (Purpose, Design Principles)
2. **Implementation guidance** (How to apply the pattern)
3. **Best practices** (What to do and avoid)
4. **Examples** (Real-world applications)

## Implementation Guide

### Step 1: Create Frontmatter

Start with YAML frontmatter containing metadata:

```yaml
---
date: 2026-03-21
tags:
  - playbook
  - documentation
  - process
version: 1.0
last_updated: 2026-03-21
---
```

### Step 2: Add Title and Purpose

```markdown
# Playbook Title

## Purpose
Brief description of what this playbook covers and why it exists.
```

### Step 3: Create Table of Contents

List all major sections with anchor links:

```markdown
## Table of Contents

- [Purpose](#purpose)
- [Table of Contents](#table-of-contents)
- [Section 1](#section-1)
- [Section 2](#section-2)
  - [Subsection 2.1](#subsection-21)
- [Section 3](#section-3)
```

### Step 4: Add Loading Process Section

Include this file:

```nu
source "$(pwd)/LOADING_PROCESS.md"
```

### Step 5: Write Self‑Contained Sections

Each major section should:
- Start with a brief description
- Use subsections for organization
- Include examples where appropriate
- Be readable in isolation

### Step 6: Test Extraction

Verify that sections can be extracted correctly:

```bash
# Test extracting a section
ast-grep -p '## Section Name' -A 50 playbooks/your-playbook.md

# Verify the output is complete and readable
```

## Frontmatter Metadata

### Required Fields

| Field | Format | Purpose |
|-------|--------|---------|
| `date` | YYYY-MM-DD | Creation date |
| `tags` | Array of strings | Categorization and searchability |
| `version` | X.Y | Semantic versioning |
| `last_updated` | YYYY-MM-DD | Last modification date |

### Optional Fields

| Field | Format | Purpose |
|-------|--------|---------|
| `agent` | String | Which agent created the document |
| `environment` | String | Target environment (local, dev, prod) |
| `status` | String | Document status (draft, review, published) |

### Example Frontmatter

```yaml
---
date: 2026-03-21
tags:
  - playbook
  - documentation
  - process
  - workflow
version: 1.0
last_updated: 2026-03-21
agent: local-ai
environment: development
status: published
---
```

## Table of Contents Structure

### Best Practices

1. **Include all major sections** – Every `##` heading should have a corresponding entry.
2. **Use anchor links** – Format as `[Text](#anchor)`.
3. **Nest subsections** – Indent subsections under their parent.
4. **Keep it alphabetical** – Order sections logically (not necessarily alphabetically).
5. **Update when adding sections** – Always update the table of contents when adding new sections.

### Example Structure

```markdown
## Table of Contents

- [Purpose](#purpose)
- [Table of Contents](#table-of-contents)
- [Section 1](#section-1)
  - [Subsection 1.1](#subsection-11)
  - [Subsection 1.2](#subsection-12)
- [Section 2](#section-2)
- [Section 3](#section-3)
  - [Subsection 3.1](#subsection-31)
- [References](#references)
```

## Section Extraction

### Using `ast-grep`

`ast-grep` is ideal for structured markdown because it parses the document into an AST, making extraction more reliable than pattern matching.

#### Common Patterns

```bash
# Extract by heading
ast-grep -p '## Section Name' -A 50 playbook.md

# Extract code blocks
ast-grep -p '```bash' -A 10 playbook.md

# Extract tables
ast-grep -p '| Header 1 | Header 2' -A 20 playbook.md

# Extract checklists
ast-grep -p '- [ ]' -A 1 playbook.md

# Extract multiple sections
ast-grep -p '## (Section 1|Section 2)' -A 50 playbook.md
```

#### Programmatic Extraction

Create a reusable script for extracting sections:

```bash
#!/bin/bash
# extract-section.sh
SECTION=$1
FILE=$2

if [ -z "$SECTION" ] || [ -z "$FILE" ]; then
  echo "Usage: $0 <section> <file>"
  exit 1
fi

ast-grep -p "## $SECTION" -A 100 "$FILE" | sed '/^## [^#]/q'
```

Usage:
```bash
./extract-section.sh "Loading Process" playbooks/git-playbook.md
```

### Alternative Methods

#### `grep` (quick and dirty)

```bash
grep -A 30 "## Section Name" playbook.md
```

#### `sed` (precise line ranges)

```bash
sed -n '/## Section Name/,/^## /p' playbook.md | head -n -1
```

#### `awk` (structured extraction)

```bash
awk '/## Section Name/,/^## [^#]/ {print}' playbook.md | head -n -1
```

## Best Practices

### 1. Keep Sections Focused

Each section should address a single topic. If a section becomes too long, consider splitting it into subsections or separate sections.

### 2. Use Examples

Include concrete examples for complex concepts. Examples should be:

- **Complete** – Don't truncate code snippets
- **Copy‑pasteable** – Users should be able to use them directly
- **Annotated** – Explain what the example does

### 3. Maintain Consistency

Use consistent formatting throughout:

- **Heading levels** – Don't skip levels (e.g., don't go from `##` to `####`)
- **Code blocks** – Specify language for syntax highlighting
- **Lists** – Use the same list style (bullets vs. numbered) consistently

### 4. Update Regularly

When updating a playbook:

1. Update the `last_updated` field in frontmatter
2. Update the version number if changes are significant
3. Update the table of contents if sections were added/removed
4. Test extraction of updated sections

### 5. Test Extraction

Before committing a playbook, verify that sections can be extracted:

```bash
# Test extracting each major section
for section in "Section 1" "Section 2" "Section 3"; do
  echo "Testing: $section"
  ast-grep -p "## $section" -A 50 playbook.md | head -n 5
done
```

## Migration Guide

If your playbook currently has its own loading instructions, replace them with:

```nu
source "$(pwd)/LOADING_PROCESS.md"
```

This will include the centralized loading instructions without duplication.

## Benefits

- **Single source of truth** – One file to maintain instead of 27
- **Easy updates** – Change this file when the loading process evolves
- **Consistency** – All playbooks use the same loading process
- **Backward compatible** – Playbooks can opt in if they have special needs
- **Reduced duplication** – No need to repeat instructions in every playbook

## Versioning

When this file changes, increment the version number:

- **Major version (X.0)** – Breaking changes to the loading process
- **Minor version (0.Y)** – Non-breaking changes or additions

## Related Documentation

- [Loading Process Playbook](./playbooks/loading-process-playbook.md) – Detailed explanation of the pattern
- [Playbook Loading Process Tracker](./docs/playbook-loading-process-tracker.md) – Progress tracking for applying this pattern

---

**Version:** 1.0  
**Last Updated:** 2026-03-21  
**Maintained by:** PolyVis Development Team