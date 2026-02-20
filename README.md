# Mastra Hono - Agent Forge

A production-ready Mastra agent framework with Bun, Hono, and Ollama.

## Quick Start

```bash
bun install
bun run dev
```

Open http://localhost:3000

## Agents

### Research Agent (`research-agent`)

Local AI research assistant powered by Ollama's `lfm2.5-thinking` model.

**Capabilities:**
- Mathematical calculations via calculator tool
- Web searches via DuckDuckGo (no API key required)
- Multi-step reasoning with tool orchestration

**Example queries:**
- "What's 15% of 250 plus 12.5?"
- "Search for the latest developments in AI reasoning models"
- "Calculate the square root of 144, then multiply by 3"

### Weather Agent (`weather-agent`)

Weather information assistant using Groq's Llama 3.3.

**Capabilities:**
- Current weather conditions for any location
- Activity suggestions based on weather
- Translates non-English location names

**Example queries:**
- "What's the weather in Tokyo?"
- "Should I go hiking today in Boulder, CO?"

## Commands

```bash
bun install           # Install dependencies
bun run dev           # Start development server
bun run build         # Build for production
bun run start         # Start production server
bun test              # Run tests
bun run precommit     # Run all pre-commit checks
```

## Linting & Formatting

```bash
bun run lint          # Auto-fix issues
bun run lint:check    # Check without fixing
bun run format        # Format code
bun run typecheck     # Type check only
```

## Project Structure

```
src/
  mastra/
    agents/           # Agent definitions
    tools/            # Reusable tools
    workflows/        # Multi-step workflows
    index.ts          # Mastra configuration
tests/                # Test files
scripts/              # Utility scripts
```

## Environment

Copy `.env.example` to `.env` and add your API keys:

```bash
GROQ_API_KEY=your-api-key
```

## Testing

```bash
bun test              # Run all tests
bun test --watch      # Watch mode
bun test --coverage   # With coverage
```
