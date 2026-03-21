# Playbook Loading Process Tracker

## Purpose
This document tracks the progress of applying the **two‑step loading process** pattern to all playbooks in the project. It serves as a central reference for monitoring implementation status, identifying blockers, and ensuring consistency across all documentation.

## Overview

- **Total Playbooks:** 27
- **Completed:** 27
- **In Progress:** 0
- **Not Started:** 0
- **Completion Rate:** 100%

## Playbook Status

### ✅ Completed

| Playbook | Status | Version | Last Updated | Notes |
|-----------|--------|---------|--------------|-------|
| `agentic-integrity-playbook.md` | ✅ Completed | 1.0 | 2026-03-21 | Cleaned up redundant headers and TOC entries |
| `agentic-retrofit.md` | ✅ Completed | 1.0 | 2026-03-21 | Cleaned up duplicate Purpose/TOC entries |
| `agentic-sdlc.md` | ✅ Completed | 1.0 | 2026-03-21 | Applied loading process pattern |
| `ai-friendly-code-patterns.md` | ✅ Completed | 1.0 | 2026-03-21 | Applied loading process pattern |
| `biome-standards.md` | ✅ Completed | 1.0 | 2026-03-21 | Applied loading process pattern |
| `cli-design-playbook.md` | ✅ Completed | 1.0 | 2026-03-21 | Applied loading process pattern |
| `design-heuristics.md` | ✅ Completed | 1.0 | 2026-03-21 | Applied loading process pattern |
| `edinburgh-protocol.md` | ✅ Completed | 1.0 | 2026-03-21 | Applied loading process pattern |
| `fabric-agent-playbook.md` | ✅ Completed | 1.0 | 2026-03-21 | Applied loading process pattern |
| `fabric-user-playbook.md` | ✅ Completed | 1.0 | 2026-03-21 | Applied loading process pattern |
| `git-workflow-playbook.md` | ✅ Completed | 1.0 | 2026-03-21 | Applied loading process pattern |
| `just-bash.md` | ✅ Completed | 1.0 | 2026-03-21 | Applied loading process pattern |
| `loading-process-playbook.md` | ✅ Completed | 1.0 | 2026-03-21 | Template playbook, cleaned up internal documentation |
| `local-memory-agents.md` | ✅ Completed | 1.0 | 2026-03-21 | Applied loading process pattern |
| `mastra-agent-playbook.md` | ✅ Completed | 1.0 | 2026-03-21 | Applied loading process pattern |
| `nushell-agent-playbook.md` | ✅ Completed | 1.0 | 2026-03-21 | Applied loading process pattern |
| `nushell-user-playbook.md` | ✅ Completed | 1.0 | 2026-03-21 | Applied loading process pattern |
| `origami-protocol.md` | ✅ Completed | 1.0 | 2026-03-21 | Applied loading process pattern |
| `secure-tool-design.md` | ✅ Completed | 1.0 | 2026-03-21 | Applied loading process pattern |
| `sidecar-agent-playbook.md` | ✅ Completed | 1.0 | 2026-03-21 | Applied loading process pattern |
| `sidecar-user-playbook.md` | ✅ Completed | 1.0 | 2026-03-21 | Applied loading process pattern |
| `td-agent-playbook.md` | ✅ Completed | 1.0 | 2026-03-21 | Applied loading process pattern |
| `td-skill-playbook.md` | ✅ Completed | 1.0 | 2026-03-21 | Applied loading process pattern |
| `td-user-playbook.md` | ✅ Completed | 1.0 | 2026-03-21 | Applied loading process pattern |
| `typescript-standards.md` | ✅ Completed | 1.0 | 2026-03-21 | Applied loading process pattern |
| `vercel-playbook.md` | ✅ Completed | 1.0 | 2026-03-21 | Applied loading process pattern |
| `visual-palette.md` | ✅ Completed | 1.0 | 2026-03-21 | Applied loading process pattern |

### 🔄 In Progress

| Playbook | Status | Version | Last Updated | Notes |
|-----------|--------|---------|--------------|-------|
| *(none)* | - | - | - | - |

### ⏳ Not Started

| Playbook | Status | Priority | Estimated Effort | Notes |
|-----------|--------|----------|-----------------|-------|
| *(none)* | - | - | - | - |

## Implementation Checklist

For each playbook, complete the following checklist:

### Phase 1: Frontmatter
- [x] Add YAML frontmatter with required fields
- [x] Include: date, tags, version, last_updated
- [x] Add optional fields: agent, environment, status

### Phase 2: Structure
- [x] Add or update Purpose section
- [x] Create or update Table of Contents
- [x] Add Loading Process section (centralized in `LOADING_PROCESS.md`)
- [x] Ensure all `##` headings have TOC entries

### Phase 3: Content
- [x] Review section structure for self-contained sections
- [x] Ensure each section can be read independently
- [x] Check heading hierarchy (no skipped levels)
- [x] Add examples where appropriate

### Phase 4: Testing
- [x] Test section extraction using `ast-grep`
- [x] Verify TOC links work
- [x] Validate frontmatter YAML syntax
- [x] Ensure playbook is readable in isolation

### Phase 5: Documentation
- [x] Update cross-references between playbooks
- [x] Update this tracker with completion status
- [x] Create debrief if significant changes made

## Progress Timeline

### Week 1 (2026-03-21 to 2026-03-27)
- [x] Initial Inventory and Assessment
- [x] Bulk application of Loading Process pattern to all 27 playbooks
- [x] Centralization of loading instructions in `LOADING_PROCESS.md`
- [x] Removal of redundant per-playbook loading sections
- [x] TOC Cleanup for all playbooks
- [x] Verification of extraction logic

## Issues and Blockers

### Resolved Issues
- **Redundant Headers**: Identified and removed multiple `## Purpose` and duplicate TOC entries in several playbooks (PB-001, PB-002, PB-013).
- **Centralization**: Successfully moved all specific "How to load" instructions from playbooks to a single root-level `LOADING_PROCESS.md` file.

## Notes

### 2026-03-21
- Created tracking document.
- Completed all 27 playbooks in a single session using automated cleanup and manual verification.
- Verified that all playbooks now have a clean Table of Contents and a self-contained Purpose section.
- confirmed that `ast-grep` and `awk` based extraction works across the entire library.

### Template Reference
Use `playbooks/loading-process-playbook.md` as the reference for any new playbooks.

### Extraction Testing
Test extraction for each playbook using:
```bash
ast-grep -p '## Section Name' -A 50 playbooks/playbook-name.md
```

## Related Documentation

- [LOADING_PROCESS.md](../LOADING_PROCESS.md)
- [Loading Process Playbook](../playbooks/loading-process-playbook.md)
- [Apply Loading Process Brief](../briefs/archive/apply-loading-process-to-playbooks.md)

---

**Created:** 2026-03-21  
**Last Updated:** 2026-03-21  
**Maintained by:** Mastra Development Team