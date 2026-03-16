#!/usr/bin/env bash
set -euo pipefail

# system-status: Simple TD/PR/Worktree status checker
#
# Usage:
#   bash scripts/system-status.sh              # Human-readable output
#   bash scripts/system-status.sh --json       # JSON output
#   bash scripts/system-status.sh --cleanup    # Show cleanup recommendations

MODE="human"
CLEANUP_MODE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --json)
      MODE="json"
      shift
      ;;
    --cleanup)
      CLEANUP_MODE=true
      shift
      ;;
    -h|--help)
      echo "Usage: system-status [--json] [--cleanup] [--help]"
      echo ""
      echo "Options:"
      echo "  --json     Output as JSON for programmatic use"
      echo "  --cleanup  Show cleanup recommendations"
      echo "  --help     Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# ============================================
# DATA COLLECTION
# ============================================

echo "Collecting system data..." >&2

TASKS=$(td list --json 2>/dev/null || echo "[]")
PRS=$(gh pr list --json --limit 100 2>/dev/null || echo "[]")
WORKTREES=$(git worktree list --porcelain 2>/dev/null || echo "")

# Extract worktree branches (exclude main)
WORKTREE_BRANCHES=$(echo "$WORKTREES" | grep "^branch " | sed 's/^branch //' || true)

echo "Found tasks: $(echo "$TASKS" | wc -l)"
echo "Found PRs: $(echo "$PRS" | wc -l)"
echo "Found worktrees: $(echo "$WORKTREES" | grep "^branch " | wc -l)"
echo "" >&2

# ============================================
# ANALYSIS - Simple string matching
# ============================================

VIOLATIONS=0
ORPHANS=0
VIOLATING_TASKS=""
ORPHAN_PRS=""
ORPHAN_WTS=""

# Check each task for violations
while IFS= read -r task_line; do
  TASK_ID=$(echo "$task_line" | cut -d'|' -f1)
  TASK_TITLE=$(echo "$task_line" | cut -d'|' -f2)
  TASK_STATUS=$(echo "$task_line" | cut -d'|' -f3)
  
  # Check if task has linked worktree
  LINKED_WT=""
  if echo "$WORKTREE_BRANCHES" | grep -q "$TASK_ID"; then
    LINKED_WT=$(echo "$WORKTREE_BRANCHES" | grep "$TASK_ID")
  fi
  
  # Check if task has linked PR
  LINKED_PR=""
  if echo "$PRS" | grep -q "\"$TASK_ID\""; then
    LINKED_PR=$(echo "$PRS" | grep "\"$TASK_ID\"")
  fi
  
  # Check violations based on status
  case "$TASK_STATUS" in
    in_progress)
      # in_progress: MUST have worktree, MUST NOT have PR
      if [ -z "$LINKED_WT" ]; then
        VIOLATIONS=$((VIOLATIONS + 1))
        VIOLATING_TASKS="$VIOLATING_TASKS  • $TASK_ID - Missing worktree"
      fi
      if [ -n "$LINKED_PR" ]; then
        VIOLATIONS=$((VIOLATIONS + 1))
        VIOLATING_TASKS="$VIOLATING_TASKS  • $TASK_ID - Unexpected PR"
      fi
      ;;
    in_review)
      # in_review: MUST have PR, MUST NOT have worktree
      if [ -z "$LINKED_PR" ]; then
        VIOLATIONS=$((VIOLATIONS + 1))
        VIOLATING_TASKS="$VIOLATING_TASKS  • $TASK_ID - Missing PR"
      fi
      if [ -n "$LINKED_WT" ]; then
        VIOLATIONS=$((VIOLATIONS + 1))
        VIOLATING_TASKS="$VIOLATING_TASKS  • $TASK_ID - Worktree exists (should be cleaned)"
      fi
      ;;
    done|closed)
      # done/closed: MUST NOT have PR, MUST NOT have worktree
      if [ -n "$LINKED_PR" ]; then
        VIOLATIONS=$((VIOLATIONS + 1))
        VIOLATING_TASKS="$VIOLATING_TASKS  • $TASK_ID - PR exists for completed task"
      fi
      if [ -n "$LINKED_WT" ]; then
        VIOLATIONS=$((VIOLATIONS + 1))
        VIOLATING_TASKS="$VIOLATING_TASKS  • $TASK_ID - Worktree exists for completed task"
      fi
      ;;
  esac
done < <(echo "$TASKS" | jq -r '.[] | "\(.id) - \(.status) - \(.title)"')

# Check for orphaned PRs (PRs not linked to any task)
echo "Checking for orphaned PRs..." >&2
while IFS= read -r pr_line; do
  PR_NUMBER=$(echo "$pr_line" | cut -d'|' -f1)
  PR_TITLE=$(echo "$pr_line" | cut -d'|' -f2)
  PR_BRANCH=$(echo "$pr_line" | cut -d'|' -f3)
  
  IS_LINKED=false
  # Check if PR is linked to any task
  while IFS= read -r task_line; do
    CURRENT_TASK_ID=$(echo "$task_line" | cut -d'|' -f1)
    if echo "$pr_line" | grep -q "\"$CURRENT_TASK_ID\""; then
      IS_LINKED=true
      break
    fi
  done < <(echo "$TASKS" | jq -r '.[] | "\(.id)"')
  
  if [ "$IS_LINKED" = false ] && [ -n "$PR_NUMBER" ]; then
    ORPHANS=$((ORPHANS + 1))
    ORPHAN_PRS="$ORPHAN_PRS  • PR #$PR_NUMBER"
  fi
done < <(echo "$PRS" | jq -r '.[] | "\(.number) - \(.title) - \(.headRefName)"')

# Check for orphaned worktrees (worktrees not linked to any task, exclude main)
echo "Checking for orphaned worktrees..." >&2
while IFS= read -r wt_line; do
  BRANCH=$(echo "$wt_line" | cut -d'|' -f2)
  
  IS_LINKED=false
  # Check if worktree is linked to any task
  while IFS= read -r task_line; do
    CURRENT_TASK_ID=$(echo "$task_line" | cut -d'|' -f1)
    if echo "$wt_line" | grep -q "$CURRENT_TASK_ID"; then
      IS_LINKED=true
      break
    fi
  done < <(echo "$TASKS" | jq -r '.[] | "\(.id)"')
  
  if [ "$IS_LINKED" = false ] && [ -n "$BRANCH" ] && [ "$BRANCH" != "refs/heads/main" ]; then
    ORPHANS=$((ORPHANS + 1))
    ORPHAN_WTS="$ORPHAN_WTS  • $BRANCH"
  fi
done < <(echo "$WORKTREE_BRANCHES" | while IFS= read -r branch; do echo "$branch"; done)

# ============================================
# OUTPUT
# ============================================

if [ "$MODE" = "json" ]; then
  # JSON output
  echo "{"
  echo "  \"summary\": {"
  echo "    \"total_tasks\": $(echo "$TASKS" | jq -e '. | length' 2>/dev/null),"
  echo "    \"total_prs\": $(echo "$PRS" | jq -e '. | length' 2>/dev/null),"
  echo "    \"total_worktrees\": $(echo "$WORKTREE_BRANCHES" | wc -l),"
  echo "    \"violations\": $VIOLATIONS,"
  echo "    \"orphans\": $ORPHANS,"
  echo "    \"overall_state\": \"$(if [ $VIOLATIONS -gt 0 ] || [ $ORPHANS -gt 0 ]; then echo "needs_attention"; else echo "healthy";)\""
  echo "  },"
  echo "  \"tasks\": ["
  echo "    $(echo "$TASKS" | jq -e '. | length' 2>/dev/null)"
  echo "  ],"
  echo "  \"violating_tasks\": \"$VIOLATING_TASKS\","
  echo "  \"orphan_prs\": \"$ORPHAN_PRS\","
  echo "  \"orphan_worktrees\": \"$ORPHAN_WTS\""
  echo "}"
  exit 0
fi

# Human-readable output
OVERALL_STATE="healthy"
if [ $VIOLATIONS -gt 0 ] || [ $ORPHANS -gt 0 ]; then
  OVERALL_STATE="needs_attention"
fi

echo ""
echo "System Status Report"
echo "==================="
echo ""
echo "Total Tasks: $(echo "$TASKS" | jq -e '. | length' 2>/dev/null) | PRs: $(echo "$PRS" | jq -e '. | length' 2>/dev/null) | Worktrees: $(echo "$WORKTREE_BRANCHES" | wc -l)"
echo "Violations: $VIOLATIONS | Orphans: $ORPHANS"
if [ "$OVERALL_STATE" = "healthy" ]; then
  echo "Overall: Healthy"
else
  echo "Overall: Needs Attention"
fi

echo ""
echo "Task Status:"
echo ""

# Display tasks by status
for STATUS in open in_progress in_review done closed; do
  echo ""
  echo "$STATUS:"
  echo "$TASKS" | grep "|$STATUS|" | cut -d'|' -f2 | cut -d'|' -f1 | cut -d'|' -f3 | sed 's/"//g'
  
  # Show violations icon
  if echo "$VIOLATING_TASKS" | grep -q "$STATUS|$TASK_ID"; then
    STATUS_ICON="❌"
  else
    STATUS_ICON="✅"
  fi
  
  while IFS= read -r task_line; do
    CURRENT_TASK_ID=$(echo "$task_line" | cut -d'|' -f1)
    CURRENT_STATUS=$(echo "$task_line" | cut -d'|' -f3)
    
    if [ "$CURRENT_STATUS" != "$STATUS" ]; then
      continue
    fi
    
    TASK_ID=$(echo "$task_line" | cut -d'|' -f1)
    TASK_TITLE=$(echo "$task_line" | cut -d'|' -f2)
    
    echo "  $STATUS_ICON $TASK_ID - $TASK_TITLE"
    
    # Show linked worktree
    if echo "$WORKTREE_BRANCHES" | grep -q "$TASK_ID"; then
      WT_NAME=$(echo "$WORKTREE_BRANCHES" | grep "$TASK_ID" | sed 's/^branch //')
      echo "       🌳 Worktree: $WT_NAME"
    fi
    
    # Show linked PR
    if echo "$PRS" | grep -q "\"$TASK_ID\""; then
      PR_DETAILS=$(echo "$PRS" | grep "\"$TASK_ID\"")
      echo "       📄 PR #$PR_DETAILS"
    fi
    
    # Show violations
    if echo "$VIOLATING_TASKS" | grep -q "$STATUS|$TASK_ID"; then
      if [ "$STATUS" = "in_progress" ]; then
        VIOLATION_MSG=$(echo "$VIOLATING_TASKS" | grep "$STATUS|$TASK_ID" | sed "s/^$STATUS|$TASK_ID //")
        echo "       ⚠️  $VIOLATION_MSG"
      elif [ "$STATUS" = "in_review" ]; then
        VIOLATION_MSG=$(echo "$VIOLATING_TASKS" | grep "$STATUS|$TASK_ID" | sed "s/^$STATUS|$TASK_ID //")
        echo "       ⚠️  $VIOLATION_MSG"
      fi
    fi
  done < <(echo "$TASKS" | jq -r '.[] | "\(.id) - \(.status) - \(.title)"')
done

# State Diagram
echo ""
echo "Workflow State Diagram:"
echo "┌─────────────────────────────────────────────────────┐"
echo "│                                                             │"
echo "│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │"
echo "│  │  open        │───▶│ in_progress  │───▶│  in_review   │  │"
echo "│  │              │    │  + worktree  │    │    + PR      │  │"
echo "│  └──────────────┘    └──────────────┘    └──────┬───────┘  │"
echo "│                                              │           │  │"
echo "│                                              ▼           │  │"
echo "│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │"
echo "│  │   done       │◀───│    merged    │◀───│   approved   │  │"
echo "│  │ (no PR/WT)   │    │    + PR      │    │    + PR      │  │"
echo "│  └──────────────┘    └──────────────┘    └──────────────┘  │"
echo "│                                                             │"
echo "│  🚨 Violations: $VIOLATIONS | Orphans: $ORPHANS                  │"
echo "└─────────────────────────────────────────────────────┘"

# Cleanup Recommendations
if [ "$CLEANUP_MODE" = true ] || [ "$VIOLATIONS -gt 0 ] || [ $ORPHANS -gt 0 ]; then
  echo ""
  echo "Cleanup Recommendations:"
  echo ""
  
  if [ -n "$VIOLATING_TASKS" ]; then
    echo "Task Violations:"
    echo "$VIOLATING_TASKS" | sed 's/^[^|]*|//'
    echo ""
  fi
  
  if [ -n "$ORPHAN_PRS" ]; then
    echo "Orphaned PRs (no linked TD):"
    echo "$ORPHAN_PRS" | sed 's/^  • //'
    echo ""
  fi
  
  if [ -n "$ORPHAN_WTS" ]; then
    echo "Orphaned Worktrees (no linked TD):"
    echo "$ORPHAN_WTS" | sed 's/^  • //'
    echo ""
  fi
  
  echo "Cleanup Commands:"
  echo "  # Create worktrees for in_progress tasks:"
  echo "  td start <task-id> && git worktree add ../<task-id> -b <task-id>"
  echo ""
  echo "  # Create PRs for in_review tasks:"
  echo "  bun run create-pr"
  echo ""
  echo "  # Remove worktrees after PR merge:"
  echo "  git worktree remove <path> && git branch -d <branch-name>"
  echo ""
  echo "  # Close orphaned PRs:"
  echo "  gh pr close <pr-number>"
fi

echo ""

# Exit with error code if violations exist
if [ $VIOLATIONS -gt 0 ] || [ $ORPHANS -gt 0 ]; then
  exit 1
fi

exit 0
