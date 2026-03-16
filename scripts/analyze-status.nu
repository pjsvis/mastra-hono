# System status analyzer - Nushell component
# Argument: <data_directory>

let data_dir = $in.0
let tasks = (open ($data_dir + "/tasks.json") | default [])
let prs = (open ($data_dir + "/prs.json") | default [])
let worktrees_raw = (open ($data_dir + "/worktrees.txt") | default "")

let worktree_branches = $worktrees_raw
  | lines
  | where ($it | str starts-with "branch ")
  | split column " " name value
  | get value
  | default []

let task_ids = $tasks | get id | default []

# Analyze tasks
let analyzed_tasks = $tasks | each { |task|
  let linked_pr = $prs | where ($task.id in $in.body) or ($task.id in $in.title) | first | default {}
  let linked_worktree = $worktree_branches | where ($task.id in $it) | first | default ""
  
  let violations = []
  
  if $task.status == "in_progress" {
    if ($linked_worktree | is-empty) {
      $violations = $violations | append ["Missing worktree for in_progress task"]
    }
  }
  
  if $task.status == "in_review" {
    if ($linked_pr | is-empty) {
      $violations = $violations | append ["Missing PR for in_review task"]
    }
    if (not ($linked_worktree | is-empty)) {
      $violations = $violations | append ["Worktree exists for in_review task (should be cleaned)"]
    }
  }
  
  if $task.status in ["done", "closed"] {
    if (not ($linked_pr | is-empty)) {
      $violations = $violations | append ["PR exists for completed task (should be closed)"]
    }
    if (not ($linked_worktree | is-empty)) {
      $violations = $violations | append ["Worktree exists for completed task (should be removed)"]
    }
  }
  
  let state = if ($violations | length) > 0 { "violation" } else { "ok" }
  
  {
    id: $task.id,
    title: $task.title,
    status: $task.status,
    linked_pr: ($linked_pr | get -o number),
    linked_worktree: ($linked_worktree | default null),
    violations: $violations,
    state: $state
  }
}

# Find orphaned resources
let orphan_prs = $prs | where {
  not ($task_ids | any { |id| $id in $in.body or $id in $in.title })
} | each { |pr|
  {
    number: $pr.number,
    title: $pr.title,
    headRefName: $pr.headRefName,
    type: "orphan_pr"
  }
}

let orphan_worktrees = $worktree_branches
  | where not ($it == "refs/heads/main")
  | where {
    not ($task_ids | any { |id| $id in $it })
  } | each { |wt|
    {
      branch: $wt,
      type: "orphan_worktree"
    }
  }

# Compile analysis
let violations_count = ($analyzed_tasks | where state == "violation" | length)
let orphans_count = ($orphan_prs | length) + ($orphan_worktrees | length)
let needs_attention = ($violations_count > 0) or ($orphans_count > 0)
let overall_state = if $needs_attention { "needs_attention" } else { "healthy" }

{
  summary: {
    total_tasks: ($tasks | length),
    total_prs: ($prs | length),
    total_worktrees: ($worktree_branches | where not ($it == "refs/heads/main") | length),
    violations: $violations_count,
    orphans: $orphans_count,
    overall_state: $overall_state
  },
  tasks: $analyzed_tasks,
  orphan_resources: {
    prs: $orphan_prs,
    worktrees: $orphan_worktrees
  }
}
