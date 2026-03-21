# Playbook Loading Process Tracker

## Purpose
This document tracks the progress of applying the **two‑step loading process** pattern to all playbooks in the project. It serves as a central reference for monitoring implementation status, identifying blockers, and ensuring consistency across all documentation.

## Overview

- **Total Playbooks:** 27
- **Completed:** 2
- **In Progress:** 0
- **Not Started:** 25
- **Completion Rate:** 7.4%

## Playbook Status

### ✅ Completed

| Playbook | Status | Version | Last Updated | Notes |
|-----------|--------|---------|--------------|-------|
| `loading-process-playbook.md` | ✅ Completed | 1.0 | 2026-03-21 | Template playbook, already follows pattern |
| `nushell-user-playbook.md` | ✅ Completed | 1.0 | 2026-03-21 | Applied loading process pattern |

### 🔄 In Progress

| Playbook | Status | Version | Last Updated | Notes |
|-----------|--------|---------|--------------|-------|
| *(none)* | - | - | - | - |

### ⏳ Not Started

| Playbook | Status | Priority | Estimated Effort | Notes |
|-----------|--------|----------|-----------------|-------|
| `agentic-integrity-playbook.md` | ⏳ Not Started | Medium | 30 min | Large playbook, needs full pattern |
| `agentic-retrofit.md` | ⏳ Not Started | Medium | 30 min | Medium size, straightforward |
| `agentic-sdlc.md` | ⏳ Not Started | Medium | 30 min | Medium size, straightforward |
| `ai-friendly-code-patterns.md` | ⏳ Not Started | Medium | 30 min | Medium size, straightforward |
| `biome-standards.md` | ⏳ Not Started | Low | 20 min | Small playbook, quick update |
| `cli-design-playbook.md` | ⏳ Not Started | Medium | 30 min | Medium size, straightforward |
| `design-heuristics.md` | ⏳ Not Started | Medium | 30 min | Medium size, straightforward |
| `edinburgh-protocol.md` | ⏳ Not Started | High | 45 min | Large playbook, frequently used |
| `fabric-agent-playbook.md` | ⏳ Not Started | Medium | 30 min | Medium size, straightforward |
| `fabric-user-playbook.md` | ⏳ Not Started | Medium | 30 min | Medium size, straightforward |
| `git-workflow-playbook.md` | ⏳ Not Started | High | 45 min | Large playbook, frequently used |
| `just-bash.md` | ⏳ Not Started | Low | 20 min | Small playbook, quick update |
| `local-memory-agents.md` | ⏳ Not Started | Medium | 30 min | Medium size, straightforward |
| `mastra-agent-playbook.md` | ⏳ Not Started | High | 45 min | Large playbook, frequently used |
| `nushell-agent-playbook.md` | ⏳ Not Started | Medium | 30 min | Medium size, straightforward |
| `origami-protocol.md` | ⏳ Not Started | Medium | 30 min | Medium size, straightforward |
| `portless-playbook.md` | ⏳ Not Started | Low | 20 min | Small playbook, quick update |
| `secure-tool-design.md` | ⏳ Not Started | Medium | 30 min | Medium size, straightforward |
| `sidecar-agent-playbook.md` | ⏳ Not Started | Medium | 30 min | Medium size, straightforward |
| `sidecar-user-playbook.md` | ⏳ Not Started | Medium | 30 min | Medium size, straightforward |
| `td-agent-playbook.md` | ⏳ Not Started | Medium | 30 min | Medium size, straightforward |
| `td-skill-playbook.md` | ⏳ Not Started | Medium | 30 min | Medium size, straightforward |
| `td-user-playbook.md` | ⏳ Not Started | Medium | 30 min | Medium size, straightforward |
| `typescript-standards.md` | ⏳ Not Started | Low | 20 min | Small playbook, quick update |
| `vercel-playbook.md` | ⏳ Not Started | Low | 20 min | Small playbook, quick update |
| `visual-palette.md` | ⏳ Not Started | Low | 20 min | Small playbook, quick update |

## Implementation Checklist

For each playbook, complete the following checklist:

### Phase 1: Frontmatter
- [ ] Add YAML frontmatter with required fields
- [ ] Include: date, tags, version, last_updated
- [ ] Add optional fields: agent, environment, status

### Phase 2: Structure
- [ ] Add or update Purpose section
- [ ] Create or update Table of Contents
- [ ] Add Loading Process section
- [ ] Ensure all `##` headings have TOC entries

### Phase 3: Content
- [ ] Review section structure for self-contained sections
- [ ] Ensure each section can be read independently
- [ ] Check heading hierarchy (no skipped levels)
- [ ] Add examples where appropriate

### Phase 4: Testing
- [ ] Test section extraction using `ast-grep`
- [ ] Verify TOC links work
- [ ] Validate frontmatter YAML syntax
- [ ] Ensure playbook is readable in isolation

### Phase 5: Documentation
- [ ] Update cross-references between playbooks
- [ ] Update this tracker with completion status
- [ ] Create debrief if significant changes made

## Progress Timeline

### Week 1 (2026-03-21 to 2026-03-27)
- [ ] Complete high-priority playbooks (4)
  - [ ] `edinburgh-protocol.md`
  - [ ] `git-workflow-playbook.md`
  - [ ] `mastra-agent-playbook.md`
  - [ ] `nushell-agent-playbook.md`

### Week 2 (2026-03-28 to 2026-04-03)
- [ ] Complete medium-priority playbooks (12)
  - [ ] `agentic-integrity-playbook.md`
  - [ ] `agentic-retrofit.md`
  - [ ] `agentic-sdlc.md`
  - [ ] `ai-friendly-code-patterns.md`
  - [ ] `cli-design-playbook.md`
  - [ ] `design-heuristics.md`
  - [ ] `fabric-agent-playbook.md`
  - [ ] `fabric-user-playbook.md`
  - [ ] `local-memory-agents.md`
  - [ ] `origami-protocol.md`
  - [ ] `secure-tool-design.md`
  - [ ] `sidecar-agent-playbook.md`

### Week 3 (2026-04-04 to 2026-04-10)
- [ ] Complete remaining playbooks (11)
  - [ ] `biome-standards.md`
  - [ ] `just-bash.md`
  - [ ] `nushell-user-playbook.md` (already completed)
  - [ ] `portless-playbook.md`
  - [ ] `sidecar-user-playbook.md`
  - [ ] `td-agent-playbook.md`
  - [ ] `td-skill-playbook.md`
  - [ ] `td-user-playbook.md`
  - [ ] `typescript-standards.md`
  - [ ] `vercel-playbook.md`
  - [ ] `visual-palette.md`

## Issues and Blockers

### Current Issues
- *(none)*

### Resolved Issues
- *(none)*

## Notes

### 2026-03-21
- Created tracking document
- Identified 27 total playbooks
- 2 playbooks already completed (loading-process-playbook.md, nushell-user-playbook.md)
- Prioritized playbooks based on size and usage frequency

### Template Reference
Use `playbooks/loading-process-playbook.md` as the template for all updates.

### Extraction Testing
Test extraction for each playbook using:
```bash
ast-grep -p '## Section Name' -A 50 playbooks/playbook-name.md
```

## Related Documentation

- [Loading Process Playbook](../playbooks/loading-process-playbook.md)
- [Apply Loading Process Brief](../briefs/apply-loading-process-to-playbooks.md)

---

**Created:** 2026-03-21  
**Last Updated:** 2026-03-21  
**Maintained by:** Mastra Development Team