#!/usr/bin/env bash

# worktree-cleanup.sh - Safely remove merged PR worktrees and branches
#
# Usage:
#   ./scripts/worktree-cleanup.sh              # Show what would be cleaned (dry-run with confirmation)
#   ./scripts/worktree-cleanup.sh --dry-run   # Explicit dry-run
#   ./scripts/worktree-cleanup.sh --execute    # Perform cleanup with safety checks and confirmation
#   ./scripts/worktree-cleanup.sh --force     # Skip safety checks (USE WITH CAUTION)
#
# This script:
# 1. Lists all worktrees (via git worktree list --porcelain)
# 2. Gets branches merged into main
# 3. Identifies worktrees for merged branches (excluding main/master)
# 4. Shows or executes cleanup actions
#
# Protected branches (never deleted): main, master
# Detached worktrees are preserved

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROTECTED_BRANCHES=("main" "master")
DRY_RUN=true
FORCE=false
CONFIRM=true

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --execute)
      DRY_RUN=false
      shift
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --force)
      FORCE=true
      CONFIRM=false
      shift
      ;;
    --no-confirm)
      CONFIRM=false
      shift
      ;;
    --help|-h)
      echo "Usage: $0 [--execute|--dry-run] [--force] [--no-confirm]"
      echo ""
      echo "Safely remove merged PR worktrees and branches."
      echo ""
      echo "Options:"
      echo "  --execute    Perform cleanup with safety checks and confirmation (default: dry-run)"
      echo "  --dry-run    Show what would be done (default)"
      echo "  --force      Skip safety checks for uncommitted/unpushed changes (DANGEROUS)"
      echo "  --no-confirm Skip interactive confirmation"
      echo "  --help, -h   Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Helper functions
info() { echo -e "${BLUE}ℹ${NC} $1"; }
success() { echo -e "${GREEN}✓${NC} $1"; }
warning() { echo -e "${YELLOW}⚠${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; }

# Safety check functions
has_uncommitted_changes() {
  local wt_path=$1
  pushd "$wt_path" > /dev/null 2>&1
  if ! git diff --quiet HEAD; then
    popd > /dev/null 2>&1
    return 0
  fi
  if ! git diff --cached --quiet; then
    popd > /dev/null 2>&1
    return 0
  fi
  if [ -n "$(git ls-files --others --exclude-standard)" ]; then
    popd > /dev/null 2>&1
    return 0
  fi
  popd > /dev/null 2>&1
  return 1
}

has_unpushed_commits() {
  local branch=$1
  local unpushed

  # Check if remote branch exists
  if ! git rev-parse --verify "origin/$branch" > /dev/null 2>&1; then
    # No remote branch, consider all commits as unpushed
    return 0
  fi

  # Check if local branch is ahead of remote
  unpushed=$(git log "origin/$branch..$branch" --oneline 2>/dev/null || true)
  if [ -n "$unpushed" ]; then
    return 0
  fi

  return 1
}

# Ensure we're in a git repo
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  error "Not in a git repository"
  exit 1
fi

REPO_ROOT=$(git rev-parse --show-toplevel)
cd "$REPO_ROOT"

info "Starting worktree cleanup${DRY_RUN:+ (dry-run mode)}"
echo ""

# ============================================
# STEP 1: Show starting state
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STARTING STATE${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo ""
info "Current branch:"
CURRENT_BRANCH=$(git branch --show-current)
echo "  $CURRENT_BRANCH"

echo ""
info "All local branches:"
git branch --list --format="  %(refname:short)"

echo ""
info "All worktrees:"
git worktree list | while read -r line; do
  echo "  $line"
done

# ============================================
# STEP 2: Get merged branches
# ============================================
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}MERGED BRANCHES${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Fetch and prune first
info "Fetching and pruning..."
git fetch --prune --quiet

# Get merged branches
MERGED_BRANCHES=$(git branch --merged main | sed 's/^[* ]*//' | tr '\n' ' ')
echo ""
info "Branches merged into main:"
for branch in $MERGED_BRANCHES; do
  [[ -n "$branch" ]] && echo "  - $branch"
done

# Filter out protected branches
BRANCHES_TO_DELETE=""
for branch in $MERGED_BRANCHES; do
  [[ -z "$branch" ]] && continue

  is_protected=false
  for protected in "${PROTECTED_BRANCHES[@]}"; do
    if [[ "$branch" == "$protected" ]]; then
      is_protected=true
      break
    fi
  done

  if ! $is_protected; then
    BRANCHES_TO_DELETE="$BRANCHES_TO_DELETE $branch"
  fi
done

echo ""
if [[ -z "$BRANCHES_TO_DELETE" ]]; then
  success "No merged branches to delete (all protected)"
else
  warning "Branches that would be deleted:"
  for branch in $BRANCHES_TO_DELETE; do
    echo "  - $branch"
  done
fi

# ============================================
# STEP 3: Find worktrees to remove
# ============================================
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}WORKTREE ANALYSIS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Parse git worktree list --porcelain
WORKTREE_INFO=$(git worktree list --porcelain)

WORKTREES_TO_REMOVE=""
while IFS= read -r line; do
  if [[ "$line" =~ ^worktree\ (.+)$ ]]; then
    WT_PATH="${BASH_REMATCH[1]}"
    WT_BRANCH=""
  elif [[ "$line" =~ ^branch\ refs/heads/(.+)$ ]]; then
    WT_BRANCH="${BASH_REMATCH[1]}"
  fi

  # Check if this worktree should be removed
  if [[ -n "$WT_BRANCH" && -n "$WT_PATH" ]]; then
    should_remove=false
    for branch in $BRANCHES_TO_DELETE; do
      if [[ "$WT_BRANCH" == "$branch" ]]; then
        should_remove=true
        break
      fi
    done

    if $should_remove; then
      WORKTREES_TO_REMOVE="$WORKTREES_TO_REMOVE $WT_PATH:$WT_BRANCH"
    fi

    WT_PATH=""
    WT_BRANCH=""
  fi
done <<< "$WORKTREE_INFO"

echo ""
if [[ -z "$WORKTREES_TO_REMOVE" ]]; then
  success "No worktrees to remove"
else
  warning "Worktrees that would be removed:"
  for wt_info in $WORKTREES_TO_REMOVE; do
    WT_PATH="${wt_info%%:*}"
    WT_BRANCH="${wt_info##*:}"
    echo "  - $WT_PATH (branch: $WT_BRANCH)"
  done
fi

# ============================================
# STEP 4: Show ending state (preview)
# ============================================
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}ENDING STATE (PREVIEW)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo ""
info "Remaining branches after cleanup:"
for branch in $(git branch --list --format="%(refname:short)"); do
  should_delete=false
  for to_delete in $BRANCHES_TO_DELETE; do
    if [[ "$branch" == "$to_delete" ]]; then
      should_delete=true
      break
    fi
  done

  if ! $should_delete; then
    echo "  - $branch"
  fi
done

echo ""
info "Remaining worktrees after cleanup:"
git worktree list | while read -r line; do
  WT_PATH=$(echo "$line" | awk '{print $1}')
  should_remove=false
  for wt_info in $WORKTREES_TO_REMOVE; do
    WT_TO_REMOVE="${wt_info%%:*}"
    if [[ "$WT_PATH" == "$WT_TO_REMOVE" ]]; then
      should_remove=true
      break
    fi
  done

  if ! $should_remove; then
    echo "  $line"
  fi
done

# ============================================
# STEP 5: Safety Checks (before execution)
# ============================================
if ! $DRY_RUN; then
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}SAFETY CHECKS${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""

  # Check for uncommitted changes in worktrees
  SAFETY_ISSUES=false
  for wt_info in $WORKTREES_TO_REMOVE; do
    WT_PATH="${wt_info%%:*}"
    WT_BRANCH="${wt_info##*:}"

    if has_uncommitted_changes "$WT_PATH"; then
      error "Worktree for $WT_BRANCH has uncommitted changes"
      echo "  Path: $WT_PATH"
      SAFETY_ISSUES=true
    fi
  done

  # Check for unpushed commits on branches
  for branch in $BRANCHES_TO_DELETE; do
    if has_unpushed_commits "$branch"; then
      error "Branch $branch has unpushed commits"
      echo "  Run: git log origin/$branch..$branch to see unpushed commits"
      SAFETY_ISSUES=true
    fi
  done

  if $SAFETY_ISSUES; then
    echo ""
    error "Safety checks failed. Use --force to override (DANGEROUS)"
    exit 1
  fi

  echo ""
  success "All safety checks passed"
fi

# ============================================
# STEP 6: Execute cleanup (if not dry-run)
# ============================================
if ! $DRY_RUN; then
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}EXECUTING CLEANUP${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""

  # Show what will be deleted
  if [ -n "$WORKTREES_TO_REMOVE" ] || [ -n "$BRANCHES_TO_DELETE" ]; then
    echo -e "${YELLOW}About to delete:${NC}"
    if [ -n "$WORKTREES_TO_REMOVE" ]; then
      for wt_info in $WORKTREES_TO_REMOVE; do
        WT_PATH="${wt_info%%:*}"
        WT_BRANCH="${wt_info##*:}"
        echo "  Worktree: $WT_PATH (branch: $WT_BRANCH)"
      done
    fi
    if [ -n "$BRANCHES_TO_DELETE" ]; then
      for branch in $BRANCHES_TO_DELETE; do
        echo "  Branch: $branch"
      done
    fi
  fi

  # Interactive confirmation
  if $CONFIRM; then
    echo ""
    read -p "Continue? [y/N] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      info "Aborted by user"
      exit 0
    fi
  fi

  echo ""

  # Remove worktrees
  for wt_info in $WORKTREES_TO_REMOVE; do
    WT_PATH="${wt_info%%:*}"
    WT_BRANCH="${wt_info##*:}"

    info "Removing worktree for $WT_BRANCH at $WT_PATH"
    git worktree remove "$WT_PATH" || error "Failed to remove worktree $WT_PATH"
  done

  # Delete branches
  for branch in $BRANCHES_TO_DELETE; do
    info "Deleting local branch $branch"
    git branch -d "$branch" || error "Failed to delete branch $branch"
  done

  # Prune worktree references
  info "Pruning stale worktree references"
  git worktree prune

  echo ""
  success "Cleanup complete!"
else
  echo ""
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW}DRY-RUN MODE${NC}"
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  info "No changes made. To execute, run:"
  echo "  $0 --execute"
fi

echo ""
