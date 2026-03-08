# nushell-utils.nu
# Utility functions for the Mastra project.
# Provides reusable NuShell functions for common tasks such as filtering tasks by status
# and generating a concise git summary.

# ----------------------------------------------------------------------
# 1. Filter tasks by status
# ----------------------------------------------------------------------
# Usage:
#   filter-tasks "open"
#   filter-tasks "in_progress"
#   filter-tasks "in_review"
#   filter-tasks "all"   # returns all tasks
#
# This function expects the `td` CLI to be available in the PATH.
# It returns a JSON array of task objects that match the given status.
export def filter-tasks [status: string] {
  # Normalize status string (case‑insensitive)
  let norm_status = $status | str downcase

  # Fetch all tasks as JSON
  let all_tasks = td list --json | from json

  # If status is "all", return everything
  if $norm_status == "all" {
    echo $all_tasks
    exit 0
  }

  # Filter by status
  let filtered = $all_tasks | where status == $norm_status

  echo $filtered
}

# ----------------------------------------------------------------------
# 2. Git summary
# ----------------------------------------------------------------------
# Usage:
#   git-summary
#
# Returns a JSON object containing:
#   - commits: number of commits in the current branch
#   - branch: current branch name
#   - status: result of `git status --short`
export def git-summary [] {
  # Get commit count
  let commits = git log --oneline | lines | length

  # Get current branch
  let branch = git branch --show-current

  # Get short status
  let status = git status --short

  # Build JSON object
  let summary = {
    commits: $commits,
    branch: $branch,
    status: $status
  }

  echo $summary
}
