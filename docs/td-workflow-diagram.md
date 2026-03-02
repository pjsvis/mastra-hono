flowchart TD
    Start([Start Work]) --> InitSession
    
    subgraph Session["🧠 Session Initialization"]
        InitSession["td usage --new-session"]
        InitSession -->|creates session ID| ShowState["Show current work territory<br/>FOCUSED ISSUE<br/>WORKFLOW INSTRUCTIONS"]
    end
    
    InitSession --> Decision{Brief Available?}
    
    Decision -->|Yes| Forge["bun run forge<br/>Pick brief from briefs/"]
    Decision -->|No| CreateTask["td create 'title'<br/>--description 'desc'"]
    
    subgraph BriefForge["🔨 Brief Forge Lifecycle"]
        Forge --> LinkBrief["Link brief to td task<br/>GENERATES TASK ID: td-xxxxx"]
        LinkBrief --> StartWork["td start <id>"]
    end
    
    CreateTask --> StartWork
    
    subgraph Development["💻 Development Phase"]
        StartWork --> ShowCurrent["td current<br/>Show working task"]
        ShowCurrent --> DevLoop["Development Loop"]
        
        DevLoop --> Implement["Implement changes<br/>Write code, tests, docs"]
        
        Implement --> LogProgress["td log 'progress message'<br/>Track work completed"]
        
        LogProgress --> Blocked{Blocked?}
        
        Blocked -->|Yes| UseAsk["bun run ask 'question'<br/>Ping human via ntfy"]
        Blocked -->|No| CheckCommands["Review TD commands"]
        
        UseAsk --> CheckCommands
        
        subgraph TDCommands["📋 Available TD Commands"]
            CheckCommands --> ListTasks["td list<br/>List all tasks"]
            CheckCommands --> GetContext["td context <id><br/>Full task context"]
            CheckCommands --> CriticalPath["td critical-path<br/>What unblocks most work"]
            CheckCommands --> NextTask["td next<br/>Highest priority task"]
        end
        
        ListTasks --> DevLoop
        GetContext --> DevLoop
        CriticalPath --> DevLoop
        NextTask --> DevLoop
    end
    
    DevLoop --> Ready{Ready for Review?}
    
    Ready -->|No| DevLoop
    Ready -->|Yes| PrepareGit["Git Preparation"]
    
    subgraph GitWorkflow["🔀 Git & PR Workflow"]
        PrepareGit --> Branch["Checkout feature branch<br/>git checkout -b feature-name"]
        Branch --> Commit["Commit changes<br/>git commit -m 'message'"]
        Commit -->|runs pre-commit| PreCommit["Pre-commit checks<br/>bun run lint && typecheck"]
        PreCommit --> Push["Push to remote<br/>git push -u origin feature"]
        Push --> CreatePR["Create PR<br/>gh pr create"]
    end
    
    CreatePR --> PRReview["📋 PR Created<br/>Waiting for review"]
    
    subgraph TaskLifecycle["📝 Task Lifecycle"]
        PRReview --> Handoff["td handoff <id><br/>--done ...<br/>--remaining ...<br/>--decision ...<br/>--uncertain ..."]
        
        Handoff -->|Different session| SubmitReview["td review <id><br/>Submit for review"]
        SubmitReview --> ReviewerAction["Reviewer reviews"]
        
        ReviewerAction --> Approved{Approved?}
        
        Approved -->|Yes| MergePR["Merge PR into main"]
        Approved -->|No| RequestChanges["Request changes"]
        
        RequestChanges --> DevLoop
        MergePR --> CompleteTask["td approve <id><br/>Complete task"]
    end
    
    CompleteTask --> Success([✅ Task Complete])
    
    subgraph WorkSession["💼 Multi-Issue Workspace"]
        StartWork -->|multiple related| Workspace["td ws start 'name'"]
        Workspace --> TagTasks["td ws tag <ids>"]
        TagTasks --> WSLog["td ws log 'message'"]
        WSLog --> WSHandoff["td ws handoff<br/>Grouped handoff"]
    end
    
    WSHandoff --> Success
    
    subgraph AdminActions["🔧 Admin Actions"]
        StartWork -->|admin closure| CloseTask["td close <id><br/>For: duplicates, won't-fix"]
        ShowCurrent --> Reviewable["td reviewable<br/>Issues ready for review"]
        Reviewable --> ApproveReject["td approve/reject <id><br/>Complete review"]
    end
    
    CloseTask --> End([End])
    ApproveReject --> Success
    
    style InitSession fill:#e1f5e1
    style Forge fill:#f39c12
    style CreateTask fill:#f39c12
    style StartWork fill:#e1f5e1
    style DevLoop fill:#d1fae5
    style Handoff fill:#ffd700
    style CreatePR fill:#4caf50
    style MergePR fill:#4caf50
    style CompleteTask fill:#4caf50
    style Success fill:#4caf50
    style UseAsk fill:#ff9800
```

## Command Reference

### TD Core Commands

```mermaid
mindmap
  root((TD Commands))
    Session Management
      td usage --new-session
        Initialize new session
        Show current state
    Task Management
      td create "title"
        Create new task
      td start <id>
        Begin working on task
      td current
        Show focused task
      td list
        List all tasks
      td context <id>
        Get task details
      td log "message"
        Track progress
      td critical-path
        Show blockers
      td next
        Highest priority
    Task Lifecycle
      td handoff <id>
        Capture state
        --done ...
        --remaining ...
        --decision ...
        --uncertain ...
      td review <id>
        Submit for review
      td approve <id>
        Complete review
      td close <id>
        Admin closure
    Workspace
      td ws start "name"
        Multi-issue session
      td ws tag <ids>
        Group tasks
      td ws log "message"
        Log group progress
      td ws handoff
        Grouped handoff
    Review
      td reviewable
        Ready to review
      td approve/reject <id>
        Review decision
```

### Utility Scripts

```mermaid
mindmap
  root((Utility Scripts))
    bun run forge
      Pick brief from briefs/
      Link brief to td task
      Generate task ID
      Launch task automatically
    bun run finish
      Automated closure engine
      Run verification checks
      Generate debrief
      Create GitHub PR
      Perform final handoff
    bun run ask "question"
      Ping human via ntfy
      Use when blocked
      Get iPhone notification
```

### Git Commands Used

```mermaid
mindmap
  root((Git Commands))
    Branching
      git checkout -b <branch>
        Create feature branch
      git checkout main
        Switch to main
      git checkout -b <branch> <commit>
        Branch from specific commit
    Committing
      git add <files>
        Stage changes
      git commit -m "message"
        Commit with message
      git status
        Show changes
    Pushing
      git push
        Push to remote
      git push -u origin <branch>
        Push with upstream
    Branch Management
      git branch -d <branch>
        Delete local branch
      git log --oneline
        Show commit history
```

## Session Boundaries

### Start of Session
```bash
td usage --new-session  # REQUIRED at conversation start or after /clear
```

**Purpose:** Initialize session ID and show current work territory map

### End of Session
```bash
td handoff <id> --done ... --remaining ... --decision ... --uncertain ...
```

**Purpose:** Capture state before stopping work

## Workflow Phases

### Phase 1: Brief to Task
```mermaid
flowchart LR
    Brief[📄 Brief in briefs/] --> Forge[bun run forge]
    Forge --> Selection[Select brief]
    Selection --> Link[Link to td task]
    Link --> TaskID[Generate td-xxxxx]
    TaskID --> Start[td start <id>]
```

### Phase 2: Development
```mermaid
flowchart LR
    Start[td start <id>] --> Dev[Implement changes]
    Dev --> Log[td log 'progress']
    Log --> Loop{More work?}
    Loop -->|Yes| Dev
    Loop -->|No| Ready[Ready for PR]
    Ready --> Check[Pre-commit checks]
    Check --> Git[git commit]
```

### Phase 3: PR Creation
```mermaid
flowchart LR
    Changes[Committed changes] --> Branch[Create feature branch]
    Branch --> Push[git push]
    Push --> PR[gh pr create]
    PR --> Created[PR #X created]
    Created --> Review[Waiting for review]
```

### Phase 4: Review & Merge
```mermaid
flowchart LR
    PR[PR submitted] --> Handoff[td handoff <id>]
    Handoff --> Reviewer[Reviewer reviews]
    Reviewer --> Decision{Approved?}
    Decision -->|Yes| Merge[git merge]
    Decision -->|No| Changes[Request changes]
    Changes --> Dev[Back to dev]
    Merge --> Approve[td approve <id>]
    Approve --> Complete[Task complete]
```

## Important Notes

### Session Rules
- **Start:** `td usage --new-session` at conversation start
- **End:** `td handoff <id>` before stopping work
- **Multi-issue:** Use `td ws` commands to group handoffs
- **Review:** Cannot approve issues you implemented (exception: minor tasks)

### Pre-commit Flow
```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Git as Git
    participant Linter as Linter
    participant TS as TypeScript
    participant Tests as Test Runner
    
    Dev->>Git: git commit -m "message"
    Git->>Linter: bun run lint
    Linter-->>Dev: ✅ No issues
    Git->>TS: bun run typecheck
    TS-->>Dev: ✅ No errors
    Git->>Tests: bun test
    Tests-->>Dev: ✅ Tests pass
    Git-->>Dev: ✅ Commit created
```

### Handoff Structure
```bash
td handoff <id> \
  --done "What was completed" \
  --remaining "What's left to do" \
  --decision "Key decisions made" \
  --uncertain "Uncertain items"
```

## Multi-Issue Workflow

When working on multiple related issues:

```mermaid
flowchart TD
    Start[Start work] --> CreateWS["td ws start 'project-name'"]
    CreateWS --> TagAll["td ws tag td-id1 td-id2 td-id3"]
    TagAll --> Work["Work on all tasks"]
    Work --> LogAll["td ws log 'progress'"]
    LogAll --> Finish["td ws handoff"]
    Finish --> Review[Review all together]
```

## Related Documentation

- **AGENTS.md** - Task management lifecycle and rules
- **playbooks/cli-design-playbook.md** - CLI design patterns
- **debriefs/** - Archived briefs and learning
- **Taskfile.yml** - Project-specific task definitions

## Workflow Summary

1. **Initialize:** `td usage --new-session` (mandatory grounding signal)
2. **Forge:** `bun run forge` picks brief, creates task
3. **Develop:** Implement, `td log`, iterate, use `bun run ask` if blocked
4. **Git:** Commit, push, create PR
5. **Handoff:** `td handoff <id>` captures state
6. **Review:** Different session reviews, approves
7. **Complete:** `td approve <id>` finishes task

**Key Principle:** Each session tracks implementer. You cannot approve your own work. Different session handles review/approval.