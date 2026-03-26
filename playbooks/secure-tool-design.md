---
id: PB-019
title: "Secure Tool Design Playbook"
role: "Build | Review"
infrastructure: [mastra]
last_updated: "2026-03-21"
tags: [playbook]
---

# Secure Tool Design Playbook

## Table of Contents

- [Purpose](#purpose)
- [How Tool Calling Actually Works](#how-tool-calling-actually-works)
  - [The Execution Loop](#the-execution-loop)
  - [Key Insight](#key-insight)
- [The Danger of "God Tools"](#the-danger-of-"god-tools")
  - [The Anti-Pattern](#the-anti-pattern)
  - [The Heuristic: Principle of Least Privilege](#the-heuristic-principle-of-least-privilege)
- [Defense in Depth: Sandboxing & Boundaries](#defense-in-depth-sandboxing-&-boundaries)
  - [Zod Input Validation](#zod-input-validation)
  - [Ephemeral Sandboxes](#ephemeral-sandboxes)
  - [Human-in-the-Loop (HITL)](#human-in-the-loop-hitl)
- [Observational Memory & Local Models](#observational-memory-&-local-models)
  - [Why this is powerful with `lfm2.5-thinking`](#why-this-is-powerful-with-`lfm25-thinking`)
  - [The Agentic Workflow](#the-agentic-workflow)
- [Best Practices](#best-practices)
  - [1. Apply the Principle of Least Privilege](#1-apply-the-principle-of-least-privilege)
  - [2. Validate All Inputs](#2-validate-all-inputs)
  - [3. Use Sandboxes for Code Execution](#3-use-sandboxes-for-code-execution)
  - [4. Require Human Approval for Critical Actions](#4-require-human-approval-for-critical-actions)
  - [5. Leverage Observational Memory](#5-leverage-observational-memory)
  - [6. Use Local Models for Sensitive Data](#6-use-local-models-for-sensitive-data)
  - [7. Monitor and Audit Tool Usage](#7-monitor-and-audit-tool-usage)
  - [8. Implement Rate Limiting](#8-implement-rate-limiting)
- [Common Pitfalls](#common-pitfalls)
  - [Pitfall 1: Creating "God Tools"](#pitfall-1-creating-"god-tools")
  - [Pitfall 2: Skipping Input Validation](#pitfall-2-skipping-input-validation)
  - [Pitfall 3: Executing Code on Host](#pitfall-3-executing-code-on-host)
  - [Pitfall 4: No Human Oversight](#pitfall-4-no-human-oversight)
  - [Pitfall 5: Not Using Observational Memory](#pitfall-5-not-using-observational-memory)
  - [Pitfall 6: Leaking Sensitive Data to Cloud](#pitfall-6-leaking-sensitive-data-to-cloud)
- [References](#references)

## Purpose
This playbook covers how to design secure tools and leverage Mastra's Observational Memory, especially when paired with capable local models like `lfm2.5-thinking`. Building autonomous agents is an exercise in managing trust and blast radius. LLMs do not "run" code; they predict text that frameworks like Mastra convert into function calls. Therefore, the safety of your system is entirely dependent on the boundaries of the tools you provide.

**Core Philosophy:** The safety of your system is entirely dependent on the boundaries of the tools you provide. Design tools with the principle of least privilege, validate inputs rigorously, and leverage observational memory for continuous learning without compromising security.


## How Tool Calling Actually Works

Before designing a tool, understand the execution loop:

### The Execution Loop

1. **Schema Translation:** Mastra converts your Zod `inputSchema` into a JSON Schema and appends it to the LLM's system prompt.
2. **Prediction:** If the LLM determines a tool is needed, it stops generating regular text and outputs a JSON payload (e.g., `{"name": "deleteUser", "arguments": {"id": "123"}}`).
3. **Execution:** Mastra intercepts this payload, validates it against your Zod schema, and executes your TypeScript `execute` function.
4. **Return:** The result (or error) is passed back to the LLM as a tool response, allowing it to continue reasoning.

### Key Insight

The LLM has no concept of consequences. It simply predicts the most likely JSON to fulfill the prompt. If the prompt is ambiguous and the tool is dangerous, catastrophe follows.

**Example:**
```typescript
// The LLM doesn't understand that this is dangerous
{
  "name": "bash",
  "arguments": {
    "command": "rm -rf /"
  }
}
```

**Why this matters:**
- LLMs predict text, not execute code
- They have no understanding of consequences
- Safety depends entirely on tool boundaries
- Ambiguous prompts + dangerous tools = catastrophe

## The Danger of "God Tools"

Avoid giving agents raw, unconstrained tools.

### The Anti-Pattern

A `bash` tool that executes arbitrary strings on the host OS. `{"name": "bash", "arguments": {"command": "rm -rf /"}}` is just as easy for an LLM to generate as `ls -la`.

**Example of dangerous tool:**
```typescript
const bashTool = createTool({
  id: 'bash',
  description: 'Execute any bash command',
  inputSchema: z.object({
    command: z.string()  // No restrictions!
  }),
  execute: async ({ inputData }) => {
    return execSync(inputData.command).toString();
  }
});
```

**Why this is dangerous:**
- Unlimited access to the host system
- No validation or constraints
- Can delete files, steal data, or cause damage
- LLM can generate destructive commands

### The Heuristic: Principle of Least Privilege

If an agent only needs to read git status, give it a `git_status` tool, not a full shell. Narrow tools constrain the LLM's potential actions. If the only tool available is `calculator`, the worst outcome is a wasted API credit.

**Example of safe tool:**
```typescript
const gitStatusTool = createTool({
  id: 'git_status',
  description: 'Get the current git status',
  inputSchema: z.object({
    // No parameters needed - just read status
  }),
  execute: async () => {
    return execSync('git status --porcelain').toString();
  }
});
```

**Benefits:**
- Limited blast radius
- Clear, specific purpose
- Easy to audit and review
- Reduces attack surface

## Defense in Depth: Sandboxing & Boundaries

If your agent *must* execute code or perform state-mutating actions, enforce strict boundaries at the framework level.

### Zod Input Validation

This is your first line of defense. Restrict inputs via regex, whitelists, or business rules. For example, a `deleteUser` tool's schema should reject the UUID of an `admin` user before the `execute` function even runs.

**Example:**
```typescript
const deleteUserTool = createTool({
  id: 'delete_user',
  description: 'Delete a user by ID',
  inputSchema: z.object({
    userId: z.string()
      .uuid()
      .refine(
        (id) => !isAdminUser(id),
        { message: "Cannot delete admin users" }
      )
  }),
  execute: async ({ inputData }) => {
    // By this point, we know userId is valid and not an admin
    await deleteUser(inputData.userId);
    return { success: true };
  }
});
```

**Validation strategies:**
- **Regex patterns:** Restrict input format
- **Whitelists:** Only allow known values
- **Business rules:** Enforce domain constraints
- **Type checking:** Use Zod's built-in types

### Ephemeral Sandboxes

If an agent needs to execute arbitrary code (e.g., a coding agent running tests), run that code inside an isolated Docker container, a WebAssembly (WASM) sandbox, or a dedicated sidecar workspace. If the agent runs a destructive command, it only destroys a disposable environment.

**Docker sandbox example:**
```typescript
const executeCodeTool = createTool({
  id: 'execute_code',
  description: 'Execute code in a sandbox',
  inputSchema: z.object({
    code: z.string(),
    language: z.enum(['python', 'javascript', 'typescript'])
  }),
  execute: async ({ inputData }) => {
    const container = await docker.createContainer({
      Image: 'python:3.11-slim',
      Cmd: ['python', '-c', inputData.code],
      NetworkDisabled: true,  // No network access
      ReadonlyRootfs: true   // Read-only filesystem
    });
    
    await container.start();
    const output = await container.logs();
    await container.remove();
    
    return { output: output.toString() };
  }
});
```

**Sandbox benefits:**
- Isolated execution environment
- No access to host system
- Disposable and reproducible
- Can enforce resource limits

### Human-in-the-Loop (HITL)

For critical actions (deploying to production, dropping a database, spending money), the tool's `execute` function should pause and await cryptographic or manual human approval before proceeding.

**Example:**
```typescript
const deployTool = createTool({
  id: 'deploy',
  description: 'Deploy to production',
  inputSchema: z.object({
    version: z.string(),
    environment: z.enum(['staging', 'production'])
  }),
  execute: async ({ inputData }) => {
    if (inputData.environment === 'production') {
      // Require human approval for production deployments
      const approval = await waitForApproval({
        message: `Deploy version ${inputData.version} to production?`,
        timeout: 300000  // 5 minutes
      });
      
      if (!approval.approved) {
        return { 
          error: "Deployment rejected by human operator" 
        };
      }
    }
    
    // Proceed with deployment
    await deploy(inputData.version, inputData.environment);
    return { success: true };
  }
});
```

**HITL benefits:**
- Human oversight for critical actions
- Prevents catastrophic mistakes
- Provides audit trail
- Enables emergency stops

## Observational Memory & Local Models

Mastra's Observational Memory allows agents to extract insights, preferences, and facts from conversations and tool interactions over time. This creates a persistent, localized context across sessions.

### Why this is powerful with `lfm2.5-thinking`

**Local Sovereignty:**
Because `lfm2.5-thinking` runs locally via Ollama, you can process highly sensitive data, internal codebase logic, and proprietary business rules without leaking tokens to a cloud provider.

**Smart Context:**
The model can observe its own tool failures. If it tries to use an internal API tool and receives a specific validation error, Mastra's observational memory can store that insight: *"Internal API X requires a Bearer token format."* In future sessions, the agent retrieves this memory and correctly formats the tool call on its first attempt.

**Continuous Learning:**
Instead of prompting the agent with thousands of lines of documentation every time, you allow the agent to build its own contextual "mental model" of the project environment, significantly reducing prompt bloat and increasing reliability.

### The Agentic Workflow

1. **Agent observes a recurring pattern or failure.**
   - Agent attempts to use a tool
   - Tool returns a specific error
   - Agent notes the pattern

2. **Mastra extracts and stores the observation in local SQLite (`mastra_observational_memory`).**
   - Error message is analyzed
   - Key insights are extracted
   - Memory is stored with context

3. **On the next session, the agent retrieves relevant memories before acting.**
   - Agent queries memory for relevant context
   - Memories are retrieved and ranked
   - Context is provided to the agent

4. **The local model (`lfm2.5-thinking`) reasons over this memory to execute safe, constrained tool calls.**
   - Agent applies learned patterns
   - Tool calls are formatted correctly
   - Failures are avoided

**Example:**
```typescript
// First session - agent fails
const response1 = await agent.generate({
  prompt: "Call the internal API"
});
// Result: Error - Missing Bearer token

// Memory is stored: "Internal API requires Bearer token"

// Second session - agent succeeds
const response2 = await agent.generate({
  prompt: "Call the internal API"
});
// Result: Success - Agent includes Bearer token from memory
```

## Best Practices

### 1. Apply the Principle of Least Privilege

Give agents only the tools they need, nothing more.

```typescript
// Good: Specific tool
const gitStatusTool = createTool({
  id: 'git_status',
  description: 'Get git status',
  execute: async () => execSync('git status').toString()
});

// Bad: General-purpose tool
const bashTool = createTool({
  id: 'bash',
  description: 'Execute any command',
  execute: async ({ inputData }) => execSync(inputData.command).toString()
});
```

### 2. Validate All Inputs

Use Zod schemas to validate inputs before execution.

```typescript
inputSchema: z.object({
  userId: z.string().uuid(),
  action: z.enum(['read', 'write', 'delete'])
})
```

### 3. Use Sandboxes for Code Execution

Never execute arbitrary code on the host system.

```typescript
// Good: Docker sandbox
const result = await executeInDocker(code);

// Bad: Direct execution
const result = eval(code);
```

### 4. Require Human Approval for Critical Actions

Pause and await approval for dangerous operations.

```typescript
if (isCriticalAction(action)) {
  const approval = await waitForApproval(action);
  if (!approval.approved) {
    return { error: "Action rejected" };
  }
}
```

### 5. Leverage Observational Memory

Let agents learn from their mistakes.

```typescript
const agent = new Agent({
  memory: new Memory({
    observationalMemory: {
      model: localModel,
      observation: {
        messageTokens: 500
      }
    }
  })
});
```

### 6. Use Local Models for Sensitive Data

Keep sensitive data local with models like `lfm2.5-thinking`.

```typescript
const localModel = {
  provider: 'ollama',
  model: 'lfm2.5-thinking'
};
```

### 7. Monitor and Audit Tool Usage

Track which tools are called and with what parameters.

```typescript
const auditLog = {
  tool: toolId,
  parameters: inputData,
  timestamp: Date.now(),
  result: result
};
```

### 8. Implement Rate Limiting

Prevent abuse by limiting tool call frequency.

```typescript
const rateLimiter = new RateLimiter({
  maxCalls: 10,
  windowMs: 60000  // 10 calls per minute
});
```

## Common Pitfalls

### Pitfall 1: Creating "God Tools"

**Problem:** Giving agents unrestricted access to powerful tools.

```typescript
// Bad
const bashTool = createTool({
  id: 'bash',
  execute: async ({ inputData }) => execSync(inputData.command).toString()
});
```

**Solution:** Create specific, constrained tools.

```typescript
// Good
const gitStatusTool = createTool({
  id: 'git_status',
  execute: async () => execSync('git status').toString()
});
```

### Pitfall 2: Skipping Input Validation

**Problem:** Trusting inputs without validation.

```typescript
// Bad
execute: async ({ inputData }) => {
  return deleteUser(inputData.userId);  // No validation!
}
```

**Solution:** Validate all inputs with Zod.

```typescript
// Good
inputSchema: z.object({
  userId: z.string().uuid().refine(id => !isAdmin(id))
})
```

### Pitfall 3: Executing Code on Host

**Problem:** Running arbitrary code on the host system.

```typescript
// Bad
const result = eval(code);
```

**Solution:** Use sandboxes for code execution.

```typescript
// Good
const result = await executeInDocker(code);
```

### Pitfall 4: No Human Oversight

**Problem:** Allowing critical actions without approval.

```typescript
// Bad
execute: async ({ inputData }) => {
  await deployToProduction(inputData.version);
}
```

**Solution:** Require human approval for critical actions.

```typescript
// Good
execute: async ({ inputData }) => {
  const approval = await waitForApproval(inputData);
  if (!approval.approved) {
    return { error: "Rejected" };
  }
  await deployToProduction(inputData.version);
}
```

### Pitfall 5: Not Using Observational Memory

**Problem:** Agents don't learn from their mistakes.

```typescript
// Bad
const agent = new Agent({
  // No memory configuration
});
```

**Solution:** Enable observational memory.

```typescript
// Good
const agent = new Agent({
  memory: new Memory({
    observationalMemory: {
      model: localModel,
      observation: {
        messageTokens: 500
      }
    }
  })
});
```

### Pitfall 6: Leaking Sensitive Data to Cloud

**Problem:** Using cloud models for sensitive data.

```typescript
// Bad
const cloudModel = {
  provider: 'openai',
  model: 'gpt-4'
};
```

**Solution:** Use local models for sensitive data.

```typescript
// Good
const localModel = {
  provider: 'ollama',
  model: 'lfm2.5-thinking'
};
```

## References

- [Mastra Documentation](https://mastra.ai/) – Official Mastra framework documentation
- [Mastra Memory](https://mastra.ai/docs/memory) – Memory and observation documentation
- [Zod Documentation](https://zod.dev/) – Schema validation library
- [Ollama Documentation](https://ollama.ai/) – Local model provider
- [lfm2.5-thinking](https://ollama.ai/library/lfm2.5-thinking) – Local thinking model
- [Loading Process Playbook](./loading-process-playbook.md) – Two-step loading process pattern
- [Mastra Agent Playbook](./mastra-agent-playbook.md) – Mastra-specific patterns
- [Agentic Integrity Playbook](./agentic-integrity-playbook.md) – Ensuring agent outputs are trustworthy
- [Local Memory Agents Playbook](./local-memory-agents.md) – Designing local memory agents

---

**Version:** 1.0  
**Last Updated:** 2026-03-21  
**Maintained by:** PolyVis Development Team
