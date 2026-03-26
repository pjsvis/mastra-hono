---
id: PB-026
title: "Vercel Labs Agentic Playbook"
role: "Orchestrate"
infrastructure: [hono, vercel]
last_updated: "2026-03-21"
tags: [playbook]
---

# Vercel Labs Agentic Playbook

## Table of Contents

- [Purpose](#purpose)
- [Core Tools](#core-tools)
  - [Portless (`vercel-labs/portless`)](#portless-`vercel-labsportless`)
  - [Just-Bash (`vercel-labs/just-bash`)](#just-bash-`vercel-labsjust-bash`)
  - [Agent-Browser (`vercel-labs/agent-browser`)](#agent-browser-`vercel-labsagent-browser`)
  - [Dev3000 (`vercel-labs/dev3000`)](#dev3000-`vercel-labsdev3000`)
  - [JSON-Render (`vercel-labs/json-render`)](#json-render-`vercel-labsjson-render`)
- [Strategic Integration with Mastra + Hono](#strategic-integration-with-mastra-+-hono)
- [Best Practices](#best-practices)
  - [1. Use Portless for All Local Services](#1-use-portless-for-all-local-services)
  - [2. Wrap Shell Commands in Just-Bash](#2-wrap-shell-commands-in-just-bash)
  - [3. Use Agent-Browser for Web Data](#3-use-agent-browser-for-web-data)
  - [4. Use Dev3000 for Debugging](#4-use-dev3000-for-debugging)
  - [5. Use JSON-Render for Rich UI](#5-use-json-render-for-rich-ui)
- [Common Pitfalls](#common-pitfalls)
  - [Pitfall 1: Not Using Portless](#pitfall-1-not-using-portless)
  - [Pitfall 2: Running Shell Commands Directly](#pitfall-2-running-shell-commands-directly)
  - [Pitfall 3: Not Using Agent-Browser](#pitfall-3-not-using-agent-browser)
  - [Pitfall 4: Not Capturing Execution Traces](#pitfall-4-not-capturing-execution-traces)
  - [Pitfall 5: Not Using JSON-Render](#pitfall-5-not-using-json-render)
- [References](#references)

## Purpose
This playbook outlines the integration of Vercel Labs' specialized tools into the `mastra-hono` ecosystem. These tools focus on providing stable environments, safe execution, and enhanced capabilities for AI agents. It provides comprehensive guidelines for leveraging Vercel Labs tools to enhance agent capabilities while maintaining security and reliability.

**Core Philosophy:** Use Vercel Labs tools to provide stable environments, safe execution, and enhanced capabilities for AI agents. Integrate these tools with Mastra to create a powerful, secure, and reliable agent development workflow.


## Core Tools

### Portless (`vercel-labs/portless`)

**Purpose:** Replaces traditional port numbers with stable, named `.localhost` URLs.

**Workflow:** Use `portless <name> <command>` to start services.

**Integration:**
- Assign semantic names to your local Mastra tools (e.g., `weather.localhost`)
- Prevents port conflicts in multi-agent or microservice architectures
- Provides agents with stable, descriptive URLs instead of arbitrary port numbers

**Environment:** Local development only

**Example:**
```bash
# Start a Hono API server
portless api bun run src/index.ts

# Service available at http://api.localhost:1355
```

**Benefits:**
- **Stable URLs:** Services always have the same URL
- **No Port Conflicts:** Multiple services can run without conflicts
- **Agent Friendly:** AI agents can be given fixed URLs that persist across restarts
- **Isolation:** Prevents cookie and localStorage clashes between apps

### Just-Bash (`vercel-labs/just-bash`)

**Purpose:** A simulated, secure Bash environment written in TypeScript with an in-memory virtual filesystem.

**Integration:**
- Wrap as a Mastra Tool to give agents terminal capabilities without system risk
- Use `OverlayFs` to allow agents to safely read project files while keeping writes in memory
- Ensures identical agent behavior across different operating systems (macOS, Linux, etc.)

**Security:** Prevents destructive commands like `rm -rf /` from affecting the host.

**Example:**
```typescript
import { Bash } from "just-bash";

const bash = new Bash({
  files: {
    "test.txt": "Hello, World!",
  },
});

const result = await bash.exec("cat test.txt");
console.log(result.stdout); // "Hello, World!"
```

**Benefits:**
- **Sandboxed Execution:** Isolated from the host filesystem and environment
- **Virtual Filesystem:** Supports InMemoryFs, OverlayFs, and MountableFs
- **Resource Limits:** Configurable limits for execution time and depth
- **Cross-Platform:** Identical behavior across different operating systems

### Agent-Browser (`vercel-labs/agent-browser`)

**Purpose:** A browser automation CLI designed specifically for AI agents.

**Integration:**
- Use as a "Web Navigation" tool for Mastra agents
- Simplifies complex browser interactions (logging in, extracting dynamic data) into agent-friendly commands
- Abstracts away the boilerplate of Playwright or Puppeteer

**Example:**
```bash
# Navigate to a page and extract data
agent-browser navigate https://example.com
agent-browser extract ".content"
```

**Benefits:**
- **Agent-Friendly:** Commands designed for AI agents
- **Simplified API:** Abstracts away complex browser automation
- **Dynamic Data:** Extracts dynamic content from web pages
- **Authentication:** Handles login flows automatically

### Dev3000 (`vercel-labs/dev3000`)

**Purpose:** Captures a web application's entire development timeline (logs, network, screenshots) for AI debugging.

**Integration:**
- Provides agents with the context needed to debug their own API calls or tool failures
- Useful for "Self-Healing" agent loops where the agent analyzes its own execution traces

**Example:**
```bash
# Start capturing development timeline
dev3000 start

# Agent can now analyze its own execution traces
dev3000 analyze --last 5m
```

**Benefits:**
- **Complete Timeline:** Captures logs, network, and screenshots
- **Self-Healing:** Enables agents to debug their own failures
- **Context-Rich:** Provides comprehensive debugging information
- **Time-Travel:** Analyze execution traces from any point in time

### JSON-Render (`vercel-labs/json-render`)

**Purpose:** A Generative UI framework for rendering dynamic components from AI-generated JSON.

**Integration:**
- Allow Mastra agents to return structured UI descriptions (e.g., charts, cards) instead of just text
- Pairs with a Hono/React frontend to provide rich, interactive agent responses

**Example:**
```typescript
// Agent returns structured UI description
const response = {
  type: "chart",
  data: {
    labels: ["A", "B", "C"],
    values: [10, 20, 30]
  }
};

// Frontend renders interactive chart
```

**Benefits:**
- **Rich UI:** Agents can generate interactive visualizations
- **Structured Output:** JSON-based UI descriptions
- **Interactive:** Users can interact with generated components
- **Flexible:** Supports various UI components (charts, cards, tables)

## Strategic Integration with Mastra + Hono

1. **Development Environment:** Always run the project via `portless` to ensure that all local services (Hono API, Vector DBs, Agent Runners) have stable, named endpoints that agents can easily reference.

2. **Safe Tooling:** Prioritize `just-bash` for any agent task involving file manipulation or data processing. This minimizes the risk of the agent corrupting the local development state.

3. **Rich Interactions:** Use `json-render` schemas in your Mastra agent outputs to move beyond text-only chat interfaces, allowing for high-fidelity Generative UI.

4. **Web Awareness:** If an agent requires external data not available via API, employ `agent-browser` to allow it to navigate and synthesize information from the live web.

**Example Integration:**
```typescript
import { createTool } from '@mastra/core/tools';
import { Bash } from 'just-bash';

export const safeShellTool = createTool({
  id: 'safe-shell',
  description: 'Execute bash commands safely in a sandbox',
  inputSchema: z.object({
    command: z.string().describe('The bash command to execute')
  }),
  execute: async ({ inputData }) => {
    const bash = new Bash();
    const result = await bash.exec(inputData.command);
    return {
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode
    };
  },
});
```

## Best Practices

### 1. Use Portless for All Local Services

Always use `portless` to start local services.

```bash
# Good
portless api bun run src/index.ts

# Bad
bun run src/index.ts  # Runs on random port
```

**Why:** Provides stable, predictable URLs for agents.

### 2. Wrap Shell Commands in Just-Bash

Always use `just-bash` for shell execution by agents.

```typescript
// Good
const bash = new Bash();
const result = await bash.exec(command);

// Bad
execSync(command);  // Runs on host system
```

**Why:** Provides a safe, sandboxed environment for agent execution.

### 3. Use Agent-Browser for Web Data

Use `agent-browser` when agents need web data.

```bash
# Good
agent-browser navigate https://example.com
agent-browser extract ".content"

# Bad
# Agent tries to fetch and parse HTML manually
```

**Why:** Simplifies web navigation and data extraction for agents.

### 4. Use Dev3000 for Debugging

Use `dev3000` to capture execution traces for debugging.

```bash
# Start capturing
dev3000 start

# Analyze traces
dev3000 analyze --last 5m
```

**Why:** Provides comprehensive debugging information for self-healing.

### 5. Use JSON-Render for Rich UI

Use `json-render` schemas for agent-generated UI.

```typescript
// Good
return {
  type: "chart",
  data: { /* chart data */ }
};

// Bad
return "Here's a chart: [data]"
```

**Why:** Enables rich, interactive UI components from agent outputs.

## Common Pitfalls

### Pitfall 1: Not Using Portless

**Problem:** Services run on random ports, making URLs unpredictable.

```bash
# Bad
bun run src/index.ts  # Runs on random port

# Good
portless api bun run src/index.ts  # Stable URL
```

**Solution:** Always use `portless` for local services.

### Pitfall 2: Running Shell Commands Directly

**Problem:** Agents execute commands directly on the host system.

```typescript
// Bad
execSync(command);  // Runs on host system

// Good
const bash = new Bash();
await bash.exec(command);  // Runs in sandbox
```

**Solution:** Always wrap shell commands in `just-bash`.

### Pitfall 3: Not Using Agent-Browser

**Problem:** Agents try to fetch and parse web data manually.

```bash
# Bad
curl https://example.com | grep pattern

# Good
agent-browser navigate https://example.com
agent-browser extract ".content"
```

**Solution:** Use `agent-browser` for web navigation and data extraction.

### Pitfall 4: Not Capturing Execution Traces

**Problem:** No debugging information when agents fail.

```bash
# Bad
# No tracing when agent fails

# Good
dev3000 start
# Agent runs and fails
dev3000 analyze --last 5m
```

**Solution:** Use `dev3000` to capture execution traces.

### Pitfall 5: Not Using JSON-Render

**Problem:** Agents return text-only responses.

```typescript
// Bad
return "Here's a chart: [data]"

// Good
return {
  type: "chart",
  data: { /* chart data */ }
};
```

**Solution:** Use `json-render` schemas for rich UI components.

## References

- [Portless Documentation](https://github.com/vercel-labs/portless) – Stable localhost URLs
- [Just-Bash Documentation](https://github.com/vercel-labs/just-bash) – Secure Bash sandbox
- [Agent-Browser Documentation](https://github.com/vercel-labs/agent-browser) – Browser automation for agents
- [Dev3000 Documentation](https://github.com/vercel-labs/dev3000) – Development timeline capture
- [JSON-Render Documentation](https://github.com/vercel-labs/json-render) – Generative UI framework
- [Loading Process Playbook](./loading-process-playbook.md) – Two-step loading process pattern
- [Mastra Agent Playbook](./mastra-agent-playbook.md) – Mastra-specific patterns
- [Secure Tool Design Playbook](./secure-tool-design.md) – Designing secure tools for agents

---

**Version:** 1.0  
**Last Updated:** 2026-03-21  
**Maintained by:** PolyVis Development Team
