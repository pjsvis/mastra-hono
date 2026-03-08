# nushell-aliases.nu
# This file defines a set of reusable aliases that simplify frequent operations in the Mastra project.
# All aliases are written in Nushell (nu) syntax and can be added to your config.nu or imported via a separate module.

# Task session management
alias tdu = "td usage --new-session"
alias tdl = "td list"

# Focus management
alias td-foc = "td focus"
alias td-unfoc = "td unfocus"

# Focused task snapshot
alias station-status = "td current --json | from json | get focused.issue"

# Task filters
alias td-open = "td list --json | from json | where status == \"open\""
alias td-inprog = "td list --json | from json | where status == \"in_progress\""
alias td-review = "td list --json | from json | where status == \"in_review\""
alias td-all = "td list --json | from json"
alias td-summary = "td list --json | from json | select id title status priority"

# Skate commands
alias skg = "skate get"
alias sk-set = "skate set"
alias sk-del = "skate delete"

# Git shortcuts
alias td-commits = "git log --oneline --decorate --graph"
alias td-clean = "git clean -fdx"
alias td-status = "git status"
alias td-branch = "git branch --show-current"
