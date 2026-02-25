import { describe, expect, test } from "bun:test";
import { Bash } from "just-bash";

type WorktreeEntry = {
  path: string;
  branch?: string;
};

const DEFAULT_PROTECTED_BRANCHES = ["main", "master"];

const parseWorktreeListPorcelain = (output: string): WorktreeEntry[] => {
  const entries: WorktreeEntry[] = [];
  let current: WorktreeEntry | undefined;

  for (const rawLine of output.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith("worktree ")) {
      current = { path: line.slice("worktree ".length).trim() };
      entries.push(current);
      continue;
    }

    if (line.startsWith("branch ") && current) {
      const ref = line.slice("branch ".length).trim();
      if (ref === "(detached)") continue;
      if (ref.startsWith("refs/heads/")) {
        current.branch = ref.slice("refs/heads/".length);
      }
    }
  }

  return entries;
};

const computeCleanupActions = (params: {
  mergedBranches: string[];
  worktrees: WorktreeEntry[];
  protectedBranches?: string[];
}) => {
  const protectedBranches = new Set(
    params.protectedBranches ?? DEFAULT_PROTECTED_BRANCHES,
  );
  const merged = params.mergedBranches.filter((b) => !protectedBranches.has(b));
  const mergedSet = new Set(merged);

  const worktreesToRemove = params.worktrees
    .filter((wt) => wt.branch && mergedSet.has(wt.branch))
    .map((wt) => wt.path);

  const branchesToDelete = [...mergedSet].sort();

  return { worktreesToRemove, branchesToDelete };
};

describe("worktree cleanup parsing (just-bash)", () => {
  test("parses porcelain output and computes cleanup actions", async () => {
    const bash = new Bash();

    const result = await bash.exec(`
cat <<'EOF'
worktree /repo
HEAD 1111111111111111111111111111111111111111
branch refs/heads/main

worktree /repo/.worktrees/feature-123
HEAD 2222222222222222222222222222222222222222
branch refs/heads/feature/123

worktree /repo/.worktrees/bugfix-7
HEAD 3333333333333333333333333333333333333333
branch refs/heads/bugfix/7

worktree /repo/.worktrees/detached
HEAD 4444444444444444444444444444444444444444
branch (detached)
EOF
    `);

    const worktrees = parseWorktreeListPorcelain(result.stdout);

    const { worktreesToRemove, branchesToDelete } = computeCleanupActions({
      mergedBranches: ["feature/123", "bugfix/7", "main"],
      worktrees,
    });

    expect(worktreesToRemove).toEqual([
      "/repo/.worktrees/feature-123",
      "/repo/.worktrees/bugfix-7",
    ]);
    expect(branchesToDelete).toEqual(["bugfix/7", "feature/123"]);
  });

  test("ignores detached worktrees and leaves unmerged branches alone", async () => {
    const bash = new Bash();

    const result = await bash.exec(`
cat <<'EOF'
worktree /repo
HEAD 1111111111111111111111111111111111111111
branch refs/heads/main

worktree /repo/.worktrees/feature-keep
HEAD 2222222222222222222222222222222222222222
branch refs/heads/feature/keep

worktree /repo/.worktrees/detached
HEAD 3333333333333333333333333333333333333333
branch (detached)
EOF
    `);

    const worktrees = parseWorktreeListPorcelain(result.stdout);

    const { worktreesToRemove, branchesToDelete } = computeCleanupActions({
      mergedBranches: ["feature/old"],
      worktrees,
    });

    expect(worktreesToRemove).toEqual([]);
    expect(branchesToDelete).toEqual(["feature/old"]);
  });

  test("supports custom protected branches list", () => {
    const worktrees: WorktreeEntry[] = [
      { path: "/repo", branch: "trunk" },
      { path: "/repo/.worktrees/feature-x", branch: "feature/x" },
    ];

    const { worktreesToRemove, branchesToDelete } = computeCleanupActions({
      mergedBranches: ["trunk", "feature/x"],
      worktrees,
      protectedBranches: ["trunk"],
    });

    expect(worktreesToRemove).toEqual(["/repo/.worktrees/feature-x"]);
    expect(branchesToDelete).toEqual(["feature/x"]);
  });

  test("dry-run mode shows starting state and ending state preview", async () => {
    const bash = new Bash();

    // Set up initial state
    const setupResult = await bash.exec(`
cat <<'EOF'
worktree /repo
HEAD 1111111111111111111111111111111111111111
branch refs/heads/main

worktree /repo/.worktrees/feature-a
HEAD 2222222222222222222222222222222222222222
branch refs/heads/feature/a

worktree /repo/.worktrees/feature-b
HEAD 3333333333333333333333333333333333333333
branch refs/heads/feature/b

worktree /repo/.worktrees/detached-keep
HEAD 4444444444444444444444444444444444444
branch (detached)
EOF
    `);

    const startingWorktrees = parseWorktreeListPorcelain(setupResult.stdout);

    // Simulate merged branches
    const mergedBranches = ["main", "feature/a", "feature/b"];

    const { worktreesToRemove, branchesToDelete } = computeCleanupActions({
      mergedBranches,
      worktrees: startingWorktrees,
    });

    // Verify starting state
    expect(startingWorktrees).toHaveLength(4);
    expect(startingWorktrees.filter((wt) => wt.branch)).toHaveLength(3);
    expect(startingWorktrees.filter((wt) => !wt.branch)).toHaveLength(1);

    // Verify cleanup actions
    expect(worktreesToRemove).toEqual([
      "/repo/.worktrees/feature-a",
      "/repo/.worktrees/feature-b",
    ]);
    expect(branchesToDelete).toEqual(["feature/a", "feature/b"]);

    // Simulate ending state after cleanup
    const endingWorktrees = startingWorktrees.filter(
      (wt) => !worktreesToRemove.includes(wt.path),
    );

    // Verify ending state
    expect(endingWorktrees).toHaveLength(2);
    expect(endingWorktrees.map((wt) => wt.path)).toEqual([
      "/repo",
      "/repo/.worktrees/detached-keep",
    ]);
  });

  test("full workflow: identify, preview, and cleanup merged worktrees", async () => {
    const bash = new Bash();

    // Simulate git branch --merged output
    const mergedOutput = await bash.exec(`echo "  feature/x
  feature/y
  feature/z
  main
* current-feature"`);

    const mergedBranches = mergedOutput.stdout
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("*"));

    // Simulate git worktree list --porcelain output
    const worktreeOutput = await bash.exec(`
cat <<'EOF'
worktree /repo
HEAD aaa111
branch refs/heads/main

worktree /repo/.worktrees/feature-x
HEAD bbb222
branch refs/heads/feature/x

worktree /repo/.worktrees/feature-y
HEAD ccc333
branch refs/heads/feature/y

worktree /repo/.worktrees/feature-z
HEAD ddd444
branch refs/heads/feature/z

worktree /repo/.worktrees/unmerged
HEAD eee555
branch refs/heads/feature/unmerged
EOF
    `);

    const worktrees = parseWorktreeListPorcelain(worktreeOutput.stdout);

    // Compute cleanup actions
    const { worktreesToRemove, branchesToDelete } = computeCleanupActions({
      mergedBranches,
      worktrees,
    });

    // Verify correct identification
    expect(branchesToDelete).toEqual(["feature/x", "feature/y", "feature/z"]);
    expect(worktreesToRemove).toEqual([
      "/repo/.worktrees/feature-x",
      "/repo/.worktrees/feature-y",
      "/repo/.worktrees/feature-z",
    ]);

    // Verify unmerged worktree is preserved
    const unmergedWt = worktrees.find((wt) => wt.branch === "feature/unmerged");
    expect(unmergedWt).toBeDefined();
    expect(worktreesToRemove).not.toContain(unmergedWt?.path);
  });

  test("handles edge case: no merged branches to clean", async () => {
    const bash = new Bash();

    const worktreeOutput = await bash.exec(`
cat <<'EOF'
worktree /repo
HEAD aaa111
branch refs/heads/main

worktree /repo/.worktrees/feature-active
HEAD bbb222
branch refs/heads/feature/active
EOF
    `);

    const worktrees = parseWorktreeListPorcelain(worktreeOutput.stdout);

    const { worktreesToRemove, branchesToDelete } = computeCleanupActions({
      mergedBranches: ["main"],
      worktrees,
    });

    expect(worktreesToRemove).toEqual([]);
    expect(branchesToDelete).toEqual([]);
  });

  test("handles edge case: all branches merged", async () => {
    const worktrees: WorktreeEntry[] = [
      { path: "/repo", branch: "main" },
      { path: "/repo/.worktrees/feat-1", branch: "feature/1" },
      { path: "/repo/.worktrees/feat-2", branch: "feature/2" },
      { path: "/repo/.worktrees/feat-3", branch: "feature/3" },
    ];

    const { worktreesToRemove, branchesToDelete } = computeCleanupActions({
      mergedBranches: ["main", "feature/1", "feature/2", "feature/3"],
      worktrees,
    });

    expect(worktreesToRemove).toHaveLength(3);
    expect(branchesToDelete).toHaveLength(3);
    expect(branchesToDelete).toEqual(["feature/1", "feature/2", "feature/3"]);
  });

  test("preserves worktrees for branches not in merged list", async () => {
    const worktrees: WorktreeEntry[] = [
      { path: "/repo", branch: "main" },
      { path: "/repo/.worktrees/merged", branch: "feature/merged" },
      { path: "/repo/.worktrees/active-1", branch: "feature/active-1" },
      { path: "/repo/.worktrees/active-2", branch: "feature/active-2" },
    ];

    const { worktreesToRemove, branchesToDelete } = computeCleanupActions({
      mergedBranches: ["main", "feature/merged"],
      worktrees,
    });

    expect(worktreesToRemove).toEqual(["/repo/.worktrees/merged"]);
    expect(branchesToDelete).toEqual(["feature/merged"]);

    // Verify active worktrees are not marked for removal
    expect(worktreesToRemove).not.toContain("/repo/.worktrees/active-1");
    expect(worktreesToRemove).not.toContain("/repo/.worktrees/active-2");
  });

  test("handles worktrees with special characters in branch names", async () => {
    const worktrees: WorktreeEntry[] = [
      { path: "/repo", branch: "main" },
      { path: "/repo/.worktrees/feat-with-dash", branch: "feature/with-dash" },
      {
        path: "/repo/.worktrees/feat_with_underscore",
        branch: "feature/with_underscore",
      },
      {
        path: "/repo/.worktrees/feat/with/slash",
        branch: "feature/with/slash",
      },
    ];

    const { worktreesToRemove, branchesToDelete } = computeCleanupActions({
      mergedBranches: [
        "main",
        "feature/with-dash",
        "feature/with_underscore",
        "feature/with/slash",
      ],
      worktrees,
    });

    expect(worktreesToRemove).toHaveLength(3);
    expect(branchesToDelete).toEqual([
      "feature/with-dash",
      "feature/with/slash",
      "feature/with_underscore",
    ]);
  });
});

// ============================================================================
// SAFETY FEATURES DOCUMENTATION
// ============================================================================
// The worktree cleanup script includes several safety mechanisms that prevent data loss:
//
// 1. UNCOMMITTED CHANGES CHECK
//    - Scans worktrees for uncommitted changes before deletion
//    - Checks: `git diff HEAD`, `git diff --cached`, untracked files
//    - Prevents: Losing work in progress when worktrees are cleaned
//
// 2. UNPUSHED COMMITS CHECK
//    - Checks if branches have commits not on remote
//    - Compares: `git log origin/branch..branch`
//    - Prevents: Losing local-only commits when branches are deleted
//
// 3. INTERACTIVE CONFIRMATION
//    - Requires explicit user confirmation before destructive actions
//    - Shows: What will be deleted (worktrees and branches)
//    - Can be bypassed with: `--no-confirm` or `--force`
//
// 4. FORCE OVERRIDE
//    - Advanced flag: `--force` to skip all safety checks
//    - Purpose: For experienced users who know exactly what they're doing
//    - Warning: DANGEROUS - can lead to data loss if misused
//
// SAFETY WORKFLOW:
// 1. Dry-run first: `./scripts/worktree-cleanup.sh --dry-run`
// 2. Review output: Check what will be deleted
// 3. Safety checks: Verify no uncommitted/unpushed changes
// 4. Confirm: Explicitly approve deletion
// 5. Execute: Only after passing all safety checks
//
// LESSONS LEARNED:
// - Merged PR worktrees may still have active development in them
// - Users often merge PRs and continue working in same worktree
// - Unpushed changes are easily lost if worktree is deleted
// - Safety checks prevent accidental data loss from common workflows
// - Interactive confirmation adds final human-in-the-loop safeguard
