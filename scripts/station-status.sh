#!/usr/bin/env bash
set -euo pipefail

# station-status: Focused task as structured output
#
# Following nushell-agent-playbook.md Everyday Mode patterns:
# - Uses td --json for data extraction
# - Returns structured output for quick status checks
#
# Usage:
#   bash scripts/station-status.sh
#   Or create nu alias: alias station-status = bash scripts/station-status.sh

# Get focused task JSON
FOCUSED_JSON=$(td current --json 2>/dev/null || echo "{}")

# Extract focused issue ID if exists
FOCUSED_ID=$(echo "$FOCUSED_JSON" | nu -c 'get focused.issue? | default ""' 2>/dev/null || echo "")

# Get full task list
TASKS_JSON=$(td list --json 2>/dev/null || echo "[]")

# Filter to focused task and display as table
if [ -n "$FOCUSED_ID" ]; then
  echo "$TASKS_JSON" | nu -c --arg FOCUSED "$FOCUSED_ID" '
    from json
    | where id == $FOCUSED
    | select id title status priority updated_at description?
    | table
  '
else
  echo "No focused task found. Use: td focus <issue-id>"
fi

exit 0
