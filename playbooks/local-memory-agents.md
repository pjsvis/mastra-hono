---
date: 2026-03-21
tags: [playbook, local-memory, agents, observational, memory, mastra, learning]
agent: local-ai
environment: development
version: 1.0
last_updated: 2026-03-21
---

# Local Memory Agents Playbook

## Purpose
This playbook outlines the heuristics for building agents that learn from their environment using local Mastra Observational Memory. It provides guidelines for implementing agents that can observe their actions, learn from failures, and improve over time without relying on external cloud services.

**Core Philosophy:** Build agents that learn locally and autonomously. Use local model providers for observation and reflection to maintain data sovereignty. Design tools that fail explicitly so agents can learn from their mistakes.

## Table of Contents

- [Purpose](#purpose)
- [Table of Contents](#table-of-contents)
- [Core Principles](#core-principles)
- [Implementation Pattern](#implementation-pattern)
- [Testing the Learning Loop](#testing-the-learning-loop)
- [Verification Checklist](#verification-checklist)
- [Best Practices](#best-practices)
- [Common Pitfalls](#common-pitfalls)
- [References](#references)

## Core Principles

### Data Sovereignty

Always use local model providers (e.g., Ollama) for the **Observer** and **Reflector** to keep memory logs local.

**Why this matters:**
- Privacy: Memory logs never leave your machine
- Control: You own the learning data
- Compliance: Meets data residency requirements
- Cost: No API costs for observation and reflection

**Implementation:**
```typescript
const localModel = {
  provider: 'ollama',
  model: 'llama2:7b'
};

const agent = new Agent({
  model: localModel,
  memory: new Memory({
    observationalMemory: {
      model: localModel  // Local observer
    }
  })
});
```

### Fail-Fast Tools

Tools must return explicit validation errors in the `result/error` pattern. Agents cannot "observe" success if the tool crashes the runtime.

**Why this matters:**
- Observability: Agents can see what went wrong
- Learning: Errors become learning opportunities
- Reliability: Prevents silent failures
- Debugging: Clear error messages aid troubleshooting

**Implementation:**
```typescript
// Bad: Throws exception
const myTool = createTool({
  execute: async ({ inputData }) => {
    if (!inputData.required) {
      throw new Error("Missing required field");
    }
    return { result: processData(inputData) };
  }
});

// Good: Returns error object
const myTool = createTool({
  execute: async ({ inputData }) => {
    if (!inputData.required) {
      return { 
        error: "Missing required field. Please provide 'required' parameter." 
      };
    }
    return { result: processData(inputData) };
  }
});
```

### Aggressive Orientation

Set `messageTokens` thresholds significantly lower for local development (e.g., 500-1000 tokens) than production (30,000) to see results faster.

**Why this matters:**
- Faster feedback: See learning behavior in minutes, not hours
- Easier testing: Can verify learning loops during development
- Better debugging: More frequent observations provide more data points
- Cost savings: Fewer tokens consumed during development

**Implementation:**
```typescript
// Development: Fast learning
const devMemory = new Memory({
  observationalMemory: {
    observation: {
      messageTokens: 500  // Trigger every 500 tokens
    }
  }
});

// Production: Efficient learning
const prodMemory = new Memory({
  observationalMemory: {
    observation: {
      messageTokens: 30000  // Trigger every 30,000 tokens
    }
  }
});
```

## Implementation Pattern

### Basic Setup

```typescript
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/core/memory';

const localModel = {
  provider: 'ollama',
  model: 'llama2:7b'
};

const agent = new Agent({
  name: 'Learning Agent',
  model: localModel,
  memory: new Memory({
    storage: localStorage,
    options: {
      observationalMemory: {
        model: localModel,  // The Observer model
        observation: {
          messageTokens: 500,  // Trigger learning quickly
        }
      }
    }
  })
});
```

### Storage Options

Choose the appropriate storage adapter for your use case:

| Storage | Use Case | Pros | Cons |
|---------|----------|------|------|
| **LibSQL** | Local development | Fast, embedded | Limited to single machine |
| **PostgreSQL** | Production | Scalable, reliable | Requires database setup |
| **MongoDB** | Production | Flexible schema | Requires database setup |

**LibSQL Example:**
```typescript
import { createClient } from '@libsql/client';

const client = createClient(':memory:');  // In-memory for testing
// or
const client = createClient('file:local.db');  // Persistent file

const memory = new Memory({
  storage: {
    type: 'libsql',
    client
  }
});
```

**PostgreSQL Example:**
```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const memory = new Memory({
  storage: {
    type: 'postgres',
    pool
  }
});
```

**MongoDB Example:**
```typescript
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);

const memory = new Memory({
  storage: {
    type: 'mongodb',
    client
  }
});
```

### Tool Design for Observability

Tools should be designed to maximize observability:

```typescript
const dataProcessorTool = createTool({
  id: 'data-processor',
  description: 'Processes data with validation',
  inputSchema: z.object({
    data: z.string().describe('The data to process'),
    format: z.enum(['json', 'csv', 'xml']).describe('Output format'),
    validate: z.boolean().optional().describe('Validate before processing')
  }),
  outputSchema: z.object({
    result: z.string().optional(),
    error: z.string().optional(),
    warnings: z.array(z.string()).optional()
  }),
  execute: async ({ inputData }) => {
    // Validate input
    if (!inputData.data) {
      return {
        error: "No data provided. Please provide data to process."
      };
    }

    // Check format
    try {
      if (inputData.format === 'json') {
        JSON.parse(inputData.data);
      }
    } catch (e) {
      return {
        error: `Invalid ${inputData.format} format: ${e.message}`
      };
    }

    // Process with warnings
    const warnings = [];
    if (inputData.data.length > 10000) {
      warnings.push("Large dataset may take time to process");
    }

    return {
      result: processData(inputData.data, inputData.format),
      warnings
    };
  }
});
```

## Testing the Learning Loop

### Step-by-Step Testing Process

To verify an agent is learning:

#### 1. Trigger Failure

Prompt the agent to use a tool with intentionally missing or malformed params.

```typescript
// Test 1: Missing required parameter
const response1 = await agent.generate({
  prompt: "Process this data without specifying the format"
});

// Expected: Tool returns error about missing format
console.log("Response 1:", response1);
```

#### 2. Wait for Reflection

Background memory needs time (or token count) to trigger. In tests, use a low threshold and a 5-10 second sleep.

```typescript
// Wait for observation to be processed
await new Promise(resolve => setTimeout(resolve, 10000));
```

#### 3. Test Recall

Prompt for a similar task. The agent should now prepend the correct prefix or include the missing param discovered in the first attempt.

```typescript
// Test 2: Similar task
const response2 = await agent.generate({
  prompt: "Process this data again"
});

// Expected: Agent now includes format parameter
console.log("Response 2:", response2);
```

### Automated Test Example

```typescript
import { describe, it, expect } from 'bun:test';

describe('Local Memory Agent Learning', () => {
  it('should learn from tool failures', async () => {
    const agent = createLearningAgent();
    
    // First attempt: should fail
    const response1 = await agent.generate({
      prompt: "Process data without format"
    });
    
    expect(response1.error).toBeTruthy();
    
    // Wait for reflection
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Second attempt: should succeed
    const response2 = await agent.generate({
      prompt: "Process data again"
    });
    
    expect(response2.error).toBeFalsy();
    expect(response2.result).toBeTruthy();
  });
});
```

## Verification Checklist

Before deploying a local memory agent, ensure:

### Memory Configuration

- [ ] Does the agent have a dedicated `Memory` instance with `observationalMemory: true`?
- [ ] Is the storage adapter compatible (LibSQL, PG, or MongoDB)?
- [ ] Is the observer model configured to use a local provider?
- [ ] Are the observation thresholds appropriate for the environment?

### Tool Design

- [ ] Are all tools using the `result/error` pattern?
- [ ] Do tools return explicit validation errors?
- [ ] Are error messages descriptive and actionable?
- [ ] Do tools include warnings for non-critical issues?

### Model Requirements

- [ ] Is the model capable of following the observation "thought trace"? (Minimum 1B params, 8B+ recommended)
- [ ] Is the model running locally (Ollama, etc.)?
- [ ] Is the model version pinned for reproducibility?

### Testing

- [ ] Have you tested the learning loop with intentional failures?
- [ ] Have you verified that the agent recalls learned patterns?
- [ ] Have you tested with various failure scenarios?
- [ ] Have you validated memory storage and retrieval?

## Best Practices

### 1. Start with Low Token Thresholds

Begin development with aggressive thresholds (500-1000 tokens) to see learning behavior quickly.

```typescript
const devMemory = new Memory({
  observationalMemory: {
    observation: {
      messageTokens: 500  // Start low
    }
  }
});
```

**Why:** Faster feedback loop during development.

### 2. Use Descriptive Error Messages

Provide clear, actionable error messages that help the agent understand what went wrong.

```typescript
// Good
return {
  error: "Missing 'format' parameter. Please specify one of: json, csv, xml"
};

// Bad
return {
  error: "Invalid input"
};
```

**Why:** Better learning and easier debugging.

### 3. Include Warnings for Non-Critical Issues

Use warnings to inform the agent about potential issues without blocking execution.

```typescript
return {
  result: processData(data),
  warnings: [
    "Large dataset may take time to process",
    "Some fields may be truncated"
  ]
};
```

**Why:** Provides additional context for learning.

### 4. Test Learning Scenarios

Create test cases that verify the agent learns from specific failure patterns.

```typescript
it('learns to include required parameters', async () => {
  // Test implementation
});

it('learns to validate input format', async () => {
  // Test implementation
});
```

**Why:** Ensures learning behavior is reliable.

### 5. Monitor Memory Growth

Track memory usage and implement cleanup strategies for long-running agents.

```typescript
// Periodically clean old observations
const cleanup = async () => {
  const cutoff = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 days
  await memory.deleteObservations({ before: cutoff });
};
```

**Why:** Prevents unbounded memory growth.

### 6. Version Your Models

Pin model versions to ensure reproducible learning behavior.

```typescript
const localModel = {
  provider: 'ollama',
  model: 'llama2:7b',  // Specific version
  version: 'latest'  // Or specific tag
};
```

**Why:** Consistent behavior across deployments.

## Common Pitfalls

### Pitfall 1: Throwing Exceptions Instead of Returning Errors

**Problem:** Tools that throw exceptions prevent agents from observing failures.

**Solution:** Always return error objects.

```typescript
// Bad
if (!input.required) {
  throw new Error("Missing required field");
}

// Good
if (!input.required) {
  return { error: "Missing required field" };
}
```

### Pitfall 2: Using Cloud Models for Observation

**Problem:** Using cloud models for observation violates data sovereignty.

**Solution:** Use local models for observation and reflection.

```typescript
// Bad
const memory = new Memory({
  observationalMemory: {
    model: { provider: 'openai', model: 'gpt-4' }
  }
});

// Good
const memory = new Memory({
  observationalMemory: {
    model: { provider: 'ollama', model: 'llama2:7b' }
  }
});
```

### Pitfall 3: Setting Token Thresholds Too High

**Problem:** High thresholds prevent frequent observations during development.

**Solution:** Use low thresholds for development, higher for production.

```typescript
// Development
messageTokens: 500

// Production
messageTokens: 30000
```

### Pitfall 4: Not Testing Learning Behavior

**Problem:** Assuming learning works without verification.

**Solution:** Create explicit tests for learning scenarios.

```typescript
it('should learn from failures', async () => {
  // Test learning behavior
});
```

### Pitfall 5: Using Insufficient Model Capacity

**Problem:** Small models (<1B params) may not follow observation traces effectively.

**Solution:** Use models with at least 1B params, preferably 8B+.

```typescript
// Minimum
model: 'llama2:7b'  // 7B parameters

// Better
model: 'llama2:13b'  // 13B parameters
```

### Pitfall 6: Ignoring Memory Storage

**Problem:** Not configuring proper storage leads to lost observations.

**Solution:** Always configure appropriate storage for your use case.

```typescript
const memory = new Memory({
  storage: {
    type: 'libsql',  // or postgres, mongodb
    client: dbClient
  }
});
```

## References

- [Mastra Documentation](https://mastra.ai/) – Official Mastra framework documentation
- [Mastra Memory](https://mastra.ai/docs/memory) – Memory and observation documentation
- [Ollama Documentation](https://ollama.ai/) – Local model provider
- [Loading Process Playbook](./loading-process-playbook.md) – Two-step loading process pattern
- [Mastra Agent Playbook](./mastra-agent-playbook.md) – Mastra-specific patterns
- [Agentic SDLC Playbook](./agentic-sdlc.md) – Agent-assisted development practices

---

**Version:** 1.0  
**Last Updated:** 2026-03-21  
**Maintained by:** Mastra Development Team
