# help-aliases.nu
# This file provides a self‑documenting help system for the Nushell alias set.

# ----------------------------------------------------------------------
# 1. Define the help table
# ----------------------------------------------------------------------
export def help-table [] {
  let table = [
    {alias: "tdu",           command: "td usage --new-session",           description: "Start a new task usage session."},
    {alias: "tdl",           command: "td list",                     description: "List all tasks."},
    {alias: "td-foc",         command: "td focus <issue-id>",          description: "Focus on a specific task."},
    {alias: "td-unfoc",       command: "td unfocus",                   description: "Clear any focused task."},
    {alias: "station-status", command: "td current --json | from json | get focused.issue", description: "Show the focused task as JSON."},
    {alias: "td-open",        command: "filter-tasks open",             description: "List open tasks."},
    {alias: "td-inprog",      command: "filter-tasks in_progress",       description: "List in‑progress tasks."},
    {alias: "td-review",      command: "filter-tasks in_review",         description: "List tasks awaiting review."},
    {alias: "td-all",         command: "td list --json | from json",     description: "List all tasks (raw JSON)."},
    {alias: "td-summary",     command: "td list --json | from json | select id title status priority", description: "Quick summary table of tasks."},
    {alias: "skg",            command: "skate get",                    description: "Retrieve the current skate session."},
    {alias: "sk-set",          command: "skate set <value>",             description: "Set a skate configuration value."},
    {alias: "sk-del",          command: "skate delete <key>",             description: "Delete a skate configuration key."},
    {alias: "td-commits",     command: "git log --oneline --decorate --graph", description: "Show recent git commits in a concise format."},
    {alias: "td-clean",        command: "git clean -fdx",                 description: "Remove untracked files (use with caution)."},
    {alias: "td-status",       command: "git status",                    description: "Show current git status."},
    {alias: "td-branch",       command: "git branch --show-current",      description: "Show the current branch."},
    {alias: "td-commits-json", command: "git log --pretty=format:'{\\\"hash\\\":\\\"%H\\\",\\\"message\\\":\\\"%s\\\"}'", description: "Show commits as JSON objects."},
    {alias: "td-branch-json", command: "git branch --show-current | json", description: "Show current branch as JSON."}
  ]
  $table
}

# ----------------------------------------------------------------------
# 2. Define the help command
# ----------------------------------------------------------------------
export def help-mastra [alias?] {
  if $alias != null {
    # Show help for a specific alias
    let entry = (help-table | where alias == $alias)
    if ($entry | is-not-empty) {
      let e = ($entry | first)
      print $"Alias: ($e.alias)"
      print $"Command: ($e.command)"
      print $"Description: ($e.description)"
    } else {
      print $"No help entry found for alias '($alias)'."
    }
  } else {
    # Show list of all aliases
    print "Available Nushell shortcuts:"
    help-table | select alias command description | sort-by alias | table
  }
}

# ----------------------------------------------------------------------
# 3. Register the help alias
# ----------------------------------------------------------------------
# Note: Renamed to help-mastra to avoid conflict with built-in help
alias h-mastra = help-mastra
