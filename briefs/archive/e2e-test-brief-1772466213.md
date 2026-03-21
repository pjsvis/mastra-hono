# Manual Workflow Test Brief

This brief tests the complete TD workflow from brief creation through task completion.

## Objectives

Validate that TD workflow automation functions correctly:
1. Brief → Task creation (manual)
2. Task start → Development
3. Development → PR creation with status update
4. Task handoff → Review process
5. Task approval → Complete

## Success Criteria

- [ ] Brief is successfully created manually
- [ ] Task is created and started
- [ ] Development work can be done
- [ ] PR is created
- [ ] Task status transitions to in_review automatically
- [ ] Task can be handoff and approved
- [ ] Task is completed and closed
- [ ] Feature branches are cleaned up
- [ ] Test is idempotent (can run multiple times)

## Test Steps

1. Create brief manually (this step)
2. Create task manually using td create
3. Start task and verify status is in_progress
4. Make a dummy change and commit
5. Create PR using gh pr create
6. Verify task status transitions to in_review
7. Complete workflow with handoff and approval
8. Cleanup test artifacts

## Notes

- This test is manual and doesn't use forge script
- All commands are explicit and testable
- Workflow is end-to-end and self-healing
- Can be run occasionally to validate workflow
