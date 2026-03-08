# help-aliases.nu
# This file provides a self‑documenting help system for the Nushell alias set.
# It mirrors the style of the Citty CLI builder package, offering a `help` alias
# that lists all available shortcuts, their usage, and a brief description.
#
# Usage:
#   help
#   help <alias>
#
# The help information is stored in a table (`help-table`) that can be filtered
# or displayed as a formatted table. The `help` alias is defined at the end of
# the file.

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

  # Convert the table to a NuShell table for pretty printing
  $table | from json
}

# ----------------------------------------------------------------------
# 2. Define the help alias
# ----------------------------------------------------------------------
export def help [alias: string?] {
  if $alias {
    # Show help for a specific alias
    let entry = (help-table | where alias == $alias)
    if $entry != [] {
      echo $"Alias: $entry.alias"
      echo $"Command: $entry.command"
      echo $"Description: $entry.description"
    } else {
      echo $"No help entry found for alias '$alias'."
    }
  } else {
    # Show list of all aliases
    echo "Available Nushell shortcuts:"
    help-table | select alias command description | sort-by alias | table
  }
}

# ----------------------------------------------------------------------
# 3. Register the help alias in the global namespace
# ----------------------------------------------------------------------
alias help = "help"
