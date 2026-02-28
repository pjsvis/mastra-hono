TD-ID: td-fa8288
# Brief: Observational Memory Agent (Local)

## Overview
We need to build a new agent inside the Mastra Agent Forge that utilizes a local model (`lfm2.5-thinking` via Ollama) combined with Mastra's **Observational Memory** feature. The goal is to prove out the "Continuous Learning" heuristic where an agent can autonomously learn the constraints and boundaries of its tools without requiring manual prompt engineering for every edge case.

## Objectives
1. **Local AI Native:** The agent must be powered exclusively by the local Ollama model to ensure data sovereignty.
2. **Tool Sandboxing:** The agent will be provided with at least two tools (e.g., a mock API client or a controlled file reader). These tools must implement the **Result/Option Pattern** (gracefully returning errors instead of crashing).
3. **Observational Memory Integration:** Configure Mastra's SQLite-backed observational memory for this agent.
4. **Demonstrable Learning:**
   - The agent attempts a task and fails due to a tool validation error.
   - The agent records an observation (e.g., "Tool X requires a specific format for parameter Y").
   - The agent retries or on the next session correctly formats the input based on its memory.

## Architectural Guidelines
- **Zone strictness:** The agent and tools must be implemented in the `@src/` zone and adhere to our strict type-safety standards (no `any`, no non-null assertions).
- **Graceful Failures:** Tools must return `{ result?: unknown, error?: string }` as per our design heuristics.
- **TDD Setup:** Create a failing test in `tests/` that sets up the scenario (an invalid tool call) and verifies that the agent ultimately produces the correct output using memory.

## Acceptance Criteria
- [ ] The new agent `local-memory-agent` is created in `src/mastra/agents/`.
- [ ] Mastra configuration is updated to enable SQLite observational memory.
- [ ] At least one tool is created with intentional constraints to trigger learning.
- [ ] An automated test proves that the agent can retrieve and utilize its observational memory to succeed at a task it previously failed.

## Reference
See `playbooks/secure-tool-design.md` and `playbooks/design-heuristics.md` for architectural context.