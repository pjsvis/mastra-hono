# Test Mermaid Charts

This file contains various types of Mermaid diagrams for testing purposes.

## Flowchart Example

```mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[Complete]
    
    style A fill:#e1f5e1
    style C fill:#e1f5e1
    style E fill:#e1f5e1
    style D fill:#ffe1e1
```

## Sequence Diagram Example

```mermaid
sequenceDiagram
    participant User
    participant Agent
    participant Tool
    participant API
    
    User->>Agent: Send task
    Agent->>Tool: Request execution
    Tool->>API: Call external service
    API-->>Tool: Return response
    Tool-->>Agent: Provide result
    Agent-->>User: Deliver answer
```

## State Diagram Example

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Processing: Task received
    Processing --> Validating: Process complete
    Validating --> Success: Validation passed
    Validating --> Error: Validation failed
    Error --> Processing: Retry
    Success --> [*]
```

## Mind Map Example

```mermaid
mindmap
  root((Mastra Agent))
    Capabilities
      Task execution
      Tool usage
      Workflow orchestration
    Components
      Agents
      Tools
      Workflows
      Memory
    Integration
      APIs
      Databases
      External services
```

## Git Graph Example

```mermaid
gitGraph
    commit
    commit
    branch develop
    checkout develop
    commit
    commit
    checkout main
    merge develop
    commit
    commit
```

## ER Diagram Example

```mermaid
erDiagram
    AGENT ||--o{ TASK : manages
    AGENT ||--o{ TOOL : uses
    TASK {
        string id
        string description
        string status
        datetime created_at
    }
    TOOL {
        string id
        string name
        string type
        json config
    }
    AGENT {
        string id
        string name
        string role
        json settings
    }
```

## Gantt Chart Example

```mermaid
gantt
    title Project Timeline
    dateFormat  YYYY-MM-DD
    section Planning
    Requirements      :done,    des1, 2024-01-01, 2024-01-05
    Architecture      :active,  des2, 2024-01-06, 3d
    section Development
    Implementation    :         des3, after des2, 5d
    Testing           :         des4, after des3, 3d
    section Deployment
    Deployment        :         des5, after des4, 2d
```

## Pie Chart Example

```mermaid
pie title Task Distribution
    "Processing" : 45
    "Waiting" : 25
    "Completed" : 20
    "Failed" : 10
```
