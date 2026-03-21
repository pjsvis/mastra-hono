# Apply Loading Process to All Playbooks

## Objective
Apply the two-step loading process pattern (documented in `playbooks/loading-process-playbook.md`) to all existing playbooks in the project. This will improve documentation discoverability, enable structured section extraction, and create a consistent documentation experience across all playbooks.

## Scope
- Review all existing playbooks in the `playbooks/` directory
- Apply the loading process pattern to each playbook
- Ensure all playbooks have proper frontmatter metadata
- Add or update table of contents for each playbook
- Test section extraction for each playbook

## Implementation Checklist

### Phase 1: Inventory and Assessment

- [ ] List all playbooks in the `playbooks/` directory
- [ ] Identify which playbooks already have the loading process applied
- [ ] Identify which playbooks need the loading process added
- [ ] Document current state of each playbook (metadata, TOC, structure)

### Phase 2: Apply Loading Process Pattern

For each playbook that needs the loading process:

- [ ] Add or update frontmatter metadata with required fields:
  - [ ] `date: YYYY-MM-DD`
  - [ ] `tags: [playbook, ...]`
  - [ ] `version: X.Y`
  - [ ] `last_updated: YYYY-MM-DD`
  - [ ] Optional: `agent`, `environment`, `status`

- [ ] Add or update the Purpose section
- [ ] Create or update Table of Contents with anchor links
- [ ] Add Loading Process section (copy from loading-process-playbook.md)
- [ ] Ensure all major sections have anchor links in TOC
- [ ] Verify all `##` headings have corresponding TOC entries

### Phase 3: Structure and Content Review

For each playbook:

- [ ] Review section structure for self-contained sections
- [ ] Ensure each section can be read independently
- [ ] Check heading hierarchy (no skipped levels)
- [ ] Verify progressive disclosure (general → specific)
- [ ] Add examples where appropriate
- [ ] Update references section if applicable

### Phase 4: Testing and Validation

For each updated playbook:

- [ ] Test section extraction using `ast-grep`:
  ```bash
  ast-grep -p '## Section Name' -A 50 playbooks/playbook-name.md
  ```
- [ ] Verify TOC links work in markdown viewer
- [ ] Check that all sections are extractable
- [ ] Validate frontmatter YAML syntax
- [ ] Ensure playbook is readable in isolation

### Phase 5: Documentation Updates

- [ ] Update this brief with progress
- [ ] Create debrief documenting changes made
- [ ] Update any cross-references between playbooks
- [ ] Update project README if it references playbook structure

## Acceptance Criteria

- [ ] All playbooks have frontmatter with required fields
- [ ] All playbooks have a Table of Contents
- [ ] All playbooks include the Loading Process section
- [ ] All major sections have anchor links in TOC
- [ ] All sections are self-contained and independently readable
- [ ] Section extraction works for all playbooks using `ast-grep`
- [ ] No broken links or references
- [ ] Consistent formatting across all playbooks

## Deliverables

1. Updated playbooks with loading process applied
2. Debrief documenting changes made
3. Test results showing successful section extraction
4. Updated brief with completion status

## Estimated Effort

- **Phase 1:** 30 minutes (inventory and assessment)
- **Phase 2:** 2-3 hours (apply pattern to each playbook)
- **Phase 3:** 1-2 hours (structure and content review)
- **Phase 4:** 1 hour (testing and validation)
- **Phase 5:** 30 minutes (documentation updates)

**Total Estimated Time:** 5-7 hours

## Dependencies

- `loading-process-playbook.md` must be finalized before starting
- `ast-grep` tool must be installed for testing
- All playbooks must be accessible in the `playbooks/` directory

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Playbooks have inconsistent structure | Medium | Medium | Document current state first, handle inconsistencies individually |
| Section extraction fails for some playbooks | Low | Low | Test extraction early, adjust structure if needed |
| Frontmatter syntax errors | Low | Low | Validate YAML syntax before committing |
| Broken links between playbooks | Medium | Low | Update cross-references after all playbooks are updated |

## Next Steps

1. Run Phase 1 to inventory all playbooks
2. Create a tracking document for progress
3. Begin Phase 2 with the first playbook
4. Test extraction after each playbook update
5. Complete remaining phases sequentially

## Related Documentation

- [Loading Process Playbook](./loading-process-playbook.md)
- [Nushell User Playbook](./nushell-user-playbook.md)
- [Git Workflow Playbook](./git-workflow-playbook.md)

---

**Status:** Not Started  
**Created:** 2026-03-21  
**Last Updated:** 2026-03-21