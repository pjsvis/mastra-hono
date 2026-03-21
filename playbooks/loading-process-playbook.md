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
- [Implementation Guide](#implementation-guide)
- [Section Extraction](#section-extraction)
  - [Using ast-grep](#using-ast-grep)
  - [Alternative Methods](#alternative-methods)
- [Template](#template)
- [Best Practices](#best-practices)
- [Examples](#examples)
  - [Example 1: Simple Playbook](#example-1-simple-playbook)
  - [Example 2: Complex Playbook](#example-2-complex-playbook)
- [References](#references)

## Purpose
This playbook documents the **two‑step loading process** pattern for structured markdown documentation. It explains why this pattern exists, when to use it, how to implement it, and provides best practices for creating maintainable, discoverable documentation.

**Core Philosophy:** Documentation should be **discoverable** and **extractable** – users should be able to find what they need in seconds, not minutes.

**Note:** The actual loading instructions are now centralized in `LOADING_PROCESS.md`. This playbook provides the rationale and implementation guidance for the pattern itself.

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

1. **Self‑Contained Sections**: Each section should be independently readable. A user should be able to extract a single section and understand it without needing context from other sections.
2. **Hierarchical Structure**: Use consistent heading levels (`#` for title, `##` for major sections, `###` for subsections).
3. **Anchor Links**: Every section in the table of contents should have a corresponding anchor link.
4. **Frontmatter Metadata**: Include `id`, `title`, `version`, and `last_updated` fields for tracking.
5. **Progressive Disclosure**: Structure information from general overview to specific implementation details.

## Implementation Guide

### Step 1: Create Frontmatter
Start with YAML frontmatter containing metadata like ID, role, and infrastructure.

### Step 2: Add Title and Purpose
Clearly state what the playbook covers and its core philosophy.

### Step 3: Create Table of Contents
List all `##` sections (and important `###` subsections) with anchor links.

### Step 4: Write Self‑Contained Sections
Ensure each section starts with a clear heading and provides complete information on its topic.

## Section Extraction

### Using ast-grep
`ast-grep` is ideal for structured markdown because it parses the document into an AST.

```bash
# Extract a specific section by heading
ast-grep -p '## Section Name' -A 50 playbook.md
```

### Alternative Methods

**Simple grep:**
```bash
grep -A 30 "## Section Name" playbook.md
```

**sed:**
```bash
sed -n '/## Section Name/,/^## /p' playbook.md | head -n -1
```

## Template

```markdown
---
id: PB-XXX
title: "Playbook Title"
role: "Role"
infrastructure: [tools]
last_updated: "YYYY-MM-DD"
tags: [playbook]
---

# Playbook Title

## Table of Contents
- [Purpose](#purpose)
- [Section 1](#section-1)
- [References](#references)

## Purpose
Brief description of what this playbook covers.

## Section 1
Content for section 1.

## References
- [Link](url)
```

## Best Practices

1. **Keep Sections Focused**: Each section should address a single topic.
2. **Use Examples**: Include concrete, copy-pasteable examples for complex concepts.
3. **Maintain Consistency**: Use consistent formatting for headings, code blocks, and lists.
4. **Update Regularly**: Always update the `last_updated` field and TOC when making changes.
5. **Test Extraction**: Verify that sections can be extracted correctly using `ast-grep`.

## Examples

### Example 1: Simple Playbook
A simple playbook with minimal sections and a clear purpose statement.

### Example 2: Complex Playbook
A playbook with nested subsections, tables, and multiple code examples, requiring a robust TOC.

## References

- [LOADING_PROCESS.md](../LOADING_PROCESS.md) – Centralized loading instructions
- [ast-grep Documentation](https://ast-grep.github.io/) – Official documentation for the extraction tool
- [Git Workflow Playbook](./git-workflow-playbook.md) – Example of a playbook using this pattern

---
**Last Updated:** 2026-03-21