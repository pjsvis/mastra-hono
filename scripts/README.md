# MastraCode Environment Variable Management Scripts

This directory contains scripts for managing API keys and environment variables for MastraCode using [Skate](https://github.com/charmbracelet/skate), a secure credential manager.

## Prerequisites

### Install Skate

Skate is required to store and retrieve API keys securely.

```bash
# On macOS
brew install skate

# On Linux
go install github.com/charmbracelet/skate@latest
```

### Store API Keys in Skate

Before using these scripts, store your API keys in Skate:

```bash
skate set OPENAI_API_KEY "your-openai-key-here"
skate set GOOGLE_GENERATIVE_AI_API_KEY "your-google-key-here"
skate set OPENROUTER_API_KEY "your-openrouter-key-here"
```

## Available Scripts

### setup-mastra-env.sh

Sets environment variables in the current shell session from Skate credentials.

**Usage:**
```bash
# For interactive shell sessions (variables persist to subsequent commands)
source scripts/setup-mastra-env.sh

# For npm scripts or child processes (use via npm script)
bun run env:setup

# Direct execution (variables won't persist to parent shell)
bash scripts/setup-mastra-env.sh
```

**What it does:**
- Checks if Skate is installed
- Retrieves API keys from Skate
- Exports them as environment variables for the current shell session
- Provides feedback on which keys were successfully retrieved

**Best for:**
- **Interactive sessions**: Use `source scripts/setup-mastra-env.sh`
- **npm scripts**: Use `bun run env:setup` (variables available within the npm script context)
- **CI/CD pipelines**: Use `bash scripts/setup-mastra-env.sh` or npm script
- **Quick testing**: Any of the above methods

**Important Notes:**
- When running `bun run env:setup`, environment variables are only available within the npm script context
- For variables to persist in your terminal session, always use `source scripts/setup-mastra-env.sh`
- For persistent configuration across sessions, use `bun run env:export` instead

### export-mastra-env.sh

Exports API keys from Skate to a `.env` file for persistent configuration.

**Usage:**
```bash
# Using npm script (recommended)
bun run env:export

# Or run directly
bash scripts/export-mastra-env.sh
```

**What it does:**
- Creates `.env` file if it doesn't exist
- Retrieves API keys from Skate
- Updates or adds entries to `.env` file
- Preserves existing entries in `.env` file

**Best for:**
- Persistent local development environment
- Application configuration
- Version control (if `.env` is excluded from git)

## Supported API Keys

The scripts currently support retrieving the following API keys:

- `OPENAI_API_KEY` - For OpenAI GPT models
- `GOOGLE_GENERATIVE_AI_API_KEY` - For Google's Gemini models
- `OPENROUTER_API_KEY` - For OpenRouter API

## Adding New API Keys

To add support for additional API keys, edit either script and add a new line:

```bash
# In setup-mastra-env.sh
get_skate_key "NEW_API_KEY" "NEW_API_KEY" || true

# In export-mastra-env.sh
export_skate_key "NEW_API_KEY" "NEW_API_KEY" || true
```

## Security Notes

- **Never commit** `.env` files to version control
- `.env` is already included in `.gitignore`
- Skate credentials are encrypted and stored securely
- Scripts handle missing keys gracefully with warnings

## Troubleshooting

### Skate Not Found
```
❌ Skate is not installed. Install with: brew install skate
```
Solution: Install Skate using the instructions in the Prerequisites section.

### Key Not Retrieved
```
⚠ Warning: Could not retrieve OPENAI_API_KEY from Skate
```
Solution: Ensure the key is stored in Skate with the correct name:
```bash
skate ls  # List all stored keys
skate set OPENAI_API_KEY "your-key-here"
```

### Environment Variables Not Persisting
If using `setup-mastra-env.sh`, remember to source the script:
```bash
source scripts/setup-mastra-env.sh  # Correct
bash scripts/setup-mastra-env.sh    # Variables won't persist
```

For persistent configuration, use `export-mastra-env.sh` instead.

## Integration with Development Workflow

### Quick Setup (Recommended)
```bash
# One-time setup using npm script
bun run env:export

# Start development
bun run dev
```

### Session-based Setup
```bash
# Each new terminal session - source the script (variables persist)
source scripts/setup-mastra-env.sh
bun run dev

# Alternative: Use npm script for child processes only
bun run env:setup  # Variables won't persist to parent shell
```

### Shell Integration
Add to your shell profile (`.zshrc`, `.bashrc`, etc.):
```bash
# Source the script directly for environment variables to persist
source ~/path/to/mastra-hono/scripts/setup-mastra-env.sh

# Note: Using npm script in shell profile won't work for persistent variables
# bun run env:setup  # ❌ Don't use this in shell profiles
```

## Related Documentation

- [Skate Documentation](https://github.com/charmbracelet/skate)
- [AGENTS.md](../AGENTS.md) - Mastra project documentation
- [dev-setup-macos-zed.md](../docs/dev-setup-macos-zed.md) - Development setup guide