# Docmd Integration Notes

**Status:** In Progress
**Date:** 2026-03-26
**Agent:** ctx-vs

## Remaining Tasks

### 1. 📋 Update Loading Process Document
The `playbook-loading-process-tracker.md` should be updated to document the new docmd-based documentation system.

**Suggested additions:**
```markdown
## Documentation (Updated 2026-03-26)

### Docmd Integration

The project now uses Docmd for documentation. See `docs/docmd.config.ts`.

**Commands:**
- `bun scripts/dev.ts docs build` - Build static docs
- `bun scripts/dev.ts docs serve` - Dev server with live reload
- `bun scripts/dev.ts docs auto` - Generate TODO/export inventory

**Output:** `docs-site/` directory with HTML pages and `llms.txt` for AI agents.

**Source:** All `.md` files in `playbooks/`, `briefs/`, `debriefs/`, `src/`, `docs/`
```

### 2. 🗑️ Remove TOC Sections from Playbooks
Docmd automatically generates a Table of Contents sidebar. Manual TOC sections in playbooks are redundant.

**Action:** Search for and remove TOC sections from all playbooks.

```bash
# Find playbooks with TOC sections
grep -l "^## Table of Contents\|^## Contents\|^## TOC" playbooks/*.md

# Or remove lines matching TOC patterns
sed -i '' '/^## Table of Contents/,/^## /d' playbooks/*.md
```

**Pattern to remove:**
```markdown
## Table of Contents
- [Section 1](#section-1)
- [Section 2](#section-2)
...
```

### 3. ✅ Src README Links (Done)
Docmd scans project root (`srcDir: "."`) so `src/**/README.md` files automatically appear in:
- Sidebar navigation
- `llms.txt` Source Documentation section

No manual configuration needed.

## Verification
- [ ] Links in docmd sidebar work
- [ ] `llms.txt` contains src documentation
- [ ] Loading process doc updated
- [ ] Manual TOCs removed from playbooks
