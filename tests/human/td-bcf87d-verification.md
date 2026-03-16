# Test Plan: TD Workflow E2E Validation

**Task ID:** td-bcf87d
**Brief:** briefs/e2e-test-brief-1772459719.md
**Status:** Ready for Verification

## Overview

This test plan validates the complete TD workflow from brief creation through task completion, following the manual workflow (forge script has been removed).

## Changes Made

### 1. Removed Forge Script
- ✅ Removed `scripts/forge.sh` (already deleted)
- ✅ Removed `"forge": "bash scripts/forge.sh"` from package.json
- ✅ Updated AGENTS.md to remove "The Forge Lifecycle" section
- ✅ Replaced with "The Manual Task Lifecycle" section

### 2. Simplified E2E Test
- ✅ Reduced `scripts/test-workflow-e2e.sh` from 583 to ~300 lines
- ✅ Removed non-essential sections:
  - Stale Task Cleanup (Dry Run)
  - Feature Branch Cleanup
  - Final Recommendations (redundant)
- ✅ Added automatic cleanup via trap on exit
- ✅ Added GitHub CLI authentication check
- ✅ Streamlined success/failure counting

### 3. Updated Documentation
- ✅ Updated AGENTS.md to reflect manual workflow
- ✅ Updated briefs to remove forge references
- ✅ Updated success criteria to match manual workflow

## Test Sections

### Section 1: Brief Creation
**Objective:** Verify that test briefs can be created successfully

**Steps:**
1. Run: `bash scripts/test-workflow-e2e.sh`
2. Observe: Brief creation succeeds
3. Verify: Brief file is created in `briefs/` directory

**Expected Result:**
```
✅ Brief created: /path/to/briefs/e2e-test-brief-<timestamp>.md
```

### Section 2: Task Creation (Manual)
**Objective:** Verify that tasks can be manually created with brief and playbook references

**Steps:**
1. Observe: Task creation output
2. Verify: Task ID is extracted successfully
3. Verify: Brief and playbook are linked

**Expected Result:**
```
✅ Task created: td-<id>
✅ Brief linked: <path-to-brief>
```

### Section 3: Task Start
**Objective:** Verify that tasks can be started and set to in_progress status

**Steps:**
1. Observe: Task start output
2. Verify: Task is focused with `td current`
3. Verify: Task status is in_progress

**Expected Result:**
```
✅ Task started
✅ Task is focused
✅ Task status is in_progress
```

### Section 4: Development Workflow
**Objective:** Verify that test changes can be committed

**Steps:**
1. Observe: Commit creation
2. Verify: Commit hash is displayed

**Expected Result:**
```
✅ Committed: <hash>
```

### Section 5: PR Creation
**Objective:** Verify that PR can be created and task status updates automatically

**Steps:**
1. Observe: PR creation output
2. Verify: Task status transitions to in_review

**Expected Result:**
```
✅ PR created
✅ Task status correctly transitioned to: in_review
```

### Section 6: Status Transition
**Objective:** Verify automatic status transition to in_review

**Steps:**
1. Check: Task status after PR creation
2. Verify: Status is in_review

**Expected Result:**
```
✅ Task status correctly transitioned to: in_review
```

### Section 7: Task Handoff
**Objective:** Verify that tasks can be handed off with proper flags

**Steps:**
1. Observe: Handoff output
2. Verify: Done, remaining, and decision flags are present

**Expected Result:**
```
✅ Task handed off
```

## Manual Verification Checklist

### Core Workflow
- [ ] Brief can be created successfully
- [ ] Task can be manually created with brief/playbook references
- [ ] Task can be started and set to in_progress
- [ ] Task is focused after starting
- [ ] Test commit can be created
- [ ] PR can be created with `bun run create-pr`
- [ ] Task status automatically updates to in_review
- [ ] Task can be handed off with done/remaining/decision

### Cleanup & Idempotency
- [ ] Test brief is removed after test completion
- [ ] Test commit is undone after test completion
- [ ] Test can be run multiple times without errors

### Documentation
- [ ] AGENTS.md no longer references forge
- [ ] package.json no longer has forge script
- [ ] Briefs use manual workflow language
- [ ] Success criteria match manual workflow

## Test Execution

### Automated Test
Run the complete e2e test:
```bash
bash scripts/test-workflow-e2e.sh
```

**Expected Outcome:**
- All 7 sections pass
- Success count = 8 (brief, task, start, focus, status, commit, pr, handoff)
- Fail count = 0

### Manual Component Test
Test individual workflow steps:
```bash
# 1. Create brief
cat > briefs/manual-test.md << 'EOF'
# Manual Test
Brief for manual workflow test
EOF

# 2. Create task
td create "Manual Test" \
  --brief "briefs/manual-test.md" \
  --playbook "playbooks/test-playbook.md" \
  --type task \
  --description "Manual test"

# 3. Start task
TASK_ID=$(td current --json | jq -r '.id')
td start "$TASK_ID"

# 4. Make commit
echo "test" > test.txt
git add test.txt
git commit -m "Test commit"

# 5. Create PR
bun run create-pr

# 6. Verify status
td context "$TASK_ID" --json | jq -r '.status'

# 7. Handoff
td handoff "$TASK_ID" \
  --done "Manual test complete" \
  --remaining "" \
  --decision "Manual workflow validated"
```

### Cleanup Test
Verify cleanup works correctly:
```bash
# Check if test artifacts exist after test run
ls -la briefs/e2e-test-brief-*.md
ls -la test-e2e-*.txt

# Verify last commit is not a test commit
git log -1 --pretty=%s
```

## Success Criteria

The test is considered successful if:

1. **All automated sections pass** (8/8 successes, 0 failures)
2. **Manual verification checklist is complete** (all items checked)
3. **No test artifacts remain** after test completion
4. **Documentation is updated** and references are correct
5. **Workflow is repeatable** (can run multiple times without errors)

## Known Issues & Limitations

1. **GitHub CLI Required:** PR creation requires `gh` CLI to be authenticated
2. **Test Mode:** If GH CLI is not authenticated, test skips PR creation
3. **No Real Development:** Test simulates development with dummy commits
4. **No PR Merge:** Test does not actually merge the PR (as expected)

## Rollback Plan

If issues are found:

1. **Forge Script:** No rollback needed (forge was already failing)
2. **Documentation:** Revert AGENTS.md to forge lifecycle if needed
3. **Test Script:** Restore original test-workflow-e2e.sh from git
4. **Package.json:** Restore forge script reference if needed

## Sign-off

**Tested By:** _________________
**Date:** _________________
**Result:** [ ] Pass  [ ] Fail  [ ] Partial

**Notes:**
_____________________________________________________________________
_____________________________________________________________________
_____________________________________________________________________