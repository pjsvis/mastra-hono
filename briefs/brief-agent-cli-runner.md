
Promptimizer

The Promptimizer

The Promotimizer will take any prompt and rewrite that prompt to ensure an optimal LLM output

Existing Prompt Node

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

The Super Rewrite Prompt

Thinking Process

The user wants me to create a set of instructions for producing a highly expertly written prompt based on their research task. The task is about building a CLI runner and chat interface for Mastra agents.

Let me follow the guidelines:

1. Maximize specificity and detail - include all user preferences
2. Fill in unstated but necessary dimensions as open-ended
3. Avoid unwarranted assumptions
4. Use first person
5. Include tables where helpful
6. Headers and formatting - specify expected output format
7. Language - the input is in English
8. Sources - specify if needed

The user has provided:
- Overview of the current problem
- Core objectives (4 main ones)
- Architectural guidelines with directory structure
- Acceptance criteria

I need to transform this into a first-person prompt with instructions for an expert to follow.

Research Instructions: Mastra Agent CLI Runner & Chat Interface Implementation
My Request
I need comprehensive technical guidance and implementation strategy for building a Command-Line Interface (CLI) for Mastra agents. This CLI must enable both single-shot command execution and persistent chat interactions, with dynamic model switching capabilities.

Context & Current State
My team currently requires writing dedicated TypeScript test files or scripts to interact with Mastra agents. This creates significant friction when testing agents interactively, overriding models dynamically, or utilizing agents as composable sub-processes. I want to build a CLI based on patterns established in the Amalfa project that will serve as the primary user-facing interface for the Mastra Agent Forge.

Core Requirements
1. Sub-agent Composability (Single-Shot Mode)
I need agents to be callable from the terminal using standard Unix arguments with the following specifications:

Command pattern: bun run cli agent run <agentName> --prompt "<prompt_text>"
Example use case: bun run cli agent run localMemoryAgent --prompt "Fetch user 123"
This must allow one agent or bash script to spawn another agent as a child process
Follow Unix philosophy: execute once and exit cleanly
2. Interactive Testing (Chat Mode)
I require a REPL (Read-Eval-Print Loop) environment with these characteristics:

Command pattern: bun run cli agent chat <agentName>
Example: bun run cli agent chat localMemoryAgent
Support continuous, multi-turn conversations
This is critical for testing Observational Memory and multi-step tool orchestration
[OPEN-ENDED] I have not specified conversation history persistence, exit commands, or session management details—please provide recommendations on best practices
3. Dynamic Model Switching
I must be able to override the agent's default model via CLI flag:

Flag syntax: --model <provider/model-name>
Example: bun run cli agent chat localMemoryAgent --model openai/gpt-4o
This should work for both run and chat commands
I need support for:
Local models via Ollama
Cloud models via OpenRouter
The override must not require modifying the underlying agent definition in @src/
4. TUI Enhancements (CharmBracelet)
I want to leverage CharmBracelet tools already installed in my environment:

Use gum spin to display progress indicators while the agent is "thinking" or executing tools
Use glow (or equivalent markdown rendering) to format agent output beautifully in the terminal
[OPEN-ENDED] I have not specified other TUI elements (input prompts, colors, layouts)—please suggest appropriate enhancements
Architectural Constraints
Directory Structure
I need the implementation to follow this exact structure from the Amalfa project:

src/cli/
├── index.ts           // CLI entry point and command routing
└── commands/
    ├── run.ts         // Single-shot execution implementation
    └── chat.ts        // Interactive REPL implementation
Technical Specifications
Argument Parser: Use standard util.parseArgs or suggest an alternative if a library is already present in the project
Command Pattern: Implement robust subcommand handling with consistent behavior
Dependency Injection: The CLI must import the global mastra instance from src/mastra/index.ts to access the registry of available agents
Runtime: The project uses Bun (as evidenced by bun run commands)
Deliverables Required
Please provide the following structured information:

Table 1: Implementation Roadmap
Phase	Component	Key Features	Dependencies	Estimated Complexity
1	CLI Foundation	Argument parsing, command routing	util.parseArgs or alternative	[Please assess]
2	Run Command	Single-shot execution, model override	Mastra instance access	[Please assess]
3	Chat Command	REPL loop, conversation state	Run command foundation	[Please assess]
4	TUI Integration	CharmBracelet tools (gum, glow)	External dependencies	[Please assess]
5	Model Provider Support	Ollama + OpenRouter integration	API configurations	[Please assess]
Table 2: Command Specification Matrix
Command	Subcommand	Required Args	Optional Flags	Output Behavior	Exit Strategy
cli agent	run	<agentName>	--prompt, --model	[Please specify]	[Please specify]
cli agent	chat	<agentName>	--model	[Please specify]	[Please specify]
Table 3: Model Provider Configuration
Provider	Connection Method	Model Format	Authentication	Example Models
Ollama	[Please research]	[Please research]	[Please research]	[Please provide]
OpenRouter	[Please research]	[Please research]	[Please research]	[Please provide]
Expected Output Format
Please structure your response with the following sections:

1. Executive Summary
Brief overview of the recommended approach (2-3 paragraphs)
2. Technical Architecture
Detailed breakdown of each file (index.ts, run.ts, chat.ts)
Data flow diagrams or pseudo-code (whichever is clearer)
Key TypeScript interfaces/types needed
3. Implementation Guide
Step-by-step instructions for each component
Code patterns and best practices specific to Bun runtime
Error handling strategies
4. Model Override Mechanism
Detailed explanation of how to dynamically override agent models
Configuration management for Ollama and OpenRouter
Fallback strategies if model unavailable
5. TUI Integration
Specific CharmBracelet command examples
Alternative approaches if CharmBracelet is insufficient
User experience flow diagrams
6. Testing Strategy
How to test single-shot vs. chat modes
Model switching validation
Integration testing approaches
7. Acceptance Criteria Validation
Confirm that each criterion is addressed:

 New src/cli/ directory with Amalfa structure
 run command for single-shot execution
 chat command for multi-turn REPL
 --model flag support in both commands
 Ollama (local) and OpenRouter (cloud) support
 CharmBracelet TUI integration for visual feedback
8. Open Questions & Recommendations
Address any ambiguities I haven't specified:

Session persistence strategy
Error handling for invalid agent names
Model validation before execution
Logging and debugging approaches
Configuration file vs. environment variables
Priority Sources
Please prioritize the following when researching:

Official Documentation:

Bun CLI best practices (bun.sh)
CharmBracelet tools documentation (charm.sh)
Ollama API documentation
OpenRouter API documentation
Code References:

The Amalfa project structure (if accessible, please reference specific patterns)
Existing Mastra agent implementations (to understand the agent interface)
Technical Standards:

Unix philosophy for CLI design
REPL implementation best practices
TypeScript patterns for CLI tools
Additional Context
[UNSPECIFIED] I have not provided:

The current Mastra agent interface/API structure—please make reasonable assumptions or request clarification
Specific error message formats—recommend best practices
Telemetry or analytics requirements—suggest if beneficial
Security considerations for API keys—please address
Performance requirements (response time expectations)—provide general recommendations
Language: Please respond in English.

Depth: This is for an expert development team, so technical depth is preferred over simplification.

