# Secure Tool Design & Observational Memory

Building autonomous agents is an exercise in managing trust and blast radius. LLMs do not "run" code; they predict text that frameworks like Mastra convert into function calls. Therefore, the safety of your system is entirely dependent on the boundaries of the tools you provide.

This playbook covers how to design secure tools and leverage Mastra's Observational Memory, especially when paired with capable local models like `lfm2.5-thinking`.

## 1. How Tool Calling Actually Works

Before designing a tool, understand the execution loop:
1. **Schema Translation:** Mastra converts your Zod `inputSchema` into a JSON Schema and appends it to the LLM's system prompt.
2. **Prediction:** If the LLM determines a tool is needed, it stops generating regular text and outputs a JSON payload (e.g., `{"name": "deleteUser", "arguments": {"id": "123"}}`).
3. **Execution:** Mastra intercepts this payload, validates it against your Zod schema, and executes your TypeScript `execute` function.
4. **Return:** The result (or error) is passed back to the LLM as a tool response, allowing it to continue reasoning.

**Key Insight:** The LLM has no concept of consequences. It simply predicts the most likely JSON to fulfill the prompt. If the prompt is ambiguous and the tool is dangerous, catastrophe follows.

## 2. The Danger of "God Tools"

Avoid giving agents raw, unconstrained tools.

- **The Anti-Pattern:** A `bash` tool that executes arbitrary strings on the host OS. `{"name": "bash", "arguments": {"command": "rm -rf /"}}` is just as easy for an LLM to generate as `ls -la`.
- **The Heuristic (Principle of Least Privilege):** If an agent only needs to read git status, give it a `git_status` tool, not a full shell. Narrow tools constrain the LLM's potential actions. If the only tool available is `calculator`, the worst outcome is a wasted API credit.

## 3. Defense in Depth: Sandboxing & Boundaries

If your agent *must* execute code or perform state-mutating actions, enforce strict boundaries at the framework level:

1. **Zod Input Validation:** This is your first line of defense. Restrict inputs via regex, whitelists, or business rules. For example, a `deleteUser` tool's schema should reject the UUID of an `admin` user before the `execute` function even runs.
2. **Ephemeral Sandboxes:** If an agent needs to execute arbitrary code (e.g., a coding agent running tests), run that code inside an isolated Docker container, a WebAssembly (WASM) sandbox, or a dedicated sidecar workspace. If the agent runs a destructive command, it only destroys a disposable environment.
3. **Human-in-the-Loop (HITL):** For critical actions (deploying to production, dropping a database, spending money), the tool's `execute` function should pause and await cryptographic or manual human approval before proceeding.

## 4. Observational Memory & Local Models

Mastra's Observational Memory allows agents to extract insights, preferences, and facts from conversations and tool interactions over time. This creates a persistent, localized context across sessions.

### Why this is powerful with `lfm2.5-thinking`:
- **Local Sovereignty:** Because `lfm2.5-thinking` runs locally via Ollama, you can process highly sensitive data, internal codebase logic, and proprietary business rules without leaking tokens to a cloud provider.
- **Smart Context:** The model can observe its own tool failures. If it tries to use an internal API tool and receives a specific validation error, Mastra's observational memory can store that insight: *"Internal API X requires a Bearer token format."* In future sessions, the agent retrieves this memory and correctly formats the tool call on its first attempt.
- **Continuous Learning:** Instead of prompting the agent with thousands of lines of documentation every time, you allow the agent to build its own contextual "mental model" of the project environment, significantly reducing prompt bloat and increasing reliability.

### The Agentic Workflow
1. Agent observes a recurring pattern or failure.
2. Mastra extracts and stores the observation in local SQLite (`mastra_observational_memory`).
3. On the next session, the agent retrieves relevant memories before acting.
4. The local model (`lfm2.5-thinking`) reasons over this memory to execute safe, constrained tool calls.