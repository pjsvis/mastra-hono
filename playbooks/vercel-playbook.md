# Vercel Labs Agentic Playbook

This playbook outlines the integration of Vercel Labs' specialized tools into the `mastra-hono` ecosystem. These tools focus on providing stable environments, safe execution, and enhanced capabilities for AI agents.

## Core Tools

### 1. Portless (`vercel-labs/portless`)
**Purpose:** Replaces traditional port numbers with stable, named `.localhost` URLs.
- **Workflow:** Use `portless <name> <command>` to start services.
- **Integration:** 
    - Assign semantic names to your local Mastra tools (e.g., `weather.localhost`).
    - Prevents port conflicts in multi-agent or microservice architectures.
    - Provides agents with stable, descriptive URLs instead of arbitrary port numbers.
- **Environment:** Local development only.

### 2. Just-Bash (`vercel-labs/just-bash`)
**Purpose:** A simulated, secure Bash environment written in TypeScript with an in-memory virtual filesystem.
- **Integration:**
    - Wrap as a Mastra Tool to give agents terminal capabilities without system risk.
    - Use `OverlayFs` to allow agents to safely read project files while keeping writes in memory.
    - Ensures identical agent behavior across different operating systems (macOS, Linux, etc.).
- **Security:** Prevents destructive commands like `rm -rf /` from affecting the host.

### 3. Agent-Browser (`vercel-labs/agent-browser`)
**Purpose:** A browser automation CLI designed specifically for AI agents.
- **Integration:**
    - Use as a "Web Navigation" tool for Mastra agents.
    - Simplifies complex browser interactions (logging in, extracting dynamic data) into agent-friendly commands.
    - Abstracts away the boilerplate of Playwright or Puppeteer.

### 4. Dev3000 (`vercel-labs/dev3000`)
**Purpose:** Captures a web application's entire development timeline (logs, network, screenshots) for AI debugging.
- **Integration:**
    - Provides agents with the context needed to debug their own API calls or tool failures.
    - Useful for "Self-Healing" agent loops where the agent analyzes its own execution traces.

### 5. JSON-Render (`vercel-labs/json-render`)
**Purpose:** A Generative UI framework for rendering dynamic components from AI-generated JSON.
- **Integration:**
    - Allow Mastra agents to return structured UI descriptions (e.g., charts, cards) instead of just text.
    - Pairs with a Hono/React frontend to provide rich, interactive agent responses.

## Strategic Integration with Mastra + Hono

1. **Development Environment:** Always run the project via `portless` to ensure that all local services (Hono API, Vector DBs, Agent Runners) have stable, named endpoints that agents can easily reference.
2. **Safe Tooling:** Prioritize `just-bash` for any agent task involving file manipulation or data processing. This minimizes the risk of the agent corrupting the local development state.
3. **Rich Interactions:** Use `json-render` schemas in your Mastra agent outputs to move beyond text-only chat interfaces, allowing for high-fidelity Generative UI.
4. **Web Awareness:** If an agent requires external data not available via API, employ `agent-browser` to allow it to navigate and synthesize information from the live web.
