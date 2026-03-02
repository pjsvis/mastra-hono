#!/usr/bin/env bash
set -euo pipefail

# cleanup-stale-tasks.sh: Automatically close stale TD tasks

# Configuration
STALE_DAYS=14  # Tasks older than this are considered stale

echo "🧹 TD Stale Task Cleanup"
echo "=============================="
echo ""

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get all tasks as JSON
echo "📋 Fetching task list..."
TASKS_JSON=$(td list --json)

if [ -z "$TASKS_JSON" ]; then
  echo "❌ Error: Failed to fetch tasks from TD"
  echo "   Make sure TD is properly configured"
  exit 1
fi

# Identify stale tasks
echo ""
echo "🔍 Identifying stale tasks..."
echo ""

# Find tasks that are stale:
# - Not in_review status (no PR)
# - Last updated more than STALE_DAYS ago
# - Not already closed
STALE_TASKS=$(echo "$TASKS_JSON" | jq -r "
  .[] |
  select(
    (.status == \"in_progress\" or .status == \"in_review\") and
    (.last_updated | fromdateiso8601 < now - $STALE_DAYS * 86400) and
    (.description | test(\"PR\") | not) and
    (.status != \"closed\")
  ) |
  {id: .id, title: .title, status: .status, last_updated: .last_updated, days_old: ((now - .last_updated | fromdateiso8601) / 86400)}
" | sort_by(.last_updated) | reverse
")

# Count stale tasks
STALE_COUNT=$(echo "$STALE_TASKS" | jq 'length')

if [ "$STALE_COUNT" -eq 0 ]; then
  echo "✅ No stale tasks found"
  echo "   All tasks are actively managed"
  echo ""
  echo "🎉 Workspace is clean!"
  exit 0
fi

# Display stale tasks
echo "Found ${YELLOW}$STALE_COUNT${NC} stale task(s):"
echo ""

echo "$STALE_TASKS" | jq -r "
  .[] |
  map(
    \"\n${RED}❌${NC} Task: \" +
    .title +
    \"\n${YELLOW}   Status: ${NC}\" +
    .status +
    \"\n${YELLOW}   Last updated: ${NC}\" +
    (.last_updated | fromdateiso8601 | strftime(\"%Y-%m-%d %H:%M\")) +
    \"\n${YELLOW}   Days old: ${NC}\" +
    (.days_old | tostring) +
    \"\n\"
  ) |
  add
"

echo ""

# Prompt for confirmation
echo "⚠️  This will close the above tasks"
echo "   Reason: Auto-closed as stale (no activity for ${STALE_DAYS}+ days)"
echo ""

read -p "Continue? [y/N] " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Aborted"
  exit 0
fi

# Close stale tasks
echo ""
echo "🔄 Closing stale tasks..."
echo ""

CLOSED_COUNT=0
FAILED_COUNT=0

echo "$STALE_TASKS" | jq -r '.[].id' | while read -r TASK_ID; do
  # Close the task with reason
  REASON="Auto-closed: Stale (no activity for $STALE_DAYS days, last updated: $(echo "$STALE_TASKS" | jq -r --arg "TASK_ID" '.[] | select(.id == "\"$TASK_ID\"") | .last_updated | fromdateiso8601 | strftime(\"%Y-%m-%d\")))"

  if td close "$TASK_ID" --done "$REASON"; then
    echo "${GREEN}✅${NC} Closed task ${YELLOW}$TASK_ID${NC}"
    CLOSED_COUNT=$((CLOSED_COUNT + 1))
  else
    echo "${RED}❌${NC} Failed to close task ${YELLOW}$TASK_ID${NC}"
    FAILED_COUNT=$((FAILED_COUNT + 1))
  fi
done

echo ""

# Summary
echo "========================================"
echo "📊 Cleanup Summary"
echo "========================================"
echo ""
echo "Total stale tasks: ${YELLOW}$STALE_COUNT${NC}"
echo "Successfully closed: ${GREEN}$CLOSED_COUNT${NC}"
echo "Failed to close:   ${RED}$FAILED_COUNT${NC}"
echo ""

if [ $FAILED_COUNT -eq 0 ]; then
  echo "${GREEN}✅${NC} All stale tasks closed successfully!"
  echo ""
  echo "💡 Tips:"
  echo "   - Tasks without PRs for ${STALE_DAYS} days are considered stale"
  echo "   - Use 'td review' for active work"
  echo "   - Use 'td handoff' to pause work properly"
  exit 0
else
  echo "${YELLOW}⚠️${NC} Some tasks failed to close"
  echo "   Review errors above and try manual closure"
  exit 1
fi
