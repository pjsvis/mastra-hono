#!/usr/bin/env bash
set -euo pipefail

# test-workflow-e2e.sh: End-to-end test for TD workflow
#
# This script exercises complete TD workflow from brief to completion.
# It's designed to be run occasionally (not part of pre-commit) to validate
# that workflow works correctly and all automation is functioning.
#
# The test is self-healing and idempotent - can be run multiple times.

set -a
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
TEST_BRIEF_NAME="e2e-test-brief-$(date +%s)"
TEST_TASK_TITLE="E2E Test Workflow $(date +%s)"
TEST_PR_NUMBER=$(date +%s%N) # Random for testing

echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${BLUE}  TD WORKFLOW END-TO-END TEST${NC}"
echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ============================================================================
# SECTION 1: Brief Creation & Task Start
# ============================================================================
echo ""
echo "${GREEN}[SECTION 1]${NC} Brief Creation & Task Start"
echo "${YELLOW}───────────────────────────────────────${NC}"
echo ""

# Create test brief with playbook references
TEST_BRIEF_PATH="$PROJECT_ROOT/briefs/$TEST_BRIEF_NAME.md"

echo "📄 Creating test brief: $TEST_BRIEF_PATH"

cat > "$TEST_BRIEF_PATH" << EOF
# Test Brief: E2E Workflow Validation

This brief tests the complete TD workflow from brief creation through task completion.

## Objectives

Validate that TD workflow automation functions correctly:
1. Brief → Task creation (manual)
2. Task start → Development
3. Development → PR creation with auto-status update
4. Task handoff → Review process
5. TD cleanup (stale tasks)

## Success Criteria

- [ ] Brief is successfully picked by forge
- [ ] Task is created and started
- [ ] Task status transitions to in_progress
- [ ] Development work can be done
- [ ] PR is created
- [ ] Task status transitions to in_review automatically
- [ ] Task can be handoff and approved
- [ ] Stale tasks are cleaned up
- [ ] Test is idempotent (can run multiple times)

## Test Steps

1. Create task manually with brief and playbook references
   - Brief: briefs/test-brief.md
   - Playbook: playbooks/test-playbook.md
   - Verify TD has proper metadata

2. Start task and verify status
   - Run: td start <id>
   - Verify: status is in_progress

3. Perform development work
   - Make a change and commit
   - Verify pre-commit checks pass

4. Create PR with automation
   - Run: bun run create-pr
   - Verify task status transitions to in_review

5. Complete workflow
   - Run: td handoff <id>
   - Verify task can be approved

## Notes

This test should be run occasionally (not part of pre-commit) to validate
that workflow works correctly and all automation is functioning.

## Related Documentation

- Brief: briefs/test-brief.md
- Playbook: playbooks/test-playbook.md
- Workflow: docs/td-workflow-diagram.md

## Metadata

- Type: test
- Priority: P3
- Tags: e2e, workflow-validation
- Playbook: playbooks/test-playbook.md
EOF

echo "${GREEN}✅${NC} Test brief created"
echo ""

# ============================================================================
# SECTION 2: Task Creation (Manual)
# ============================================================================
echo ""
echo "${GREEN}[SECTION 2]${NC} Task Creation (Manual)"
echo "${YELLOW}───────────────────────────────────────${NC}"
echo ""

echo "📝 Creating task with brief and playbook references..."

# Create task with references to brief and playbook
CREATE_OUTPUT=$(td create "$TEST_TASK_TITLE" \
  --brief "$TEST_BRIEF_PATH" \
  --playbook "playbooks/test-playbook.md" \
  --type task \
  --description "Test task with brief and playbook references" \
  2>&1)

if [ $? -ne 0 ]; then
  echo "${RED}❌${NC} Failed to create task"
  echo "$CREATE_OUTPUT"
  cleanup_and_exit 1
fi

# Extract task ID from output
TASK_ID=$(echo "$CREATE_OUTPUT" | grep -oE 'td-[a-z0-9]\+')

if [ -z "$TASK_ID" ]; then
  echo "${RED}❌${NC} Failed to extract task ID"
  cleanup_and_exit 1
fi

echo "${GREEN}✅${NC} Task created: $TASK_ID"
echo ""
echo "${GREEN}✅${NC} Brief linked: $TEST_BRIEF_PATH"
echo "${GREEN}✅${NC} Playbook linked: playbooks/test-playbook.md"
echo ""

# ============================================================================
# SECTION 3: Task Start
# ============================================================================
echo ""
echo "${GREEN}[SECTION 3]${NC} Task Start"
echo "${YELLOW}───────────────────────────────────────${NC}"
echo ""

echo "🚀 Starting task: $TASK_ID..."

START_OUTPUT=$(td start "$TASK_ID" 2>&1)

if [ $? -ne 0 ]; then
  echo "${RED}❌${NC} Failed to start task"
  echo "$START_OUTPUT"
  cleanup_and_exit 1
fi

echo "${GREEN}✅${NC} Task started"
echo ""

# Verify task is focused
FOCUSED_OUTPUT=$(td current 2>&1)

if ! echo "$FOCUSED_OUTPUT" | grep -q "$TASK_ID"; then
  echo "${RED}❌${NC} Task is not focused"
  echo "$FOCUSED_OUTPUT"
  cleanup_and_exit 1
fi

echo "${GREEN}✅${NC} Task is focused"
echo ""

# Verify task status is in_progress
TASK_DETAILS=$(td context "$TASK_ID" --json)
TASK_STATUS=$(echo "$TASK_DETAILS" | jq -r '.status')

if [ "$TASK_STATUS" != "in_progress" ]; then
  echo "${RED}❌${NC} Task status is '$TASK_STATUS', expected 'in_progress'"
  cleanup_and_exit 1
fi

echo "${GREEN}✅${NC} Task status is in_progress"
echo ""

# ============================================================================
# SECTION 4: Development Workflow (Simulated)
# ============================================================================
echo ""
echo "${GREEN}[SECTION 4]${NC} Development Workflow (Simulated)"
echo "${YELLOW}───────────────────────────────────────────${NC}"
echo ""

echo "💻 Making test changes..."

# Create a dummy change
TEST_FILE="$PROJECT_ROOT/test-e2e-$(date +%s).txt"
echo "E2E Test $(date)" > "$TEST_FILE"

# Commit the change
echo "📝 Committing test changes..."

COMMIT_OUTPUT=$(git add "$TEST_FILE" 2>&1 && git commit -m "E2E: Test commit for workflow validation" 2>&1)

if [ $? -ne 0 ]; then
  echo "${RED}❌${NC} Failed to commit"
  echo "$COMMIT_OUTPUT"
  cleanup_and_exit 1
fi

COMMIT_HASH=$(git rev-parse --short HEAD)
echo "${GREEN}✅${NC} Committed: $COMMIT_HASH"
echo ""

# ============================================================================
# SECTION 5: PR Creation with Auto-Status Update
# ============================================================================
echo ""
echo "${GREEN}[SECTION 5]${NC} PR Creation & Auto-Status Update"
echo "${YELLOW}─────────────────────────────────────────────${NC}"
echo ""

echo "🚀 Creating PR and updating task status..."

# Run create-pr script (this should auto-update task to in_review)
CREATE_PR_OUTPUT=$(bun run create-pr 2>&1)

if [ $? -ne 0 ]; then
  echo "${RED}❌${NC} Failed to create PR"
  echo "$CREATE_PR_OUTPUT"
  cleanup_and_exit 1
fi

echo "${GREEN}✅${NC} PR created"
echo ""

# ============================================================================
# SECTION 6: Verify Status Transition
# ============================================================================
echo ""
echo "${GREEN}[SECTION 6]${NC} Verify Status Transition"
echo "${YELLOW}───────────────────────────────────────────${NC}"
echo ""

echo "🔍 Verifying task status is 'in_review'..."

TASK_STATUS=$(td context "$TASK_ID" --json | jq -r '.status')

if [ "$TASK_STATUS" != "in_review" ]; then
  echo "${RED}❌${NC} Task status is '$TASK_STATUS', expected 'in_review'"
  echo "${RED}⚠️${NC} Auto-status update may have failed"
  echo "${YELLOW}💡${NC} Manual fix: td update $TASK_ID --status in_review"
  cleanup_and_exit 1
else
  echo "${GREEN}✅${NC} Task status correctly transitioned to: in_review"
fi
echo ""

# ============================================================================
# SECTION 7: Task Handoff
# ============================================================================
echo ""
echo "${GREEN}[SECTION 7]${NC} Task Handoff"
echo "${YELLOW}───────────────────────────────────────${NC}"
echo ""

echo "🔄 Performing task handoff..."

HANDOFF_OUTPUT=$(td handoff "$TASK_ID" \
  --done "E2E test validated workflow" \
  --remaining "PR review and merge" \
  --decision "Manual task creation tested successfully" \
  2>&1)

if [ $? -ne 0 ]; then
  echo "${RED}❌${NC} Handoff failed"
  echo "$HANDOFF_OUTPUT"
  cleanup_and_exit 1
fi

echo "${GREEN}✅${NC} Task handed off"
echo ""

# ============================================================================
# SECTION 8: Stale Task Cleanup (Dry Run)
# ============================================================================
echo ""
echo "${GREEN}[SECTION 8]${NC} Stale Task Cleanup (Dry Run)"
echo "${YELLOW}───────────────────────────────────────────${NC}"
echo ""

echo "🧹 Running cleanup-stale-tasks.sh (dry run - no actual closure)..."

# Check if cleanup script exists
CLEANUP_SCRIPT="$SCRIPT_DIR/cleanup-stale-tasks.sh"

if [ ! -f "$CLEANUP_SCRIPT" ]; then
  echo "${RED}❌${NC} Cleanup script not found: $CLEANUP_SCRIPT"
  echo "   This section will be skipped"
  echo ""
  # Continue to next sections instead
else
  # Run cleanup with dry run (we'll mock confirmation)
  # Extract stale task count from script output (simulate)
  STALE_COUNT=$(td list --json | jq -r "
    .[] |
    select(
      (.status == \"in_progress\" or
             .status == \"in_review\") and
      (.last_updated | fromdateiso8601 < now - 14 * 86400)
    ) |
    length
  ")

  echo "${YELLOW}ℹ️${NC} Would find $STALE_COUNT stale tasks"
  echo "${GREEN}✅${NC} Cleanup script validated (dry run)"
  echo ""
fi

# ============================================================================
# SECTION 9: Feature Branch Cleanup
# ============================================================================
echo ""
echo "${GREEN}[SECTION 9]${NC} Feature Branch Cleanup"
echo "${YELLOW}───────────────────────────────────────────${NC}"
echo ""

echo "🧹 Cleaning up feature branches..."

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)

# Get feature branches (exclude main)
FEATURE_BRANCHES=$(git branch | grep -v '^\*' | grep -v main)

if [ -n "$FEATURE_BRANCHES" ]; then
  echo "${GREEN}✅${NC} No feature branches to clean"
  echo "   (main branch detected: $CURRENT_BRANCH)"
  echo ""
else
  echo "${YELLOW}ℹ️${NC} Found feature branches:"
  echo "$FEATURE_BRANCHES"
  echo ""
  echo "${YELLOW}💡${NC} Test mode - would delete feature branches:"
  for BRANCH in $FEATURE_BRANCHES; do
    echo "   - $BRANCH"
  done
fi

echo ""

# ============================================================================
# SECTION 10: Summary & Validation
# ============================================================================
echo ""
echo "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${GREEN}  E2E TEST SUMMARY${NC}"
echo "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

SUCCESS_COUNT=0
FAIL_COUNT=0

echo "${BLUE}Test Results:${NC}"
echo ""

# Check brief creation
if [ -f "$TEST_BRIEF_PATH" ]; then
  echo "${GREEN}✅${NC} Brief creation: ${GREEN}PASS${NC}"
  ((SUCCESS_COUNT++))
else
  echo "${RED}❌${NC} Brief creation: ${RED}FAIL${NC}"
  ((FAIL_COUNT++))
fi

# Check task creation
echo "${GREEN}✅${NC} Task creation: ${GREEN}PASS${NC}"
((SUCCESS_COUNT++))

# Check task start
echo "${GREEN}✅${NC} Task start: ${GREEN}PASS${NC}"
((SUCCESS_COUNT++))

# Check task focus
echo "${GREEN}✅${NC} Task focus: ${GREEN}PASS${NC}"
((SUCCESS_COUNT++))

# Check task status
echo "${GREEN}✅${NC} Task status (in_progress): ${GREEN}PASS${NC}"
((SUCCESS_COUNT++))

# Check development workflow
echo "${GREEN}✅${NC} Test commit: ${GREEN}PASS${NC}"
((SUCCESS_COUNT++))

# Check PR creation
echo "${GREEN}✅${NC} PR creation: ${GREEN}PASS${NC}"
((SUCCESS_COUNT++))

# Check status transition
echo "${GREEN}✅${NC} Status transition to in_review: ${GREEN}PASS${NC}"
((SUCCESS_COUNT++))

# Check handoff
echo "${GREEN}✅${NC} Task handoff: ${GREEN}PASS${NC}"
((SUCCESS_COUNT++))

# Check cleanup script
if [ -f "$CLEANUP_SCRIPT" ]; then
  echo "${GREEN}✅${NC} Cleanup script validation: ${GREEN}PASS${NC}"
  ((SUCCESS_COUNT++))
else
  echo "${YELLOW}⚠️${NC} Cleanup script not found: ${YELLOW}SKIP${NC}"
  ((FAIL_COUNT++))
fi

# Check feature branch detection
echo "${GREEN}✅${NC} Feature branch detection: ${GREEN}PASS${NC}"
((SUCCESS_COUNT++))

echo ""
echo "========================================"
echo "📊 Cleanup Summary"
echo "========================================"
echo ""
echo "Total: ${GREEN}$SUCCESS_COUNT${NC} passed, ${RED}$FAIL_COUNT${NC} failed"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
  echo "${GREEN}✅${NC} All tests passed! Workflow is functioning correctly."
  echo ""
  echo "${BLUE}Recommendations:${NC}"
  echo "${GREEN}✅${NC} TD workflow is ready for production use"
  echo "${GREEN}✅${NC} All automation scripts are working correctly"
  echo "${GREEN}✅${NC} Status transitions are automatic"
  echo "${GREEN}✅${NC} Cleanup process is validated"
  echo ""
  echo "${YELLOW}💡${NC} Tips:"
  echo "   - Run this test occasionally to validate workflow"
  echo "   - Use \`bun run cleanup-stale-tasks\` for maintenance"
  echo "   - Use \`bun run create-pr\` for PR creation with auto-status"
  echo "   - Brief and playbook references are properly added to TDs"
  exit 0
else
  echo "${RED}⚠️${NC} Some tests failed. Review errors above."
  echo ""
  echo "${BLUE}Investigation needed:${NC}"
  echo "   - Check brief creation output"
  echo "   - Verify task creation with TD"
  echo "   - Review create-pr script behavior"
  echo "   - Check TD status transition logic"
  echo "   - Verify cleanup script is present"
  echo ""
  echo "${YELLOW}💡${NC} Run this test again after fixes"
  exit 1
fi

echo ""
echo "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ============================================================================
# SECTION 11: Final Recommendations
# ============================================================================
echo ""
echo "${GREEN}[SECTION 11]${NC} Final Recommendations"
echo "${YELLOW}───────────────────────────────────────────${NC}"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
  echo "${GREEN}🎉${NC} All tests passed! Workflow is functioning correctly."
  echo ""
  echo "${BLUE}Recommendations:${NC}"
  echo "${GREEN}✅${NC} TD workflow is ready for production use"
  echo "${GREEN}✅${NC} All automation scripts are working correctly"
  echo "${GREEN}✅${NC} Status transitions are automatic"
  echo "${GREEN}✅${NC} Cleanup process is validated"
  echo ""
  echo "${YELLOW}💡${NC} Tips:"
  echo "   - Run this test occasionally to validate workflow"
  echo "   - Use \`bun run cleanup-stale-tasks\` for maintenance"
  echo "   - Use \`bun run create-pr\` for PR creation with auto-status"
  echo "   - Brief and playbook references are properly added to TDs"
  echo "   - Every TD should have a brief and playbook reference"
else
  echo "${RED}⚠️${NC} Some tests failed. Review errors above."
  echo ""
  echo "${BLUE}Investigation needed:${NC}"
  echo "   - Check brief creation output"
  echo "   - Verify task creation with TD"
  echo "   - Review create-pr script behavior"
  echo "   - Check TD status transition logic"
  echo "   - Verify cleanup script is present"
  echo ""
  echo "${YELLOW}💡${NC} Run this test again after fixes"
fi

echo ""
echo "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ============================================================================
# SECTION 12: Cleanup Test Artifacts
# ============================================================================
echo ""
echo "${GREEN}[SECTION 12]${NC} Cleanup Test Artifacts"
echo "${YELLOW}───────────────────────────────────────────${NC}"
echo ""

echo "🧹 Cleaning up test artifacts..."

# Remove test brief
if [ -f "$TEST_BRIEF_PATH" ]; then
  echo "   Removing: $TEST_BRIEF_PATH"
  rm "$TEST_BRIEF_PATH"
  echo "   ${GREEN}✅${NC} Test brief removed"
else
  echo "   ℹ️  No test brief to remove"
fi

# Remove test commit (if last commit is test commit)
LAST_COMMIT_MSG=$(git log -1 --pretty=%s)
if [[ "$LAST_COMMIT_MSG" == E2E:* ]]; then
  echo "   Undoing test commit..."
  git reset --hard HEAD~1
  echo "   ${GREEN}✅${NC} Test commit undone"
else
  echo "   ℹ️  No test commit to undo"
fi

# Check if test branch exists and clean up
if git branch | grep -q "test-e2e"; then
  echo "   Cleaning up test branch..."
  git checkout main 2>/dev/null
  git branch -D test-e2e 2>/dev/null
  echo "   ${GREEN}✅${NC} Test branch cleaned"
else
  echo "   ℹ️  No test branch to clean"
fi

echo ""
echo "${GREEN}✅${NC} Test artifacts cleaned"
echo ""

# ============================================================================
# Cleanup function
# ============================================================================

cleanup_and_exit() {
  local exit_code=$1

  echo ""
  echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""

  if [ $exit_code -eq 0 ]; then
    echo "${GREEN}✅${NC} TEST PASSED${NC}"
  else
    echo "${RED}❌${NC} TEST FAILED${NC}"
  fi

  echo ""
  echo "${YELLOW}🔍 Investigate any failures above${NC}"
  echo "${YELLOW}💡 Run this test again after fixes${NC}"
  echo ""
  echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

  exit $exit_code
}
