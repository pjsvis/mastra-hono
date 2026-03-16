# nushell-aliases.nu
# This file defines a set of reusable aliases and functions that simplify frequent operations in the Mastra project.

# --- Simple Aliases (Commands only) ---
alias tdu = td usage --new-session
alias tdl = td list
alias td-foc = td focus
alias td-unfoc = td unfocus
alias skg = skate get
alias sk-set = skate set
alias sk-del = skate delete
alias td-status = git status
alias td-branch = git branch --show-current
alias td-clean = git clean -fdx

# --- Functions (Pipelines or complex logic) ---

# Focused task snapshot
export def station-status [] {
  td current --json | from json | get focused.issue
}

# Task filters
export def td-open [] {
  td list --json | from json | where status == "open"
}

export def td-inprog [] {
  td list --json | from json | where status == "in_progress"
}

export def td-review [] {
  td list --json | from json | where status == "in_review"
}

export def td-all [] {
  td list --json | from json
}

export def td-summary [] {
  td list --json | from json | select id title status priority
}

# Git visual log
export def td-commits [] {
  git log --oneline --decorate --graph
}

# Git log as JSON objects
export def td-commits-json [] {
  git log --pretty=format:'{"hash":"%H","message":"%s"}' | lines | each { |it| $it | from json }
}

# Current branch as JSON
export def td-branch-json [] {
  { branch: (git branch --show-current) }
}
