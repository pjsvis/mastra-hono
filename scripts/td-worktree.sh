#!/usr/bin/env bash
set -euo pipefail

# scripts/td-worktree.sh: Automated Task Isolation via Git Worktrees
#
# Implements Phase II (Mentation) of the Merge Queue workflow by ensuring
# physical isolation for each task.

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

usage() {
  echo -e "${BOLD}Usage:${NC} td-worktree [command] [task-id]"
  echo ""
  echo -e "${BOLD}Commands:${NC}"
  echo "  add <id>    Create an isolated worktree for a task"
  echo "  rm <id>     Remove a worktree and its branch"
  echo "  list        List all active task worktrees"
  echo ""
  echo -e "${BOLD}Examples:${NC}"
  echo "  ./scripts/td-worktree.sh add td-123"
  echo "  ./scripts/td-worktree.sh rm td-123"
  exit 1
}

# Ensure we are in the project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

if [ $# -lt 1 ]; then
  # Default behavior: try to 'add' the currently focused task
  COMMAND="add"
  TASK_ID=""
else
  COMMAND=$1
  TASK_ID="${2:-}"
fi

case "$COMMAND" in
  add)
    # Resolve Task ID from focused task if not provided
    if [ -z "$TASK_ID" ]; then
      if command -v nu &> /dev/null; then
        TASK_ID=$(nu -c "td current --json | from json | get focused.issue.id? | default ''")
      else
        TASK_ID=$(td current --json | jq -r '.id // empty')
      fi

      if [ -z "$TASK_ID" ]; then
        echo -e "${RED}❌ Error: No task ID provided and no task is currently focused.${NC}"
        usage
      fi
    fi

    WORKTREE_BASE=$(dirname "$PROJECT_ROOT")
    WORKTREE_PATH="$WORKTREE_BASE/$TASK_ID"

    if [ -d "$WORKTREE_PATH" ]; then
      echo -e "${YELLOW}⚠️  Worktree already exists at $WORKTREE_PATH${NC}"
      echo -e "To enter: ${BLUE}cd $WORKTREE_PATH${NC}"
      exit 0
    fi

    echo -e "${BLUE}🏗️  Isolating task $TASK_ID...${NC}"

    # Ensure task is started/focused in td
    td start "$TASK_ID" &> /dev/null || true

    # Create branch if it doesn't exist, otherwise use existing
    if git rev-parse --verify "$TASK_ID" &>/dev/null; then
      echo "Using existing branch: $TASK_ID"
      git worktree add "$WORKTREE_PATH" "$TASK_ID"
    else
      echo "Creating new branch: $TASK_ID"
      git worktree add "$WORKTREE_PATH" -b "$TASK_ID"
    fi

    # Record the worktree creation in td
    td log "CREATED isolated worktree at $WORKTREE_PATH" &> /dev/null || true

    echo -e "\n${GREEN}✅ Success! Task $TASK_ID isolated.${NC}"
    echo "----------------------------------------"
    echo -e "📂 Path: ${YELLOW}$WORKTREE_PATH${NC}"
    echo "----------------------------------------"
    echo "To begin execution:"
    echo -e "${BLUE}cd $WORKTREE_PATH && bun install${NC}"
    ;;

  rm|remove|cleanup)
    if [ -z "$TASK_ID" ]; then
      echo -e "${RED}❌ Error: Task ID required for removal.${NC}"
      exit 1
    fi

    WORKTREE_BASE=$(dirname "$PROJECT_ROOT")
    WORKTREE_PATH="$WORKTREE_BASE/$TASK_ID"

    echo -e "${YELLOW}🧹 Cleaning up worktree for $TASK_ID...${NC}"

    if git worktree list | grep -q "$WORKTREE_PATH"; then
      git worktree remove "$WORKTREE_PATH"
    fi

    if git rev-parse --verify "$TASK_ID" &>/dev/null; then
      echo "Do you want to delete the local branch '$TASK_ID' as well? [y/N] "
      read -n 1 -r
      echo ""
      if [[ $REPLY =~ ^[Yy]$ ]]; then
        git branch -D "$TASK_ID"
      fi
    fi

    echo -e "${GREEN}✅ Cleanup complete.${NC}"
    ;;

  list)
    echo -e "${BLUE}📋 Active Task Worktrees:${NC}"
    git worktree list | grep "td-" || echo "No task worktrees found."
    ;;

  *)
    usage
    ;;
esac
