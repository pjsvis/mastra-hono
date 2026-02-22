# Brief: Agent CLI Runner & Chat Interface

## Overview
Currently, interacting with our Mastra agents requires writing dedicated TypeScript test files or scripts. This creates friction when trying to test agents interactively, override models on the fly, or utilize agents as composable sub-processes. 

We need to build a Command-Line Interface (CLI) based on the patterns established in the Amalfa project. The CLI will act as the primary user-facing interface for interacting with the Mastra Agent Forge, providing both a "single-shot" command execution mode and a persistent "chat" mode.

## Core Objectives

1. **Sub-agent Composability (Single-Shot Mode):**
   - Agents should be callable from the terminal using standard Unix arguments.
   - Example: `bun run cli agent run localMemoryAgent --prompt "Fetch user 123"`
   - This allows one agent or bash script to spawn another agent as a child process.

2. **Interactive Testing (Chat Mode):**
   - Implement a REPL (Read-Eval-Print Loop) environment for continuous, multi-turn conversations.
   - Example: `bun run cli agent chat localMemoryAgent`
   - This mode is critical for testing things like Observational Memory and multi-step tool orchestration.

3. **Dynamic Model Switching:**
   - The CLI must support an overriding `--model` flag.
   - Example: `bun run cli agent chat localMemoryAgent --model openai/gpt-4o`
   - This allows developers to quickly test if a complex task requires a cloud model or if a cheaper local model (like Ollama) suffices, without modifying the underlying agent definition in `@src/`.

4. **TUI Enhancements (CharmBracelet):**
   - Leverage installed CharmBracelet tools (like `gum` and `glow`) to improve the CLI experience.
   - Use `gum spin` to show progress while the agent is "thinking" or waiting on tool execution.
   - Use `glow` (or equivalent markdown rendering) to format the agent's output beautifully in the terminal.

## Architectural Guidelines

Follow the directory structure and patterns established in the Amalfa project:

```
src/cli/
├── index.ts           // CLI entry point and command routing
└── commands/
    ├── run.ts         // Single-shot execution implementation
    └── chat.ts        // Interactive REPL implementation
```

- **Command Pattern:** Use a robust argument parser (e.g., standard `util.parseArgs` or a library if already present) to handle subcommands consistently.
- **Dependency Injection:** The CLI must import the global `mastra` instance from `src/mastra/index.ts` to access the registry of available agents.

## Acceptance Criteria
- [ ] A new `src/cli/` directory is created following the Amalfa structure.
- [ ] The CLI supports a `run` command that executes a single prompt and exits (Unix philosophy).
- [ ] The CLI supports a `chat` command that initiates a multi-turn REPL loop.
- [ ] Both commands support a `--model` flag that successfully overrides the default model defined in the agent's TypeScript file.
- [ ] We should support local and clpoud models using Ollama and remote models using OpenRouter 
- [ ] The interactive `chat` mode uses CharmBracelet tools (or similar TUI paradigms) to provide visual feedback (spinners) during LLM generation.