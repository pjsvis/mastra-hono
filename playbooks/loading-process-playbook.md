---
id: PB-013
title: "Loading Process Playbook"
role: "Orchestrate"
infrastructure: [ast-grep]
last_updated: "2026-03-21"
tags: [playbook]
---

# Loading Process Playbook

## Table of Contents

- [Purpose](#purpose)
- [When to Use This Pattern](#when-to-use-this-pattern)
  - [Ideal Use Cases](#ideal-use-cases)
  - [When NOT to Use This Pattern](#when-not-to-use-this-pattern)
- [Design Principles](#design-principles)
  - [1. Self‑Contained Sections](#1-self‑contained-sections)
- [Section Name](#section-name)
  - [Subsection 1](#subsection-1)
  - [Subsection 2](#subsection-2)
- [Section Name](#section-name)
  - [2. Hierarchical Structure](#2-hierarchical-structure)
  - [3. Anchor Links](#3-anchor-links)
- [Section Name](#section-name)
  - [4. Frontmatter Metadata](#4-frontmatter-metadata)
  - [5. Progressive Disclosure](#5-progressive-disclosure)
- [Implementation Guide](#implementation-guide)
  - [Step 1: Create Frontmatter](#step-1-create-frontmatter)
  - [Step 2: Add Title and Purpose](#step-2-add-title-and-purpose)
- [Purpose](#purpose)
  - [Step 3: Create Table of Contents](#step-3-create-table-of-contents)
- [Frontmatter Metadata](#frontmatter-metadata)
  - [Required Fields](#required-fields)
  - [Optional Fields](#optional-fields)
  - [Example Frontmatter](#example-frontmatter)
  - [Best Practices](#best-practices)
  - [Example Structure](#example-structure)
- [Section Extraction](#section-extraction)
  - [Using `ast-grep`](#using-`ast-grep`)
  - [Alternative Methods](#alternative-methods)
- [Template](#template)
- [Purpose](#purpose)
- [Purpose](#purpose)
- [Section 1](#section-1)
  - [Subsection 1.1](#subsection-11)
  - [Subsection 1.2](#subsection-12)
- [Section 2](#section-2)
- [References](#references)
- [Best Practices](#best-practices)
  - [1. Keep Sections Focused](#1-keep-sections-focused)
  - [2. Use Examples](#2-use-examples)
  - [3. Maintain Consistency](#3-maintain-consistency)
  - [4. Update Regularly](#4-update-regularly)
  - [5. Test Extraction](#5-test-extraction)
- [Examples](#examples)
  - [Example 1: Simple Playbook](#example-1-simple-playbook)
- [Purpose](#purpose)
- [Purpose](#purpose)
- [Section 1](#section-1)
  - [Example 2: Complex Playbook](#example-2-complex-playbook)
- [Purpose](#purpose)
- [Purpose](#purpose)
- [Section 1](#section-1)
  - [Subsection 1.1](#subsection-11)
  - [Subsection 1.2](#subsection-12)
- [Section 2](#section-2)
- [References](#references)
- [References](#references)

## Purpose
This playbook documents the **two‑step loading process** pattern for structured markdown documentation. It explains why this pattern exists, when to use it, how to implement it, and provides best practices for creating maintainable, discoverable documentation.

**Core Philosophy:** Documentation should be **discoverable** and **extractable** – users should be able to find what they need in seconds, not minutes.

**Note:** The actual loading instructions are now centralized in `LOADING_PROCESS.md`. This playbook provides the rationale and implementation guidance for the pattern.


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

**Good:**
```markdown
## Section Name

Brief description of what this section covers.

### Subsection 1
Content...

### Subsection 2
Content...
```

**Bad:**
```markdown
## Section Name

(No description – user must read other sections to understand purpose)
```

### 2. Hierarchical Structure

Use **consistent heading levels** to create a clear hierarchy:

- `#` – Document title (use once)
- `##` – Major sections (table of contents level)
- `###` – Subsections within major sections
- `####` – Detailed subsections

### 3. Anchor Links

Every section in the table of contents should have a corresponding anchor link. GitHub automatically creates anchor links from headings by converting to lowercase and replacing spaces with hyphens.

**Example:**
```markdown
## Section Name

This section can be linked as: `#section-name`
```

### 4. Frontmatter Metadata

Include **version** and **last_updated** fields in frontmatter for tracking and maintenance:

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

## Template

```markdown
---
date: YYYY-MM-DD
tags:
  - playbook
  - documentation
  - process
version: 1.0
last_updated: YYYY-MM-DD
---

# Playbook Title

## Purpose
Brief description of what this playbook covers.


## Purpose
[Content from earlier]

## Section 1

Brief description of this section.

### Subsection 1.1
Content...

### Subsection 1.2
Content...

## Section 2

Brief description of this section.

Content...

## References

- [Link 1](url)
- [Link 2](url)
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

## Examples

### Example 1: Simple Playbook

```markdown
---
date: 2026-03-21
tags: [playbook, documentation]
version: 1.0
last_updated: 2026-03-21
---

# Simple Playbook

## Purpose
This playbook demonstrates the two‑step loading process.


## Purpose
[Content from earlier]

## Section 1

This is a simple section with one paragraph.
```

### Example 2: Complex Playbook

```markdown
---
date: 2026-03-21
tags: [playbook, documentation, process]
version: 1.0
last_updated: 2026-03-21
---

# Complex Playbook

## Purpose
This playbook demonstrates nested sections and code examples.


## Purpose
[Content from earlier]

## Section 1

This section has multiple subsections.

### Subsection 1.1

Content for subsection 1.1.

```bash
# Example code
echo "Hello, world!"
```

### Subsection 1.2

Content for subsection 1.2.

## Section 2

This section has a table:

| Column 1 | Column 2 |
|----------|----------|
| Value 1  | Value 2  |
| Value 3  | Value 4  |
```

## References

- [ast-grep Documentation](https://ast-grep.github.io/)
- [Markdown Guide](https://www.markdownguide.org/)
- [Git Playbook](./git-playbook.md)
- [Debriefs Playbook](./debriefs-playbook.md)
- [Two-Step Loading Process Playbook](./two-step-loading-playbook.md)

## References

- [Git Playbook](./git-playbook.md) – Comprehensive Git troubleshooting and best practices
- [Debriefs Playbook](./debriefs-playbook.md) – Debrief creation and management guidelines
- [Two-Step Loading Process Playbook](./two-step-loading-playbook.md) – Design pattern for structured documentation lookup

---

**Last Updated:** 2026-03-21
