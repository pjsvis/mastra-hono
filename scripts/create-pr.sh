#!/usr/bin/env bash
set -euo pipefail

# create-pr.sh: Create PR and automatically update TD tasks to in_review

# Check if we're in a workspace mode
if td ws current --json >/dev/null 2>&1; then
  # We're in workspace mode - multiple related tasks
  echo "📋 Workspace mode detected"

  # Get all tasks in workspace
  WS_TASKS=$(td ws current --json | jq -r '.tasks[] | map(.id) | @csv' | tr ',' ' ')

  if [ -z "$WS_TASKS" ]; then
    echo "ℹ️  No workspace tasks found"
    exit 0
  fi

  # Update all workspace tasks that are in_progress
  UPDATED_COUNT=0
  for TASK_ID in $WS_TASKS; do
    TASK_STATUS=$(td context "$TASK_ID" --json | jq -r '.status')

    if [ "$TASK_STATUS" == "in_progress" ]; then
      echo "🔄 Updating workspace task $TASK_ID to in_review..."
      td update "$TASK_ID" --status in_review

      if [ $? -eq 0 ]; then
        UPDATED_COUNT=$((UPDATED_COUNT + 1))
      else
        echo "❌ Failed to update $TASK_ID"
      fi
    fi
  done

  if [ $UPDATED_COUNT -gt 0 ]; then
    echo "✅ Updated $UPDATED_COUNT workspace tasks to in_review"
  fi

  exit 0
fi

# Regular mode - single task
echo "📋 Regular mode detected"

# Create PR and get PR information
echo "🚀 Creating PR..."
PR_OUTPUT=$(gh pr create --json 2>&1)

if [ $? -ne 0 ]; then
  echo "❌ Failed to create PR"
  echo "$PR_OUTPUT"
  exit 1
fi

# Extract PR information
PR_NUMBER=$(echo "$PR_OUTPUT" | jq -r '.number')
PR_URL=$(echo "$PR_OUTPUT" | jq -r '.url')
PR_TITLE=$(echo "$PR_OUTPUT" | jq -r '.title')

if [ -z "$PR_NUMBER" ] || [ -z "$PR_URL" ]; then
  echo "❌ Failed to parse PR information"
  exit 1
fi

echo "✅ PR #$PR_NUMBER created: $PR_TITLE"
echo "📋 URL: $PR_URL"

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"

# Get currently focused task
FOCUSED_TASK=$(td current --json | jq -r '.id // empty')

if [ -z "$FOCUSED_TASK" ]; then
  echo "ℹ️  No currently focused task found"
  echo "Skipping TD status update"
  exit 0
fi

echo "📋 Currently focused task: $FOCUSED_TASK"

# Get task details
TASK_DETAILS=$(td context "$FOCUSED_TASK" --json)
TASK_STATUS=$(echo "$TASK_DETAILS" | jq -r '.status')

echo "Current task status: $TASK_STATUS"

# Only update if in_progress
if [ "$TASK_STATUS" != "in_progress" ]; then
  echo "ℹ️  Task is not in_progress (status: $TASK_STATUS)"
  echo "Skipping status update to in_review"
  exit 0
fi

# Update task to in_review
echo "🔄 Updating task to in_review status..."
td update "$FOCUSED_TASK" --status in_review

if [ $? -eq 0 ]; then
  echo "✅ Successfully updated $FOCUSED_TASK to in_review"
else
  echo "❌ Failed to update $FOCUSED_TASK"
  exit 1
fi

echo ""
echo "✅ Complete!"
echo "PR #$PR_NUMBER is ready for review"
echo "Task $FOCUSED_TASK is in in_review status"
echo "📋 PR URL: $PR_URL"
