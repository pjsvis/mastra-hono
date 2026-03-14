# nushell-aliases.nu
# Minimal aliases required by the test suite

# Task session management
alias tdu = td usage --new-session
alias tdl = td list

# Focus management
alias td-foc = td focus
alias td-unfoc = td unfocus

# Focused task snapshot (returns the whole focused issue)
alias station-status = td current --json | from json | get focused.issue

# Task filters – functions that always return a table (empty when no matches)

def td-open [] {
    let result = (td list --json | from json | where status == "open")
    if ($result | is-empty) { [] } else { $result }
}

def td-inprog [] {
    let result = (td list --json | from json | where status == "in_progress")
    if ($result | is-empty) { [] } else { $result }
}

def td-review [] {
    let result = (td list --json | from json | where status == "in_review")
    if ($result | is-empty) { [] } else { $result }
}

def td-all [] {
    let result = (td list --json | from json)
    if ($result | is-empty) { [] } else { $result }
}

def td-summary [] {
    let result = (td list --json | from json | select id title status priority)
    if ($result | is-empty) { [] } else { $result }
}

# Skate commands
alias skg     = skate get
alias sk-set   = skate set
alias sk-del   = skate delete

# Git shortcuts
alias td-commits = git log --oneline --decorate --graph
alias td-clean   = git clean -fdx
alias td-status  = git status
alias td-branch  = git branch --show-current

# Simple helper function used by the test suite
def git-summary [] {
    let commits = (git log --oneline --decorate --graph | length)
    let branch  = (git branch --show-current)
    let status  = (git status --short | length)
    { commits: $commits, branch: $branch, status: $status }
}



