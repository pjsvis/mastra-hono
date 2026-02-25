# Human Test Plan: Worktree Cleanup Script (`td-211bd9`)

This document provides a clear path for a human (the User) to verify that worktree cleanup script works correctly. The script uses just-bash for testing logic but executes on the host system for actual cleanup.

## 1. Prerequisites
- **Git**: Standard git CLI must be available
- **Bash**: Running in a bash-compatible shell
- **Repository**: Must be in the `mastra-hono` directory
- **Main Branch**: Ensure `main` is clean and up to date

## 2. Initial Setup

First, clean up any existing state and prepare test artifacts:

```bash
# Ensure you're on main
git checkout main
git pull origin main

# Create test branches
git branch test/feature-a
git branch test/feature-b
git branch test/feature-c
git branch test/active-keep

# Create worktrees for the branches
git worktree add ../test-worktree-a test/feature-a
git worktree add ../test-worktree-b test/feature-b
git worktree add ../test-worktree-c test/feature-c
git worktree add ../test-worktree-active test/active-keep

# Merge test branches into main (simulating merged PRs)
git merge test/feature-a --no-edit
git merge test/feature-b --no-edit
git merge test/feature-c --no-edit

# Verify state
git branch
git worktree list
```

**Expected State:**
- 5 branches: `main`, `test/feature-a`, `test/feature-b`, `test/feature-c`, `test/active-keep`
- 4 worktrees: main repo + 3 test worktrees + 1 active worktree

## 3. Test Dry-Run Mode

Run the cleanup script in dry-run mode first:

```bash
# Run dry-run (default behavior)
./scripts/worktree-cleanup.sh

# Or explicitly
./scripts/worktree-cleanup.sh --dry-run
```

### What to Look For:

**Starting State Section:**
- Shows current branch (should be `main`)
- Lists all local branches (5 branches)
- Lists all worktrees (4 worktrees)

**Merged Branches Section:**
- Identifies branches merged into main
- Should list: `test/feature-a`, `test/feature-b`, `test/feature-c`
- Should mark them for deletion (yellow warning)
- Should NOT mark `main` or `test/active-keep` for deletion

**Worktree Analysis Section:**
- Identifies worktrees for merged branches
- Should list 3 worktrees to remove:
  - `../test-worktree-a` (branch: `test/feature-a`)
  - `../test-worktree-b` (branch: `test/feature-b`)
  - `../test-worktree-c` (branch: `test/feature-c`)
- Should NOT list `../test-worktree-active` (branch is unmerged)

**Ending State Preview Section:**
- Shows remaining branches: `main`, `test/active-keep`
- Shows remaining worktrees: main repo + `../test-worktree-active`

**Dry-Run Warning Section:**
- Yellow banner indicating no changes were made
- Shows command to execute: `./scripts/worktree-cleanup.sh --execute`

**Pass Criteria:**
- All 3 merged worktrees are identified for removal
- The unmerged worktree (`test/active-keep`) is preserved
- No changes are actually made to repository
- The script suggests correct execute command

## 4. Test Execute Mode

After verifying dry-run output, execute the cleanup:

```bash
# Execute cleanup
./scripts/worktree-cleanup.sh --execute
```

### What to Look For:

**Executing Section:**
- Shows "EXECUTING CLEANUP" in blue
- For each worktree to remove:
  - Displays "Removing worktree for X at Y"
  - Runs `git worktree remove` command
- For each branch to delete:
  - Displays "Deleting local branch X"
  - Runs `git branch -d` command
- Displays "Pruning stale worktree references"
- Shows "Cleanup complete!" in green

**Pass Criteria:**
- All 3 worktrees are successfully removed
- All 3 branches are successfully deleted
- No errors occur during execution
- Final state is clean

## 5. Verify Final State

After execution, verify repository state:

```bash
# Check branches
git branch

# Check worktrees
git worktree list

# Verify no stale references
ls -la .git/worktrees/
```

**Expected Final State:**
- 2 branches remaining: `main`, `test/active-keep`
- 1 worktree remaining: main repo (no test worktrees)
- No stale worktree references in `.git/worktrees/`

**Pass Criteria:**
- Only `main` and `test/active-keep` branches exist
- Only main worktree exists
- No stale directories in `.git/worktrees/`

## 6. Cleanup Test Artifacts

Clean up the remaining test artifacts:

```bash
# Remove active test branch
git branch -d test/active-keep

# Remove test worktree directory (if it still exists)
cd ..
rm -rf test-worktree-active

# Return to main repo
cd mastra-hono
```

## 7. Edge Case Testing (Optional)

Test additional scenarios to ensure robustness:

### A. Test with No Merged Branches
```bash
# Create a new branch and worktree (don't merge)
git branch test/no-merge
git worktree add ../test-no-merge test/no-merge

# Run cleanup - should identify nothing to remove
./scripts/worktree-cleanup.sh --dry-run

# Cleanup
git worktree remove ../test-no-merge
git branch -d test/no-merge
```

### B. Test with Detached Worktree
```bash
# Create a worktree in detached HEAD state
git worktree add --detach ../test-detached HEAD~1

# Run cleanup - should preserve detached worktree
./scripts/worktree-cleanup.sh --dry-run

# Cleanup
git worktree remove ../test-detached
```

### C. Test Safety: Uncommitted Changes
```bash
# Create a branch and worktree
git branch test/with-changes
git worktree add ../test-with-changes test/with-changes

# Make uncommitted changes in the worktree
cd ../test-with-changes
echo "TODO: implement this" >> src/example.ts
git status
cd ../mastra-hono

# Merge branch to main (simulating merged PR)
git merge test/with-changes --no-edit

# Run cleanup - SHOULD FAIL with uncommitted changes error
./scripts/worktree-cleanup.sh --dry-run

# Expected: Error message about uncommitted changes
# The cleanup should be aborted to prevent data loss

# Cleanup
git worktree remove ../test-with-changes
git branch -D test/with-changes
```

### D. Test Safety: Unpushed Commits
```bash
# Create a branch and worktree
git branch test/local-commits
git worktree add ../test-local-commits test/local-commits

# Make local commits but don't push
cd ../test-local-commits
echo "local change" > local-file.txt
git add local-file.txt
git commit -m "Local change not pushed"
cd ../mastra-hono

# Merge branch to main (simulating merged PR)
git merge test/local-commits --no-edit

# Run cleanup - SHOULD FAIL with unpushed commits error
./scripts/worktree-cleanup.sh --dry-run

# Expected: Error message about unpushed commits
# The cleanup should be aborted to prevent data loss

# Cleanup
git worktree remove ../test-local-commits
git branch -D test/local-commits
```

### E. Test Force Override
```bash
# Create a worktree with uncommitted changes
git branch test/force-test
git worktree add ../test-force-test test/force-test
cd ../test-force-test
echo "test" > force-test.txt
cd ../mastra-hono

# Merge branch to main
git merge test/force-test --no-edit

# Regular cleanup should fail
./scripts/worktree-cleanup.sh --execute

# Force cleanup should succeed (DANGEROUS!)
./scripts/worktree-cleanup.sh --execute --force

# Cleanup
git worktree remove ../test-force-test
git branch -D test/force-test
```

## 8. Why This Matters

This human test ensures:
- **Safety**: The dry-run mode accurately predicts what will be deleted
- **Correctness**: Only merged worktrees/branches are removed
- **Preservation**: Unmerged and detached worktrees are safe
- **Usability**: The script provides clear, actionable feedback
- **Reliability**: The cleanup completes without errors or side effects

## 9. Safety Mechanisms

The script includes multiple safety layers to prevent accidental data loss:

### Uncommitted Changes Detection
- Scans each worktree for modified files before deletion
- Checks: `git diff HEAD`, `git diff --cached`, untracked files
- **Prevents**: Losing work in progress when worktrees are cleaned
- **Scenario**: You merge a PR, then continue working in the same worktree

### Unpushed Commits Detection  
- Checks if branches have commits not on remote
- Compares: `git log origin/branch..branch`
- **Prevents**: Losing local-only commits when branches are deleted
- **Scenario**: You merge a PR, then realize you need to make more changes

### Interactive Confirmation
- Requires explicit user confirmation before destructive actions
- Shows: Complete list of what will be deleted
- Can be bypassed with: `--no-confirm` or `--force`
- **Prevents**: Accidental execution of cleanup
- **Scenario**: You run cleanup by mistake or misread the dry-run output

### Force Override
- Advanced flag: `--force` to skip all safety checks
- **Purpose**: For experienced users who know exactly what they're doing
- **Warning**: DANGEROUS - can lead to data loss if misused
- **Best Practice**: Only use `--force` when you're 100% certain

## 10. Integration with Just-Bash

The automated tests in `tests/tools/worktree-cleanup-just-bash.test.ts` use just-bash to validate the parsing logic before it runs on the host system. This provides:

- **Sandbox Safety**: Test git command parsing without touching real worktrees
- **Reproducibility**: Heredoc fixtures provide consistent test data
- **Speed**: In-memory execution is faster than real git operations
- **Coverage**: Easy to test edge cases (detached, special characters, empty state)

The two-phase approach (just-bash test → dry-run → execute) provides maximum safety for destructive operations.

## 11. Lessons Learned

This worktree cleanup system was developed after identifying several common failure modes:

### The Problem
Users frequently merge PRs and then continue working in the same worktree:
1. Merge PR to main
2. Continue development in the worktree
3. Run cleanup script to tidy up
4. **LOSE ALL UNPUSHED CHANGES**

### Common Scenarios
- **Post-merge development**: You merge a PR but realize you need one more fix
- **Local iteration**: You make several commits locally before pushing
- **Interrupted workflow**: You merge a PR, then get distracted and continue work later
- **Multiple PRs**: You merge one PR, then work on another in the same worktree

### Safety-First Approach
The safety mechanisms address these scenarios:
1. **Detection**: Identify uncommitted/unpushed work before deletion
2. **Prevention**: Abort cleanup if safety issues are found
3. **Confirmation**: Require explicit human approval
4. **Override**: Allow force mode for experienced users (with warnings)

### Best Practices
- **After merging PR**: Immediately move back to main and clean up worktree
- **Before cleanup**: Review dry-run output carefully
- **Continuing work**: Create a new worktree/branch for new work
- **Force mode**: Only use when you're 100% certain

## 12. Success Indicators

The worktree cleanup script is production-ready when:

✅ All dry-run tests pass with correct identification  
✅ All execute tests complete without errors  
✅ Unmerged and detached worktrees are preserved  
✅ No stale references remain in `.git/worktrees/`  
✅ The script provides clear, actionable feedback  
✅ Edge cases (special characters, empty state) are handled  
✅ Safety checks prevent uncommitted/unpushed data loss  
✅ Interactive confirmation catches accidental deletions  
✅ Force mode works but is clearly documented as dangerous  

If any test fails, it indicates a bug in the cleanup logic that could lead to accidental data loss in production.

The safety mechanisms ensure that even in edge cases, users are protected from common failure modes that lead to data loss.
